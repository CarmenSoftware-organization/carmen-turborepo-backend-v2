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

### Task 5 — documents-and-reports (2026-04-29)

No orphans found. All 29 `.bru` files in `documents-and-reports/` map to active gateway controllers:
- `activity-log/` → `apps/backend-gateway/src/application/activity-log/activity-log.controller.ts` (`api/:bu_code/activity-log`)
- `documents/` → `apps/backend-gateway/src/application/document-management/document-management.controller.ts` (`api/:bu_code/documents`)
- `report/` → `apps/backend-gateway/src/application/report/report.controller.ts` (`api/:bu_code/report`)

Permission keys for all three modules are **not found in the BU-level seed** (`permission-role-map.json`). Each `.bru` docs block carries `> Permission key not found in seed; review needed.`
