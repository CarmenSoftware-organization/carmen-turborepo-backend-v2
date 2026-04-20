# Docs Verification Fact Map (working file — deleted at end)

Working contract for sub-project #4. One row per unique fact claimed
by a `_(verify)_` marker. Nothing is resolved until its row is filled.

Total markers enumerated: **8** across **5 files**.
Unique facts: **5**.

## Fact table

| # | Fact (short name) | Locations (file:line) | Check procedure | Result | Action propagated |
|---|---|---|---|---|---|
| 1 | TCP message pattern drift (silent 500s on mismatch) | CLAUDE.md:150; apps/micro-business/README.md:62 | Enumerate `@MessagePattern` names in `apps/micro-business/src/` vs `@Client.send` / `.send({ cmd: ... })` patterns in `apps/backend-gateway/src/`; spot-check 3–5 matches. | Verified accurate — spot-checked `locations.*`, `recipe-category.*`, `role_permission.*` patterns: all match between micro-business and backend-gateway. | Removed `_(verify against current code)_` marker in CLAUDE.md:150 and `_(verify)_` in apps/micro-business/README.md:62. |
| 2 | Prisma `findMany` spread+select conflict | CLAUDE.md:151; apps/micro-business/README.md:64 | Grep `findMany` spread usage in `apps/micro-business/src/`; check Prisma version in root `package.json` (spread+select conflict behavior may have changed in later Prisma). | Verified accurate — `...q.findMany()` spread pattern used in 7+ services (role, permission, currencies, products, purchase-order, good-received-note, transfer); Prisma ^6.19.1 still subject to this conflict. | Removed `_(verify against current code)_` marker in CLAUDE.md:151 and `_(verify)_` in apps/micro-business/README.md:64. |
| 3 | Tenant recipe migration gap | CLAUDE.md:152; packages/prisma-shared-schema-tenant/README.md:42 | `ls packages/prisma-shared-schema-tenant/prisma/migrations/`; look for recipe-table migrations dated post-service-consolidation. Ambiguous → tag rather than delete. | Ambiguous — no recipe-specific migrations found in the 20 migration files; cannot confirm whether gap existed historically or was resolved in the init migration. | Replaced `_(verify against current code)_` with `_(stale — needs rewrite)_` in CLAUDE.md:152; replaced `_(verify)_` with `_(stale — needs rewrite)_` in packages/prisma-shared-schema-tenant/README.md:42. |
| 4 | Prisma `@db.Timestamptz` requires ISO strings | packages/prisma-shared-schema-platform/README.md:44 | Grep `toISOString\(\)` usage for Prisma writes to `@db.Timestamptz` columns in micro-business; check Prisma docs for current v6 behavior. | Verified accurate — platform schema has extensive `@db.Timestamptz(6)` columns; micro-business consistently uses `.toISOString()` for all Prisma timestamp writes (`deleted_at`, `updated_at`, `login_time`, `logout_time`, etc.). | Removed `_(verify)_` marker in packages/prisma-shared-schema-platform/README.md:44. |
| 5 | MessagePattern naming convention `<domain>.<verb>` | apps/micro-business/README.md:33 | `grep -rE '@MessagePattern\(' apps/micro-business/src/` — inspect 5 patterns; confirm naming follows `<domain>.<verb>` shape or identify actual convention. | Verified accurate — patterns use `{ cmd: '<domain>.<verb>', service: '<service>' }` object form; the `cmd` field consistently follows `<domain>.<verb>` naming (e.g. `locations.findOne`, `recipe-category.create`, `role.findAll`). | Removed `_(verify)_` marker in apps/micro-business/README.md:33. |

## Disposition legend (applied in Task 11)

- **Verified accurate** → remove `_(verify)_` / `_(verify against current code)_` marker in every listed location; keep text.
- **Verified wrong** → delete the bullet in every listed location.
- **Ambiguous** → replace `_(verify)_` with `_(stale — needs rewrite)_` in every listed location.
