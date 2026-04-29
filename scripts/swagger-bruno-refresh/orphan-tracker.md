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

### Task 6a — inventory (A-N) (2026-04-29)

No orphans found. All `.bru` files in the inventory chunk A-N map to active gateway controllers.

Modules processed:
- `inventory-adjustment/` → `inventory-adjustment.controller.ts` (`api/:bu_code/inventory-adjustment`) — permission key not in seed
- `inventory-transaction/` → `inventory-transaction.controller.ts` (`api/:bu_code/inventory-transaction`) — permission key not in seed; `POST-backfill-zero-cost-layers.bru` is `@ApiExcludeEndpoint(true)` dev-only
- `physical-count/` → `physical-count.controller.ts` (`api/:bu_code/physical-count`) — `physical_count:{view,create,update,delete}`
- `physical-count-comment/` → `physical-count-comment.controller.ts` — `physical_count:{view,update}`
- `physical-count-detail-comment/` → `physical-count-detail-comment.controller.ts` — `physical_count:{view,update}`
- `physical-count-period/` → `physical-count-period.controller.ts` — `physical_count:{view,create,update,delete}`
- `physical-count-period-comment/` → `physical-count-period-comment.controller.ts` — `physical_count:{view,update}`
- `spot-check/` → `spot-check.controller.ts` (`api/:bu_code/spot-check`) — `spot_check:{view,create,update,delete}`
- `spot-check-comment/` → `spot-check-comment.controller.ts` — `spot_check:{view,update}`
- `spot-check-detail-comment/` → `spot-check-detail-comment.controller.ts` — `spot_check:{view,update}`

Notes:
- `inventory-adjustment` and `inventory-transaction` resource keys are absent from `permission-role-map.json`. Marked with `> Permission key not found in seed; review needed.`
- `GET /api/spot-check/pending` and `GET /api/physical-count/pending` have no `bu_code` path param — cross-tenant endpoints.
- `GET-get-products-by-location-id.bru` under `spot-check/` maps to `api/:bu_code/locations/:location_id/products` in the spot-check controller.
