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

### Task 6b — inventory (O-Z) (2026-04-29)

No orphans found. All `.bru` files in the inventory chunk O-Z map to active gateway controllers.

Modules processed:
- `stock-in/` → `stock-in.controller.ts` (`api/:bu_code/stock-in`) — `inventory_management.stock_in:{view,create,update,delete}`
- `stock-in-comment/` → `stock-in-comment.controller.ts` — `inventory_management.stock_in:{view,update}`
- `stock-in-detail-comment/` — comment files → `stock-in-detail-comment.controller.ts`; flat-name files (GET-list, GET-by-id, POST-create, PATCH-update, DELETE-remove) → `stock-in-detail.controller.ts` (`api/:bu_code/stock-in-detail`) — misplaced in folder but gateway routes are active
- `stock-out/` → `stock-out.controller.ts` (`api/:bu_code/stock-out`) — `inventory_management.stock_out:{view,create,update,delete}`
- `stock-out-comment/` → `stock-out-comment.controller.ts` — `inventory_management.stock_out:{view,update}`
- `stock-out-detail-comment/` — comment files → `stock-out-detail-comment.controller.ts`; flat-name files → `stock-out-detail.controller.ts` (`api/:bu_code/stock-out-detail`) — same misplacement pattern as stock-in-detail-comment
- `store-requisition/` → `store-requisition.controller.ts` — `inventory_management.store_requisition:{view,view_all,view_department}`; create/update/delete keys not in seed (marked for review)
- `store-requisition-comment/` → `store-requisition-comment.controller.ts` — `inventory_management.store_requisition:{view}` (with write access for mutations)
- `store-requisition-detail-comment/` → `store-requisition-detail-comment.controller.ts` — same as store-requisition-comment
- `unit-conversion/` → `unit-conversion.controller.ts` (`api/:bu_code/unit`) — permission key not in seed

Notes:
- `store-requisition` create/update/delete permission keys are absent from `permission-role-map.json`. Marked with `> Permission key not found in seed; review needed.`
- `unit-conversion` permission keys are absent from `permission-role-map.json`. Marked with `> Permission key not found in seed; review needed.`
- `GET /api/store-requisition` (01-List) has no `bu_code` path param — cross-tenant endpoint; `bu_code` is a query param filter only.
- Flat-name `.bru` files in `stock-in-detail-comment/` and `stock-out-detail-comment/` folders are misplaced organizationally but map to valid standalone `stock-in-detail` and `stock-out-detail` controllers respectively.

### Task 7a — master-data (A-N) (2026-04-29)

No orphans found. All `.bru` files in the master-data chunk A-N map to active gateway controllers.

Modules processed (16):
- `config-running-code-comment/` → `config-running-code-comment.controller.ts` (`api/:bu_code/config-running-code-comment`) — permission key not in seed
- `credit-term-comment/` → `credit-term-comment.controller.ts` (`api/:bu_code/credit-term-comment`) — permission key not in seed
- `currencies/` → `currencies.controller.ts` (`api/:bu_code/currencies`) — `configuration.currency:view`; ISO endpoint has no bu_code (`GET /api/iso`)
- `currency-comment/` → `currency-comment.controller.ts` (`api/:bu_code/currency-comment`) — permission key not in seed
- `delivery-point-comment/` → `delivery-point-comment.controller.ts` (`api/:bu_code/delivery-point-comment`) — permission key not in seed
- `department/` → `department.controller.ts` (`api/:bu_code/department`) — `configuration.department:view`
- `department-comment/` → `department-comment.controller.ts` (`api/:bu_code/department-comment`) — permission key not in seed
- `dimension-comment/` → `dimension-comment.controller.ts` (`api/:bu_code/dimension-comment`) — permission key not in seed
- `exchange-rate-comment/` → `exchange-rate-comment.controller.ts` (`api/:bu_code/exchange-rate-comment`) — permission key not in seed
- `location-comment/` → `location-comment.controller.ts` (`api/:bu_code/location-comment`) — permission key not in seed
- `locations/` → `locations.controller.ts` (`api/:bu_code/locations`) — `configuration.location:view`; includes product inventory sub-endpoint
- `news/` → `news.controller.ts` (`/api/news`, no bu_code) — permission key not in seed
- `period/` → `period.controller.ts` (`api/:bu_code/period`) — `inventory_management.period_end:view` (list/get) and `inventory_management.period_end:execute` (create/update/delete/generate)
- `period-comment/` → `period-comment.controller.ts` (`api/:bu_code/period-comment`) — permission key not in seed
- `pricelist-comment/` → `pricelist-comment.controller.ts` (`api/:bu_code/pricelist-comment`) — permission key not in seed
- `pricelist-detail-comment/` → `pricelist-detail-comment.controller.ts` (`api/:bu_code/pricelist-detail-comment`) — permission key not in seed

Notes:
- `news` controller is mounted at `/api/news` with no `bu_code` path segment — cross-tenant endpoint.
- 12 of 16 modules are `*-comment` modules following the unified comment pattern from `docs/design-comment-logic.md`.
- `currencies`, `department`, `locations`, `period` overlap conceptually with `config/` folder modules but use different controller paths (master-data context).
- `dimension-comment`, `exchange-rate-comment`, `credit-term-comment`, `pricelist-comment`, `pricelist-detail-comment` parent entities are defined elsewhere; these are comment-side-only endpoints in master-data.
- All `*-comment` permission keys are absent from `permission-role-map.json`. Marked with `> Permission key not found in seed; review needed.`
