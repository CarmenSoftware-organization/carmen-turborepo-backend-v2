# FindById Audit User Enrichment

**Status:** Approved (design)
**Date:** 2026-04-28
**Owner:** Carmen Backend
**Scope:** `apps/backend-gateway` (config, application, platform) findById endpoints

## Goal

Enrich `findById` responses across all `backend-gateway` domains so that each
entity returns a unified `audit` object containing `created_at / updated_at /
deleted_at` plus `created_by / updated_by / deleted_by` objects with both `id`
and resolved human-readable `name`. Names are resolved from the platform
schema's `tb_user` table.

## Non-goals

- Enriching `findAll` / list / create / update / delete endpoints (decorator
  is reusable for them, but not applied in this iteration).
- Tenant-schema endpoints under `apps/micro-business/src/tenant/*`.
- Persistent caching (Redis) — in-memory cache only.
- Wildcard path syntax (`items.*.children`).

## Decisions (from brainstorming)

| Question | Decision |
|---|---|
| Scope | All findById in `backend-gateway` (config + application + platform) |
| Name source | Join `tb_user` on platform schema; `alias_name || username || email` |
| Mechanism | New TCP endpoint at `micro-cluster` (owns `tb_user`) + gateway interceptor + in-memory LRU+TTL cache |
| Output shape | Group into `audit` object with nested `created_by`, `updated_by`, `deleted_by` |
| Activation | Opt-in via `@EnrichAuditUsers({ paths? })` decorator on controller methods |
| Unknown user (id present, user not found) | `{ id, name: "Unknown" }` |
| `*_by_id = null` (system action) | `audit.*_by = null` |
| Depth | Opt-in `paths` in decorator (e.g. `['', 'items']`) |

## Architecture

```
Client → backend-gateway → micro-cluster → Platform DB (tb_user)
              ↑
              └── UserResolverInterceptor (global; no-op without decorator)
                    ├── UserNameCacheService (in-memory LRU + TTL)
                    └── UserNameResolverService (TCP → micro-cluster via CLUSTER_SERVICE)
```

### Components

**`micro-cluster` (TCP server side — owns `tb_user`)**

- `UserService.resolveByIds(ids: string[])` (added to existing
  `apps/micro-cluster/src/cluster/user/user.service.ts`) — uses
  `PrismaClient_SYSTEM` from `@repo/prisma-shared-schema-platform` to query
  `tb_user` selecting only `id, alias_name, username, email`. Includes users
  where `deleted_at != null` (so historical references still resolve to a
  name).
- `UserController` (existing) registers a new
  `@MessagePattern({ cmd: 'user.resolveByIds', service: 'user' })`.
- Returns `MicroserviceResponse` whose `data` is
  `{ users: Array<{ id: string; name: string }> }` where
  `name = alias_name || username || email`. Ids that do not exist are simply
  absent from the result array; the gateway treats absence as "unknown".

**`backend-gateway` (HTTP server side)**

- `@EnrichAuditUsers({ paths?: string[] })` — method decorator that stores
  metadata via `SetMetadata`. Default `paths = ['']` (root only).
- `UserResolverInterceptor` — registered as a global `APP_INTERCEPTOR`. No-op
  unless the handler has the decorator.
- `UserNameResolverService` — owns the TCP call; checks cache first; caches
  unknown ids as `null` to avoid repeated lookups.
- `UserNameCacheService` — `Map<string, { value: string|null; expiresAt }>`,
  TTL 60s, max 10,000 entries, simple LRU on overflow.

## Contracts

### Decorator

```ts
// apps/backend-gateway/src/common/decorators/enrich-audit-users.decorator.ts
export const ENRICH_AUDIT_USERS_KEY = 'enrich_audit_users';

export interface EnrichAuditUsersOptions {
  paths?: string[]; // ['', 'items', 'items.attachments'], default ['']
}

export const EnrichAuditUsers = (options: EnrichAuditUsersOptions = {}) =>
  SetMetadata(ENRICH_AUDIT_USERS_KEY, { paths: options.paths ?? [''] });
```

**Path syntax**

- `''` — root payload (object) or each element of root array
- `'items'` — each element of `payload.items[]` (array field) or `payload.items` (object field)
- `'items.attachments'` — each `payload.items[*].attachments[]`
- No wildcards or array indices.

**Usage**

```ts
@Get(':id')
@EnrichAuditUsers()                          // root only
async findById(...) { ... }

@Get(':id')
@EnrichAuditUsers({ paths: ['', 'items'] })  // root + each item
async findByIdWithItems(...) { ... }
```

### TCP message pattern

```ts
// pattern (matches existing { cmd, service } convention used across the codebase)
{ cmd: 'user.resolveByIds', service: 'user' }

// payload (gateway includes ...getGatewayRequestContext() like other calls)
{ ids: string[] }

// response (wrapped in MicroserviceResponse: { response: { status }, data })
data = {
  users: Array<{
    id: string;
    name: string;       // alias_name || username || email
  }>;
}
```

The gateway client uses the existing `'CLUSTER_SERVICE'` `ClientProxy` token
already registered in `apps/backend-gateway/src/app.module.ts`.

### Output shape

**Input from `micro-business`:**

```json
{
  "id": "dept-1",
  "name": "Front Office",
  "created_at": "2026-04-01T10:00:00Z",
  "created_by_id": "u1",
  "updated_at": "2026-04-15T08:30:00Z",
  "updated_by_id": "u2",
  "deleted_at": null,
  "deleted_by_id": null
}
```

**After enrichment:**

```json
{
  "id": "dept-1",
  "name": "Front Office",
  "audit": {
    "created_at": "2026-04-01T10:00:00Z",
    "created_by": { "id": "u1", "name": "John Doe" },
    "updated_at": "2026-04-15T08:30:00Z",
    "updated_by": { "id": "u2", "name": "Jane Smith" },
    "deleted_at": null,
    "deleted_by": null
  }
}
```

**Transformation rules**

| Source | Result |
|---|---|
| `created_at`, `updated_at`, `deleted_at` | move into `audit.*_at` |
| `*_by_id = "uuid"` resolved | `audit.*_by = { id, name }` |
| `*_by_id = "uuid"` not resolved | `audit.*_by = { id, name: "Unknown" }` |
| `*_by_id = null` (system action) | `audit.*_by = null` |
| `*_at = null` but `*_by_id != null` | `audit.*_at = null`, `audit.*_by = { id, name }` |
| Both `null` | `audit.*_at = null`, `audit.*_by = null` |
| Original `created_by_id, updated_by_id, deleted_by_id, created_at, updated_at, deleted_at` fields | removed from output |
| Object has none of the six audit fields | no `audit` field added (do not pollute payload) |

## Implementation

### UserResolverInterceptor

```ts
// apps/backend-gateway/src/common/interceptors/user-resolver.interceptor.ts
@Injectable()
export class UserResolverInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly resolver: UserNameResolverService,
  ) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const meta = this.reflector.get<EnrichAuditUsersOptions>(
      ENRICH_AUDIT_USERS_KEY,
      ctx.getHandler(),
    );
    if (!meta) return next.handle();

    return next.handle().pipe(
      switchMap(async (response) => {
        try {
          const payload = unwrapDataEnvelope(response); // handles { data, status, success, ... }
          if (payload == null) return response;

          const targets = collectTargetsByPaths(payload, meta.paths!);
          if (targets.length === 0) return response;

          const ids = uniqueAuditUserIds(targets);
          const nameMap = await this.resolver.resolveMany(ids);

          for (const target of targets) {
            mutateToAuditShape(target, nameMap);
          }
          return response;
        } catch (err) {
          this.logger.warn({ err }, 'audit user enrichment failed; returning original response');
          return response;
        }
      }),
    );
  }
}
```

**Wiring** in `apps/backend-gateway/src/app.module.ts`:

```ts
{ provide: APP_INTERCEPTOR, useClass: UserResolverInterceptor }
```

Order of global interceptors:

1. `GatewayRequestContextInterceptor` (existing)
2. `ZodSerializerInterceptor` (existing)
3. `UserResolverInterceptor` (new) — last, so it transforms after serialization

### UserNameResolverService

```ts
@Injectable()
export class UserNameResolverService {
  constructor(
    @Inject('CLUSTER_SERVICE') private readonly client: ClientProxy,
    private readonly cache: UserNameCacheService,
  ) {}

  async resolveMany(ids: string[]): Promise<Map<string, string | null>> {
    const result = new Map<string, string | null>();
    const missing: string[] = [];

    for (const id of ids) {
      const cached = this.cache.get(id);
      if (cached !== undefined) {
        result.set(id, cached);
      } else {
        missing.push(id);
      }
    }

    if (missing.length > 0) {
      try {
        const resp = await firstValueFrom(
          this.client.send<MicroserviceResponse>(
            { cmd: 'user.resolveByIds', service: 'user' },
            { ids: missing, ...getGatewayRequestContext() },
          ),
        );

        const users = (resp?.data as { users?: Array<{ id: string; name: string }> })?.users ?? [];
        const found = new Set<string>();
        for (const u of users) {
          this.cache.set(u.id, u.name);
          result.set(u.id, u.name);
          found.add(u.id);
        }
        for (const id of missing) {
          if (!found.has(id)) {
            this.cache.set(id, null);
            result.set(id, null);
          }
        }
      } catch (err) {
        this.logger.warn({ err, count: missing.length }, 'user.resolveByIds failed; treating ids as unknown');
        for (const id of missing) result.set(id, null);
      }
    }
    return result;
  }
}
```

`mutateToAuditShape` converts `null` (unknown) into `{ id, name: "Unknown" }`
per the rules above.

### UserNameCacheService

```ts
@Injectable()
export class UserNameCacheService {
  private readonly ttlMs = 60_000;
  private readonly maxEntries = 10_000;
  private readonly store = new Map<string, { value: string | null; expiresAt: number }>();

  get(id: string): string | null | undefined {
    const e = this.store.get(id);
    if (!e) return undefined;
    if (e.expiresAt < Date.now()) {
      this.store.delete(id);
      return undefined;
    }
    this.store.delete(id);
    this.store.set(id, e); // LRU touch
    return e.value;
  }

  set(id: string, value: string | null): void {
    if (this.store.size >= this.maxEntries) {
      const oldest = this.store.keys().next().value;
      if (oldest) this.store.delete(oldest);
    }
    this.store.set(id, { value, expiresAt: Date.now() + this.ttlMs });
  }
}
```

### Path collection helper

`collectTargetsByPaths(payload, paths)` returns an array of object references
that should be enriched in-place:

- `''` → `payload` if object; each element if array
- `'items'` → each element of `payload.items[]` if array; `payload.items` if object
- `'items.attachments'` → each `payload.items[*].attachments[]`
- Missing paths are silently skipped.

## Edge cases

| Case | Behavior |
|---|---|
| Response is `null` / `undefined` | return as-is |
| Path missing on response | skip path |
| Object in path has no audit fields | do not add `audit` key |
| Some audit fields present | add `audit`, fill missing as `null` |
| Wrapper envelope `{ data, status, success, message, timestamp }` | unwrap → enrich `data` → return wrapper |
| Root is an array | iterate each element |
| User soft-deleted (`tb_user.deleted_at != null`) | still resolved (resolver does not filter on `deleted_at`) |
| Same `id` appears in multiple positions | dedupe before TCP call |
| `ids` empty after dedupe | skip TCP call |
| TCP timeout / connection error to `CLUSTER_SERVICE` | log warn, all become `{ id, name: "Unknown" }` |
| Resolver throws | catch, fallback as above |
| Helper crash (e.g. circular ref) | catch, return original response untouched |

**Principle:** enrichment must never fail the request — degrade gracefully.

## Swagger / DTO impact

Each controller using `@EnrichAuditUsers()` must update its response DTO.

```ts
// shared-dto: AuditUserDto / AuditDto
export class AuditUserDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
}

export class AuditDto {
  @ApiProperty({ type: String, format: 'date-time', nullable: true }) created_at: string | null;
  @ApiProperty({ type: AuditUserDto, nullable: true }) created_by: AuditUserDto | null;
  @ApiProperty({ type: String, format: 'date-time', nullable: true }) updated_at: string | null;
  @ApiProperty({ type: AuditUserDto, nullable: true }) updated_by: AuditUserDto | null;
  @ApiProperty({ type: String, format: 'date-time', nullable: true }) deleted_at: string | null;
  @ApiProperty({ type: AuditUserDto, nullable: true }) deleted_by: AuditUserDto | null;
}
```

Each entity DTO swaps:

```
created_at, created_by_id, updated_at, updated_by_id, deleted_at, deleted_by_id
```

for:

```
audit: AuditDto
```

Bruno example responses under `apps/bruno/carmen-inventory/` must be updated
per endpoint as part of each controller's rollout.

## Migration / rollout plan

This is a **breaking change** to response shapes for endpoints that opt-in.
Because the decorator is opt-in, rollout is incremental and reversible.

1. **Sprint 1** — Build infrastructure:
   - Add `resolveByIds` to existing `UserService` + `@MessagePattern` in `micro-cluster` (`apps/micro-cluster/src/cluster/user/`)
   - `@EnrichAuditUsers` decorator
   - `UserResolverInterceptor`, `UserNameResolverService`, `UserNameCacheService`
   - Unit + e2e tests
   - Apply to one pilot endpoint (e.g. `config_departments.findById`) and update its DTO + Bruno
2. **Sprint 2+** — Enable on `config/*` findById endpoints in groups; update DTOs + Bruno per group.
3. **Sprint 3+** — `application/*` and `platform/*` findById endpoints.

## Testing

**Unit tests (gateway)**

1. `UserNameCacheService` — get / set / expire / LRU eviction
2. `UserNameResolverService` — cache hit, cache miss, partial hit, unknown id, TCP error fallback
3. `collectTargetsByPaths` — root only, nested array, nested-of-nested, missing path, null safety
4. `mutateToAuditShape` — every transformation rule above (with/without by_id, with/without at, unknown user, system action, dedup)
5. `UserResolverInterceptor` — no decorator → no-op; envelope unwrap; array vs object root; resolver error → graceful fallback

**E2E (gateway)**

- mock `BUSINESS_SERVICE` TCP, hit a real HTTP findById that has the decorator, assert response shape matches the contract.

**Integration (micro-cluster)**

- `UserService.resolveByIds` against test DB: includes deleted users, omits non-existent ids, returns selected `name` priority.

## Out of scope (YAGNI)

- Persistent cache (Redis)
- list / findAll / create / update / delete enrichment
- Tenant-schema endpoints
- Wildcard path syntax
