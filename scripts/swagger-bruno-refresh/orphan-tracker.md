# Orphan Bruno Endpoints

Endpoints discovered in `apps/bruno/carmen-inventory/` whose gateway controller no longer exists.
Resolved at the end of the run via `bun run bruno:sync`.

## List

No orphans found in the R-W chunk (recipe-equipment through workflows). All Bruno endpoints
map to active gateway controllers.

### Notes

- `config/unit-comment/` Bruno files map to the **application** controller
  (`api/:bu_code/unit-comment/:unit_id`) NOT the config controller
  (`api/config/:bu_code/unit-comment`). This is by design — the config controller
  manages predefined comment templates while the application controller handles
  per-unit comments with S3 attachments.
- `recipe-equipment-category/` uses flat file names (e.g. `GET-list.bru`) instead of
  numbered names — created by `bun run bruno:sync` auto-discovery.
- `sql_query/` uses flat file names aligned with the SQL query routes.
