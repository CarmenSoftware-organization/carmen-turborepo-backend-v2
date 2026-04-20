# Docs Verification Fact Map (working file — deleted at end)

Working contract for sub-project #4. One row per unique fact claimed
by a `_(verify)_` marker. Nothing is resolved until its row is filled.

Total markers enumerated: **8** across **5 files**.
Unique facts: **5**.

## Fact table

| # | Fact (short name) | Locations (file:line) | Check procedure | Result | Action propagated |
|---|---|---|---|---|---|
| 1 | TCP message pattern drift (silent 500s on mismatch) | CLAUDE.md:150; apps/micro-business/README.md:62 | Enumerate `@MessagePattern` names in `apps/micro-business/src/` vs `@Client.send` / `.send({ cmd: ... })` patterns in `apps/backend-gateway/src/`; spot-check 3–5 matches. | (Task 11) | (Task 11) |
| 2 | Prisma `findMany` spread+select conflict | CLAUDE.md:151; apps/micro-business/README.md:64 | Grep `findMany` spread usage in `apps/micro-business/src/`; check Prisma version in root `package.json` (spread+select conflict behavior may have changed in later Prisma). | (Task 11) | (Task 11) |
| 3 | Tenant recipe migration gap | CLAUDE.md:152; packages/prisma-shared-schema-tenant/README.md:42 | `ls packages/prisma-shared-schema-tenant/prisma/migrations/`; look for recipe-table migrations dated post-service-consolidation. Ambiguous → tag rather than delete. | (Task 11) | (Task 11) |
| 4 | Prisma `@db.Timestamptz` requires ISO strings | packages/prisma-shared-schema-platform/README.md:44 | Grep `toISOString\(\)` usage for Prisma writes to `@db.Timestamptz` columns in micro-business; check Prisma docs for current v6 behavior. | (Task 11) | (Task 11) |
| 5 | MessagePattern naming convention `<domain>.<verb>` | apps/micro-business/README.md:33 | `grep -rE '@MessagePattern\(' apps/micro-business/src/` — inspect 5 patterns; confirm naming follows `<domain>.<verb>` shape or identify actual convention. | (Task 11) | (Task 11) |

## Disposition legend (applied in Task 11)

- **Verified accurate** → remove `_(verify)_` / `_(verify against current code)_` marker in every listed location; keep text.
- **Verified wrong** → delete the bullet in every listed location.
- **Ambiguous** → replace `_(verify)_` with `_(stale — needs rewrite)_` in every listed location.
