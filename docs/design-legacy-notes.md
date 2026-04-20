# Legacy Notes — Salvaged Content Pending Verification

This file collects content pulled from deleted legacy docs during the doc
inventory cleanup (sub-project #1, 2026-04-20). Content here is **not**
verified against current code — that happens in sub-project #4.
Treat as "possibly accurate, pending review."

Each section is headed by its source file. Content flagged as "(verify)"
needs explicit review against current implementation before being
promoted to an authoritative doc.

---

## From `PROJECT_DOCUMENTATION.md` (96KB, salvaged 2026-04-20)

> Source: root `PROJECT_DOCUMENTATION.md`, version 1.0, dated 15 February 2026.
> Architecture overview, ERDs, deployment layout, and env config. Much of the
> service topology is already in CLAUDE.md; content below is supplementary
> detail not found elsewhere.

### Technology Stack (verify)

| Category              | Technology                      | Version    |
|-----------------------|---------------------------------|------------|
| Runtime               | Bun                             | 1.2.5      |
| Node.js               | Node.js                         | >= 18      |
| Language              | TypeScript                      | 5.8.2      |
| Main Framework        | NestJS                          | 11.x       |
| Alt Framework         | Elysia (micro-cronjob only)     | Latest     |
| Database ORM          | Prisma                          | 6.19.1     |
| Database              | PostgreSQL                      | —          |
| Monorepo Tool         | Turborepo                       | 2.5.8      |
| Compiler              | SWC                             | 1.13.5     |
| Auth                  | Passport + JWT + Keycloak       | —          |
| WebSocket             | Socket.io                       | —          |
| File Storage          | MinIO (S3-compatible)           | —          |
| Logging               | Winston + Loki                  | —          |
| Error Tracking        | Sentry                          | —          |
| API Docs              | Swagger + Scalar                | —          |
| Containerization      | Docker + Docker Compose         | —          |
| CI/CD                 | GitHub Actions                  | —          |
| Reverse Proxy         | Nginx                           | —          |
| Cache                 | Redis (ioredis)                 | —          |

### micro-business Internal Module Breakdown (verify)

```
micro-business (Port 5020/6020)
|
|-- authen/          --> User authentication, login, token management
|   |-- role/        --> Role definitions (admin, manager, staff, etc.)
|   |-- permission/  --> Fine-grained permission control
|
|-- cluster/         --> Multi-tenant cluster management
|   |-- business-unit/ --> Business unit CRUD & configuration
|
|-- inventory/       --> Inventory operations
|   |-- grn/         --> Goods Received Notes
|   |-- stock-in/    --> Stock intake
|   |-- stock-out/   --> Stock dispatch
|   |-- transfer/    --> Inter-location transfers
|
|-- master/          --> Master data management
|   |-- product/     --> Product catalog
|   |-- vendor/      --> Vendor/supplier management
|   |-- location/    --> Warehouse/store locations
|   |-- currency/    --> Currency configuration
|   |-- unit/        --> Unit of measurement
|
|-- procurement/     --> Purchasing operations
|   |-- purchase-order/   --> PO creation & management
|   |-- purchase-request/ --> PR workflow
|   |-- credit-note/      --> Credit note handling
|
|-- recipe/          --> Recipe/BOM management
|-- license/         --> License & subscription management
|-- log/             --> Activity audit logging
|-- notification/    --> Internal notifications
```

### Platform Database ERD (verify)

Key tables and their fields (as documented Feb 2026):

**tb_cluster**: id (UUID PK), code, name, alias_name, logo_url, is_active, info (JSON), created_at, created_by (FK), updated_by (FK), deleted_at

**tb_business_unit**: id (UUID PK), cluster_id (FK), code, name, alias_name, description, info (JSON), is_hq, is_active, db_connection (VARCHAR — stores tenant DB connection string), config (JSON), created_by (FK), updated_by (FK), deleted_at

**tb_user**: id (UUID PK), username, email, platform_role (ENUM), is_active, is_consent, socket_id, is_online, consent_at, created_at, created_by (FK), updated_by (FK), deleted_at

**tb_application_role**: id (UUID PK), bu_id (FK), name, description, is_active, created_by (FK), updated_by (FK), deleted_at

**tb_permission**: id (UUID PK), resource (VARCHAR), action (VARCHAR), description, created_by (FK), deleted_at

**tb_subscription**: id (UUID PK), cluster_id (FK), sub_number, start_date, end_date, status (ENUM)

**tb_subscription_detail**: id (UUID PK), subscription_id (FK), bu_id (FK), module_id (FK)

**tb_module**: id (UUID PK), name, desc

**tb_user_profile**: id (UUID PK), user_id (FK 1:1), firstname, middlename, lastname, telephone, bio (JSON)

**tb_user_login_session**: id (UUID PK), token (VARCHAR), token_type (ENUM), user_id (FK), expired_on

**tb_password**: id (UUID PK), user_id (FK), hash, is_active, expired_on

**tb_notification** (platform): id (UUID PK), from_user (FK), to_user (FK), type, category, title, message, metadata (JSON), is_read, is_sent

**tb_message_format**: id (UUID PK), name, message, is_email, is_sms, is_in_app

**tb_currency_iso**: id (UUID PK), iso_code, name, symbol

**tb_shot_url**: id (UUID PK), url_token, token, expired_at, receiver_email

**tb_news**: id (UUID PK), title, contents (TEXT), url, image

Junction/association tables: `tb_user_tb_business_unit`, `tb_cluster_user`, `tb_user_tb_application_role`, `tb_application_role_tb_permission`, `tb_business_unit_tb_module`

**Platform Enums (verify)**:
- `enum_platform_role`: super_admin | platform_admin | support_manager | support_staff | security_officer | integration_developer | user
- `enum_cluster_user_role`: admin | user
- `enum_user_business_unit_role`: admin | user
- `enum_subscription_status`: active | inactive | expired
- `enum_token_type`: access_token | refresh_token

**Platform Relationship Summary**:
```
tb_cluster ──< tb_business_unit ──< tb_application_role ──< tb_application_role_tb_permission >>── tb_permission
tb_cluster ──< tb_cluster_user >>── tb_user
tb_cluster ──< tb_subscription ──< tb_subscription_detail
tb_business_unit ──< tb_user_tb_business_unit >>── tb_user
tb_business_unit ──< tb_business_unit_tb_module >>── tb_module
tb_user ── tb_user_profile (1:1)
tb_user ──< tb_password
tb_user ──< tb_user_login_session
tb_user ──< tb_notification (from/to)
tb_user ──< tb_user_tb_application_role >>── tb_application_role
```

### Tenant Database ERD — Master Data (verify)

**tb_product**: id (UUID PK), code, name, local_name, description, category_id (FK), sub_cat_id (FK), item_group_id (FK), unit_id (FK), tax_profile_id (FK), status (ENUM), min_qty, max_qty, min_par, max_par, avg_cost, last_cost, std_cost, dimension (JSON), info (JSON), note, doc_version (INT), created_at, created_by (FK), updated_by (FK), deleted_at

**tb_product_category**: id, code, name, local_name, description, is_active

**tb_product_sub_category**: id, category_id (FK), code, name, is_active

**tb_product_item_group**: id, code, name, is_active

**tb_product_location**: id, product_id (FK), location_id (FK), is_active, bin (VARCHAR)

**tb_product_tb_vendor**: id, product_id (FK), vendor_id (FK), is_primary, vendor_product_code

**tb_unit**: id, code, name, local_name, type (ENUM), is_active

**tb_unit_conversion**: id, from_unit (FK→tb_unit), to_unit (FK→tb_unit), factor (DECIMAL)

**tb_tax_profile**: id, code, name, tax_type (ENUM), tax_rate (DECIMAL), calc_method (ENUM), is_active

**tb_location**: id, code, name, local_name, type (ENUM), description, is_active, dimension (JSON), info (JSON)

**tb_vendor**: id, code, name, local_name, tax_id, credit_term_id (FK), is_active, dimension (JSON), info (JSON)

**tb_vendor_address**: id, vendor_id (FK), type (ENUM), address, city, country

**tb_vendor_contact**: id, vendor_id (FK), name, email, phone

**tb_vendor_business_type**: id, vendor_id (FK), type

**tb_credit_term**: id, code, name, days (INT), is_active

**tb_currency**: id, code, name, symbol, is_default, is_active

**tb_exchange_rate**: id, currency_id (FK), rate (DECIMAL), effective_date

**tb_department**: id, code, name, local_name, is_active

**tb_department_user**: id, dept_id (FK), user_id, is_active

**tb_delivery_point**: id, code, name, is_active

### Tenant Database ERD — Procurement Flow (verify)

**tb_purchase_request (PR)**: id, doc_number, doc_date, doc_status (ENUM), location_id (FK), department_id (FK), delivery_date, workflow_id (FK), remark, dimension (JSON), doc_version (INT), created_by (FK), deleted_at

**tb_purchase_request_detail**: id, purchase_request_id (FK), product_id (FK), unit_id (FK), qty (DECIMAL), remark, dimension (JSON)

**tb_purchase_order (PO)**: id, doc_number, doc_date, doc_status (ENUM), vendor_id (FK), location_id (FK), currency_id (FK), credit_term_id (FK), delivery_date, pr_id (FK→PR), exchange_rate, subtotal, tax_amount, total_amount, workflow_id (FK), dimension (JSON), doc_version (INT), created_by (FK), deleted_at

**tb_purchase_order_detail**: id, purchase_order_id (FK), product_id (FK), unit_id (FK), qty, price, discount, tax_amount, total, pr_detail_id (FK), dimension (JSON)

**tb_good_received_note (GRN)**: id, doc_number, doc_date, type (ENUM), status (ENUM), vendor_id (FK), location_id (FK), po_id (FK), invoice_number, subtotal, tax_amount, total_amount, workflow_id (FK), dimension (JSON), doc_version (INT), created_by (FK), deleted_at

**tb_good_received_note_detail**: id, grn_id (FK), product_id (FK), unit_id (FK), qty, price, po_detail_id (FK), tax_amount, total

**tb_good_received_note_detail_item**: id, grn_detail_id (FK), batch_number, expiry_date, qty — (batch/lot tracking at GRN line level)

**tb_credit_note**: id, doc_number, doc_date, type (ENUM), doc_status (ENUM), vendor_id (FK), location_id (FK), grn_id (FK), reason_id (FK), subtotal, tax_amount, total_amount, workflow_id (FK), created_by (FK), deleted_at

**tb_credit_note_detail**: id, credit_note_id (FK), product_id (FK), unit_id (FK), qty, price, grn_detail_id (FK)

**Procurement flow**: PR → PO → GRN → Credit Note

### Tenant Database ERD — Inventory & Stock (verify)

**tb_inventory_transaction**: id, doc_type (ENUM), doc_id (UUID), doc_number, transaction_date, location_id (FK), created_by (FK), deleted_at

**tb_inventory_transaction_detail**: id, transaction_id (FK), product_id (FK), unit_id (FK), qty, cost, running_qty, running_cost

**tb_stock_in**: id, doc_number, doc_date, doc_status (ENUM), location_id (FK), workflow_id (FK), remark, dimension (JSON), created_by (FK), deleted_at

**tb_stock_in_detail**: id, stock_in_id (FK), product_id (FK), unit_id (FK), qty, cost, remark, dimension (JSON)

**tb_stock_out**: id, doc_number, doc_date, doc_status (ENUM), location_id (FK), workflow_id (FK), remark, dimension (JSON), created_by (FK), deleted_at

**tb_stock_out_detail**: id, stock_out_id (FK), product_id (FK), unit_id (FK), qty, cost, remark, dimension (JSON)

**tb_transfer**: id, doc_number, doc_date, doc_status (ENUM), from_loc_id (FK), to_loc_id (FK), workflow_id (FK), remark, dimension (JSON), created_by (FK), deleted_at

**tb_transfer_detail**: id, transfer_id (FK), product_id (FK), unit_id (FK), qty, cost, remark, dimension (JSON)

**tb_store_requisition**: id, doc_number, doc_date, doc_status (ENUM), from_loc_id (FK), to_loc_id (FK), workflow_id (FK)

**tb_store_requisition_detail**: id, requisition_id (FK), product_id (FK), unit_id (FK), qty

**tb_count_stock**: id, doc_number, count_date, status (ENUM), location_id (FK), type (ENUM), created_by (FK)

**tb_count_stock_detail**: id, count_stock_id (FK), product_id (FK), unit_id (FK), system_qty, count_qty, diff_qty

**tb_spot_check**: id, doc_number, check_date, status (ENUM), method (ENUM), location_id (FK)

**tb_spot_check_detail**: id, spot_check_id (FK), product_id (FK), system_qty, count_qty, diff_qty

### Tenant Database ERD — Pricing, Financial & Config (verify)

**tb_pricelist**: id, doc_number, vendor_id (FK), status (ENUM), effective_date, compare_type (ENUM), created_by (FK)

**tb_pricelist_detail**: id, pricelist_id (FK), product_id (FK), unit_id (FK), price, remark

**tb_request_for_pricing (RFP)**: id, doc_number, vendor_id (FK), status (ENUM), created_by (FK)

**tb_request_for_pricing_detail**: id, rfp_id (FK), product_id (FK), unit_id (FK), qty, price

**tb_extra_cost**: id, doc_number, doc_date, type_id (FK), grn_id (FK), total_amount

**tb_extra_cost_detail**: id, extra_cost_id (FK), grn_detail_id (FK), amount, allocate_type (ENUM)

**tb_jv_header**: id, doc_number, doc_date, status (ENUM), description, created_by (FK)

**tb_jv_detail**: id, jv_header_id (FK), account, debit, credit, description

**tb_period**: id, name, start_date, end_date, status (ENUM), location_id (FK)

**tb_period_snapshot**: id, period_id (FK), product_id (FK), location_id (FK), qty, cost

**Configuration tables**:
- `tb_workflow`: id, name, type (ENUM), config (JSON), is_active
- `tb_config_running_code`: id, doc_type, prefix, running_number (INT), format — (auto-numbering for documents)
- `tb_application_config`: id, key (ENUM), value (JSON)
- `tb_application_user_config`: id, user_id, config (JSON)
- `tb_dimension`: id, name, type (ENUM), is_active
- `tb_dimension_display_in`: id, dimension_id (FK), display_in (ENUM)
- `tb_menu`: id, name, parent_id (FK self-ref), path, icon, seq (INT)
- `tb_attachment`: id, ref_id (UUID), ref_type (VARCHAR), file_name, file_url, file_size (INT)
- `tb_adjustment_type`: id, name, type (ENUM), is_active
- `tb_user_location`: id, user_id, location_id (FK), is_default

### Tenant Key Enums (verify)

| Enum | Values |
|------|--------|
| `enum_doc_status` | draft, pending, approved, rejected, cancelled, closed |
| `enum_purchase_request_doc_status` | draft, pending_approval, approved, rejected, cancelled, closed |
| `enum_purchase_order_doc_status` | draft, pending_approval, approved, rejected, cancelled, partially_received, closed |
| `enum_good_received_note_status` | draft, pending, approved, rejected, cancelled |
| `enum_good_received_note_type` | po_based, non_po |
| `enum_credit_note_type` | return, price_adjustment, damage |
| `enum_credit_note_doc_status` | draft, pending, approved, rejected, cancelled |
| `enum_location_type` | warehouse, store, kitchen, bar |
| `enum_unit_type` | inventory, order, recipe |
| `enum_tax_type` | vat, service_charge, withholding_tax |
| `enum_calculation_method` | inclusive, exclusive |
| `enum_transaction_type` | stock_in, stock_out, transfer_in, transfer_out, grn, adjustment |
| `enum_activity_action` | create, update, delete, approve, reject, cancel, close |
| `enum_count_stock_status` | draft, in_progress, completed, cancelled |
| `enum_spot_check_status` | draft, in_progress, completed |
| `enum_spot_check_method` | random, full |
| `enum_period_status` | open, closed |
| `enum_jv_status` | draft, posted, cancelled |
| `enum_pricelist_status` | draft, active, expired, cancelled |
| `enum_workflow_type` | approval, notification |
| `enum_vendor_address_type` | billing, shipping, both |
| `enum_product_status_type` | active, inactive, discontinued |
| `enum_dimension_type` | text, number, date, select |
| `enum_issue_status` | open, in_progress, resolved, closed |
| `enum_issue_priority` | low, medium, high, critical |

### Database Conventions

- Table prefix: `tb_` for data tables, `enum_` for enum types
- Primary keys: UUID format (`gen_random_uuid()`)
- Naming: snake_case for all columns
- Audit fields: `created_at`, `created_by_id`, `updated_at`, `updated_by_id`, `deleted_at` (soft delete)
- Timestamps with timezone (`@db.Timestamptz`)
- Prisma features enabled: `postgresqlExtensions`, `relationJoins`

### Deployment Architecture (verify)

Production layout (as of Feb 2026):

- Single EC2 instance running Docker Compose
- Nginx reverse proxy:
  - Port 4000 (SSL) → backend-gateway:4010
  - Port 80/443 → Frontend App:3000
  - Port 81 (SSL) → Platform Admin:3001
- Docker network: `carmen-network`

**Production port mapping**:

| Service              | Container TCP | Container HTTP | Host TCP | Host HTTP |
|----------------------|---------------|----------------|----------|-----------|
| backend-gateway      | 4000          | 4001 (HTTPS)   | 4010     | 4011      |
| micro-business       | 5020          | 6020           | 5020     | 6020      |
| micro-file           | 5007          | 6007           | 5007     | 6007      |
| micro-cronjob        | 5012          | 6012           | 5012     | 6012      |
| micro-keycloak-api   | 5013          | 6013           | 5013     | 6013      |
| micro-notification   | 5006          | 6006           | 5006     | 6006      |
| turbo-cache          | 3000          | —              | 3333     | —         |

External services in production stack: PostgreSQL (platform + tenant DBs), MinIO/S3, Redis (cache/session), Keycloak (SSO), Grafana Loki (log aggregation), Sentry (error tracking).

### CI/CD Pipeline (verify)

GitHub Actions pipeline (`.github/workflows/build.yml`):

1. **Phase 1 — Build**: checkout → setup Bun → `bun install` → `turbo run build` (with S3 remote cache)
2. **Phase 2 — Docker Build** (matrix, 6 services in parallel): build image → tag with git SHA + "latest" → push to AWS ECR
3. **Phase 3 — Deploy**: SSH to EC2 → `docker-compose pull` → `docker-compose up -d --remove-orphans` → cleanup dangling images

Docker uses multi-stage builds: BUILDER stage (node:22-bookworm-slim + Bun, compiles to dist/) → RUNNER stage (production-only deps, `bun run start:prod`).

### Environment Variables — Supplementary (verify)

backend-gateway `.env` variables not in CLAUDE.md:

```env
GATEWAY_SERVICE_HOST=localhost
GATEWAY_SERVICE_PORT=4000
GATEWAY_SERVICE_HTTPS_PORT=4001
BUSINESS_SERVICE_HTTP_PORT=6020
FILE_SERVICE_HOST=micro-file
FILE_SERVICE_PORT=5007
FILE_SERVICE_HTTP_PORT=6007
NOTIFICATION_SERVICE_HOST=micro-notification
NOTIFICATION_SERVICE_PORT=5006
NOTIFICATION_SERVICE_HTTP_PORT=6006
CRONJOB_SERVICE_HOST=micro-cronjob
CRONJOB_SERVICE_PORT=5012
KEYCLOAK_API_SERVICE_HOST=micro-keycloak-api
KEYCLOAK_API_SERVICE_PORT=5013
```

micro-file (MinIO) env:

```env
MINIO_ENDPOINT=http://minio-host:9000
MINIO_ACCESS_KEY=access_key
MINIO_SECRET_KEY=secret_key
MINIO_BUCKET_NAME=carmen
```

### API Documentation Endpoints (verify)

- Gateway Swagger: `https://api.domain.com/swagger`
- micro-business Swagger: `http://localhost:6020/swagger`
- micro-notification Swagger: `http://localhost:6006/swagger`
- Uses Scalar UI for interactive testing

Health check endpoints: `http://localhost:4000/health`, `http://localhost:4001/health` (HTTPS), `http://localhost:6020/health`, `http://localhost:6006/health`

Testing tools: Bruno (apps/bruno/), Jest + Supertest (unit/integration), Vitest (prisma-shared-schema-tenant DB tests).

---

## From `PRD.md` (salvaged 2026-04-20)

> Source: root `PRD.md`, dated February 2026. Thai-language PRD.
> Most high-level goals/scope are already covered by CLAUDE.md and README.md.
> Salvaging: success metrics, explicit non-scope, and mock data context.

### Success Metrics (verify)

- System supports minimum 500 concurrent users
- Average API response time ≤ 500 ms
- Error rate < 1%
- Automated test coverage ≥ 80% of core features

### Out of Scope (explicit)

- Frontend UI for end users
- Deep accounting / financial modules
- HRM (Human Resource Management)

### Mock / Seed Data Context (verify)

The reference dataset simulates a 100-room hotel with:
- F&B outlets: Thai kitchen, Chinese kitchen, Western kitchen, bar, spa
- Products: food, beverages, general merchandise, assets
- Services: laundry, housekeeping
- Departments (`tb_department`): IT, HR, housekeeping (แม่บ้าน), Thai kitchen (ครัวไทย), Chinese kitchen (ครัวจีน), Western kitchen (ครัวฝรั่ง)
- Users (`tb_user`): admin, manager, staff roles
- Products (`tb_product`): food, beverages, general goods, assets

This context drives seed/mock data scripts in `packages/prisma-shared-schema-tenant/prisma/seed/` and `prisma/mock/`.

---

## From `WARP.md` (salvaged 2026-04-20)

> Source: root `WARP.md`, dated April 2026. Warp terminal agent instructions.
> Most content duplicates CLAUDE.md. Salvaging only content not found elsewhere.

### Service Architecture Evolution Note (verify)

> Directly from WARP.md, section "Service Architecture Evolution":

The system was originally split into many separate microservices (micro-authen,
micro-cluster, micro-license, micro-tenant-inventory, micro-tenant-master,
micro-tenant-procurement, micro-tenant-recipe). These have been **consolidated
into micro-business** (TCP:5020), which now handles auth, clusters, inventory,
master data, procurement, recipes, logging, and notifications. Separate services
remain for file storage, real-time notifications, Keycloak integration, and cron jobs.

This is important context when reading old issue reports, commit history, or
turbo.json entries that still reference the split services.

### Additional Database Scripts (verify)

WARP.md documents `db:mock` scripts not in CLAUDE.md:

```bash
cd packages/prisma-shared-schema-platform
bun run db:mock   # Generate test/mock data for platform schema

cd packages/prisma-shared-schema-tenant
bun run db:mock   # Generate test/mock data for tenant schema
```

### Test Coverage Command (verify)

```bash
cd apps/micro-business
bun run test:cov   # Run tests with coverage report
```

### Docker Compose Commands (verify)

```bash
# Build and run all services with Docker
docker-compose up --build

# Run specific services only
docker-compose up api-backend-gateway api-micro-business
```

---

## From `cursorrule.cursor` (salvaged 2026-04-20)

> Source: root `cursorrule.cursor`, Cursor IDE rules file. Thai-language.
> Architecture and command sections duplicate CLAUDE.md.
> Salvaging: code convention details and NestJS patterns not fully in CLAUDE.md.

### Additional Code Conventions (verify)

Not captured in CLAUDE.md:

- **JSDoc**: Required for public classes and methods
- **No blank lines inside functions**
- **`const` over `let`** when value is not reassigned
- **Full words over abbreviations** — exceptions: i, j, err, ctx, req, res, next
- **Class size limits**: max 200 statements, 10 public methods, 10 properties per class
- **RO-RO pattern**: Use objects for both input params and return values when reducing param count
- **Single abstraction level** per function
- **Composite types over primitives** — avoid primitive obsession
- **Immutable data**: prefer `readonly` and `as const`
- **SOLID principles** for classes; prefer composition over inheritance
- **Arrow functions** only for simple functions ≤ 3 statements; use named functions for longer ones
- **Boolean-returning functions**: use `isX`, `hasX`, `canX` naming
- **Void-returning functions**: use `executeX`, `saveX` naming pattern

### NestJS Validation Pattern — Workflow States (verify)

From cursorrule.cursor, section "Validation Pattern":

```typescript
// Use discriminatedUnion for workflow state management schemas
z.discriminatedUnion('stage_role', [...])

// Use enum_stage_role from @repo/prisma-shared-schema-tenant for workflow role enums
import { enum_stage_role } from '@repo/prisma-shared-schema-tenant';

// Use createZodDto() from nestjs-zod to create NestJS-compatible DTO classes
import { createZodDto } from 'nestjs-zod';
```

### Common Module Structure (verify)

Each service should have a common/shared module (`@/common`) containing:

```
src/common/
├── config/
├── decorator/
├── dto/          (re-export all via src/common/dto/index.ts)
├── guard/
├── interceptor/
├── notification/
├── service/
├── type/
├── util/
└── validator/
```

### micro-cronjob Service Note (verify)

`micro-cronjob` (TCP:5012, HTTP:6012) uses **Elysia + Bun** (not NestJS).
This is the only non-NestJS service in the stack. It handles scheduled task
execution via dynamic cron job definitions in `apps/micro-cronjob/src/crons/`.

---

## From `PROJECT_ISSUES_REPORT.txt` (salvaged 2026-04-20)

> Source: root `PROJECT_ISSUES_REPORT.txt`, generated 2026-02-22.
> All issues treated as potentially still open pending verification in sub-project #4.

### CRITICAL Issues (verify — may be fixed)

**Issue 1: Tenant Guard Bypass — Security Bug**
- File: `apps/backend-gateway/src/common/guard/tenant-header.guard.ts:51`
- `return true` before validation logic causes tenant validation to be bypassed entirely. Every request passes the guard unconditionally.

**Issue 2: Missing `deleted_by_id` Relations in Prisma Schema (152 fields)**
- Files: `packages/prisma-shared-schema-platform/prisma/schema.prisma`, `packages/prisma-shared-schema-tenant/prisma/schema.prisma`
- Platform schema: 18 fields with `deleted_by_id` but no relation to `tb_user`
- Tenant schema: 134 fields with `deleted_by_id` but no relation to `tb_user`
- No referential integrity; `include: { deleted_by_user }` queries will fail

**Issue 3: turbo.json References Consolidated (Removed) Services**
- File: `turbo.json`
- Still references: `dev:authen`, `dev:cluster`, `dev:license`, `dev:tenant:inventory`, `dev:tenant:master`, `dev:tenant:procurement`, `dev:tenant:recipe` — all consolidated into micro-business
- `prod:base` references `prod:authen`, `prod:cluster` which don't exist → `prod:base` will fail

**Issue 4: Inconsistent Response Format Between Services**
- File: `apps/backend-gateway/src/application/document-management/document-management.service.ts`
- `uploadDocument()` checks `response.response.status` (nested)
- Other methods check `response.status` (flat)
- Error response structure differs between micro-business and micro-file

### HIGH Issues (verify — may be fixed)

**Issue 5: No Error Handling in Microservice TCP Calls**
- All `firstValueFrom()` calls across gateway service files lack try-catch and timeout
- If a microservice goes down, requests hang indefinitely or throw 500 with no context
- Key files: `apps/backend-gateway/src/auth/auth.service.ts` (13+ methods), document-management.service.ts

**Issue 6: ClientsModule Missing Timeout/Retry Config**
- File: `apps/backend-gateway/src/app.module.ts:29-54`
- No `timeout`, `retryAttempts`, or `retryDelay` configured → no circuit breaker behavior

**Issue 7: Prisma Client Race Condition**
- File: `apps/micro-business/src/notification/notification.service.ts:35-38`
- `private prisma: any` typed as `any`
- Constructor calls async `initPrisma()` as fire-and-forget → possible race condition on startup

**Issue 8: Prisma Version Mismatch**
- `micro-cronjob` uses Prisma 6.16.2; all other services use 6.19.1

**Issue 9: Silent Empty Catch Handlers**
- Files: `apps/micro-business/src/notification/notification.service.ts:270`, `apps/micro-notification/src/notification/notification.service.ts:270`
- `.catch(() => {})` silently swallows all errors

### MEDIUM Issues (verify — may be fixed)

- `micro-notification` missing `.env.example`
- `micro-cronjob/.env` uses `localhost` for `NOTIFICATION_SERVICE_HOST` — may cause IPv6 issues
- `micro-file/.env.example` missing `LOG_LEVEL` variable
- `micro-cronjob` and `micro-notification` missing `check-types` script — skipped in `turbo run check-types`
- `NOTIFICATION_SERVICE` and `KEYCLOAK_SERVICE` not registered in gateway's root `app.module.ts` — must be registered per-module, causing duplicate resource registration
- Missing database indexes on audit FK columns (`created_by_id`, `updated_by_id`, `deleted_by_id`) across both schemas — slow queries on these fields
- `micro-notification/package.json` uses `"workspace:*"` for `@repo/prisma-shared-schema-platform` while others use `"*"`

### LOW Issues (verify — may be fixed)

- ~188 `console.log` calls in production code, including sensitive data (Keycloak params logged in `micro-keycloak-api/src/keycloak/keycloak.service.ts:70`)
- ~113 uses of `any` type across codebase, concentrated in micro-keycloak-api and micro-business notification/paginate
- Both `bun.lock` and `package-lock.json` present in repo — ambiguous package manager

---

## From `api-500-errors-investigation.txt` (salvaged 2026-04-20)

> Source: root `api-500-errors-investigation.txt`, dated 2026-02-22, 14 errors documented.
> Salvaging systemic architectural findings only — not the individual bug-by-bug log.

### Systemic Bug Patterns Found (verify — may be fixed)

**Pattern 1: TCP Message Pattern Mismatches (4 of 14 errors)**

A recurring architectural gap: the gateway sends a `cmd` value that does not
match the `@MessagePattern` decorator on the micro-business controller.
The message silently times out, causing a 500 error at the gateway.

Known mismatches as of 2026-02-22:
- `period.findAll` (gateway) vs `inventory-period.findAll` (micro-business) — all 5 CRUD methods affected
- `my-pending.store-requisition.find-all` — handler entirely missing in micro-business
- `get-all-application-roles` (gateway) vs `role.findAll` (micro-business)
- `get-all-application-permissions` (gateway) vs `permission.findAll` (micro-business)

**Root cause**: Services were consolidated from separate microservices into
micro-business, but gateway message pattern strings were not updated to match
the new handler naming convention.

**Pattern 2: `q.findMany()` Spread Conflicts with Explicit `select` (recurring Prisma bug)**

Multiple service files use a paginator helper `q.findMany()` and spread
its result into a `prisma.<table>.findMany()` call alongside an explicit
`select` clause. The spread may include its own `select` or `include` that
conflicts with the manually specified one.

Affected files (as of 2026-02-22):
- `apps/micro-business/src/inventory/physical-count/physical-count.service.ts:150`
- `apps/micro-business/src/inventory/physical-count-period/physical-count-period.service.ts:110`
- `apps/micro-business/src/master/locations/locations.service.ts:132-153` (variant: specialQuery spread)

**Fix pattern**: Do not spread `q.findMany()`; instead use individual properties:
```typescript
{ where: whereClause, select: {...}, skip: q.skip, take: q.take, orderBy: q.orderBy() }
```

**Pattern 3: Missing Property Assignment Before Service Method Call**

In micro-business controllers, after calling `initializePrismaService()`, some
controllers fail to set `userId` and `bu_code` on the service instance before
calling service methods that depend on those properties.

Example fix needed:
```typescript
// After initializePrismaService, before service.findAll():
this.someService.bu_code = payload.tenant_id || payload.bu_code;
this.someService.userId = payload.user_id;
```

**Pattern 4: Unsafe `req['user']` Access**

`extract_header.ts:8` accesses `req['user'].user_id` without optional chaining.
If auth middleware fails to populate `req['user']`, this throws and propagates
as a 500.

Suggested fix: `const user_id = req?.['user']?.user_id ?? null;`

**Pattern 5: Tenant DB Migration Gap**

Recipe-related tables (`tb_recipe`, `tb_recipe_category`, `tb_recipe_cuisines`,
`tb_recipe_equipment`) exist in the Prisma tenant schema but Prisma queries
against them fail for some BUs — likely because tenant databases were not
migrated to include these tables.

Mitigation: verify each tenant BU database has had `prisma migrate deploy`
run against it after adding recipe tables to the schema.
