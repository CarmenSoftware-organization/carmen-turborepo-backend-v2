# Docs Verification Fact Map (working file — deleted at end)

Working contract for sub-project #4. One row per unique fact claimed
by a `_(verify)_` marker. Nothing is resolved until its row is filled.

## Fact table

| # | Fact (short name) | Locations (file:line) | Check procedure | Result | Action propagated |
|---|---|---|---|---|---|
| 1 | TCP message pattern drift warning (silent 500s on mismatch) | CLAUDE.md:150 | Enumerate @MessagePattern in micro-business vs @Client.send patterns in gateway; spot-check 3–5 matches for naming consistency. | (Task 11 fills) | (Task 11 fills) |
| 2 | Prisma findMany spread+select conflict | CLAUDE.md:151 | Grep findMany spread usage in micro-business; verify Prisma version and test if `{ ...query, select: {...} }` pattern throws. | (Task 11 fills) | (Task 11 fills) |
| 3 | Tenant recipe migration gap | CLAUDE.md:152, packages/prisma-shared-schema-tenant/README.md:42 | `ls packages/prisma-shared-schema-tenant/prisma/migrations/`; look for recipe-related migrations post-consolidation; check if they lag behind master data migrations. | (Task 11 fills) | (Task 11 fills) |
| 4 | Prisma Timestamptz ISO string requirement | packages/prisma-shared-schema-platform/README.md:44 | Grep for `@db.Timestamptz` in platform schema; review a 2–3 write operations in micro-business to confirm `.toISOString()` usage; check if tests pass without it. | (Task 11 fills) | (Task 11 fills) |

**Additional facts discovered during Step 1 enumeration:**

_None — all markers covered by the 4 canonical facts above._

## Notes

- **Total markers enumerated:** 5 hits (4 unique facts across 3 files)
- **Marker types:** 3 x `_(verify against current code)_`, 2 x `_(verify)_`
- **Excluded locations:** All hits under `docs/superpowers/` (spec/plan references only, not actual markers to resolve)
- **No additional markers found** beyond the 4 facts listed above

## Disposition legend (applied in Task 11)

- **Verified accurate** → remove `_(verify)_` marker in every listed location; keep text.
- **Verified wrong** → delete the bullet in every listed location.
- **Ambiguous** → replace `_(verify)_` with `_(stale — needs rewrite)_` in every listed location.
