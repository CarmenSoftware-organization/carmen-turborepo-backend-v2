# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Carmen is a multi-tenant SaaS ERP backend for hotel/procurement management. Built with NestJS microservices in a Turborepo monorepo, using Bun as the package manager.

## Common Commands

```bash
# Setup (install + build shared packages)
bun run setup

# Development
bun run dev                 # All services
bun run dev:base            # Gateway + Business + Keycloak API (most common)
bun run dev:business        # Business service only

# Build
bun run build               # Build all
bun run build:package       # Build shared packages only

# Code quality
bun run lint                # ESLint
bun run format              # Prettier
bun run check-types         # TypeScript type checking

# Database (runs across both platform and tenant schemas)
bun run db:generate         # Generate Prisma clients (required after schema changes)
bun run db:migrate          # Run migrations

# Per-schema database operations
cd packages/prisma-shared-schema-platform
bun run db:generate && bun run db:migrate
bun run db:seed             # Seed platform data
bun run db:seed.permission  # Seed permissions

cd packages/prisma-shared-schema-tenant
bun run db:generate && bun run db:migrate
bun run db:seed             # Seed tenant data
```

### Testing

```bash
# Per service (e.g., micro-business)
cd apps/micro-business
bun run test                # Run tests
bun run test:watch          # Watch mode
bun run test:e2e            # End-to-end tests
```

## Architecture

### Service Topology

The system uses an **API Gateway pattern** with TCP-based microservice communication:

- **backend-gateway** (HTTP:4000, HTTPS:4001) — Single entry point. Routes requests to microservices via NestJS TCP clients. Handles auth (JWT/Keycloak), Swagger docs at `/swagger`, WebSocket at `/ws`.
- **micro-business** (TCP:5020, HTTP:6020) — Consolidated service containing most business logic: auth, clusters, inventory, master data, procurement, recipes, logging, notifications.
- **micro-file** (TCP:5007, HTTP:6007) — File storage.
- **micro-notification** (TCP:5006, HTTP:6006) — Real-time notifications via Socket.io.
- **micro-keycloak-api** (TCP:5013, HTTP:6013) — Keycloak integration.

Each NestJS microservice runs dual ports: TCP for inter-service RPC (`@MessagePattern()`) and HTTP for direct access/health checks.

### Multi-Tenancy via Dual Prisma Schemas

Two separate Prisma schemas, each generating its own client:

- **prisma-shared-schema-platform** (`SYSTEM_DATABASE_URL`) — System-wide: users, clusters, business units, roles, permissions, subscriptions. Imported as `@repo/prisma-shared-schema-platform`.
- **prisma-shared-schema-tenant** — Per-tenant business data: products, inventory, procurement, recipes, vendors, locations. Imported as `@repo/prisma-shared-schema-tenant`.

Both use UUID PKs (`gen_random_uuid()`), soft deletes (`deleted_at`), and audit fields (`created_at`, `created_by_id`, `updated_at`, `updated_by_id`).

### Gateway Routing Pattern

The gateway organizes routes into domain modules under `src/config/`, `src/application/`, and `src/platform/`. Each route module registers a controller that forwards requests to the appropriate microservice via TCP using `ClientsModule.register()`. The gateway applies global exception filters, Zod validation pipes, and auth guards.

### Authentication

Keycloak-based authentication via Passport.js:
- **Keycloak**: Bearer token forwarded to micro-keycloak-api via TCP for validation
- `JWT_SECRET` env var holds the JWT signing secret

Guards are applied at the route level: `KeycloakGuard` → `PermissionGuard` (order matters — PermissionGuard depends on user context set by KeycloakGuard).

### Shared Packages

- **@repo/eslint-config** — Shared ESLint configs (`base`, `nestjs`, `next-js`, `react-internal`)
- **@repo/log-events-library** — Audit logging with interceptors, Zod schemas, file-based writers
- **@repo/prisma-shared-schema-platform** — Platform Prisma client + generated types
- **@repo/prisma-shared-schema-tenant** — Tenant Prisma client + generated types

Shared packages must build before apps. This is handled by Turborepo task dependencies (`build:package` runs before `dev` and `build`).

### Path Aliases

TypeScript path alias `@repo/*` maps to `packages/*/src`. Individual services use `src/*` aliases configured in their own tsconfig.

## Code Conventions

- **Language**: English for code, Thai for documentation
- **Naming**: PascalCase for classes, camelCase for variables/methods, kebab-case for files/folders, UPPERCASE for env vars
- **Functions**: Max 20 statements, early returns, verb-prefixed names (`getUserById`, `validateToken`)
- **Booleans**: Prefixed with `is`/`has`/`can` (`isActive`, `hasError`, `canDelete`)
- **One export per file**
- **Validation**: Zod schemas with `nestjs-zod` for input DTOs; simple TypeScript types for output
- **Avoid**: `any` type, magic numbers, deep nesting
- **Timestamps**: Always use `.toISOString()` when writing `Date` values to Prisma timestamp fields (e.g., `approval_date: date.toISOString()`, not `approval_date: date`). Prisma with PostgreSQL `@db.Timestamptz` columns requires ISO string format.
- **Swagger sync**: When changing a DTO (add/remove/rename fields), always update the corresponding Swagger request/response DTOs, examples, and serializers in the gateway to stay in sync.
- **NestJS modules**: One module per domain/route. Controllers for routing, Services for business logic
- **Testing**: Arrange-Act-Assert pattern, Given-When-Then for acceptance tests

## Environment Setup

Each service needs a `.env` file (copy from `.env.example`). Key variables:
- `SYSTEM_DATABASE_URL` / `SYSTEM_DIRECT_URL` — Platform PostgreSQL connection
- `JWT_SECRET` — JWT signing secret
- Service host/port pairs for inter-service discovery (e.g., `BUSINESS_SERVICE_HOST`, `BUSINESS_SERVICE_PORT`)
- `LOKI_*` — Winston/Loki logging config
- `SMTP_*` — Email configuration
- `SENTRY_DSN` — Error tracking

### Keycloak Configuration (micro-keycloak-api)

- `KEYCLOAK_BASE_URL` — Keycloak server URL (e.g., `http://dev.blueledgers.com:8080`)
- `KEYCLOAK_REALM` — Application realm name
- `KEYCLOAK_CLIENT_ID` — Client ID for user authentication (OIDC Resource Owner Password grant)
- `KEYCLOAK_ADMIN_CLIENT_ID` — Admin client ID (defaults to `admin-cli` if empty)
- `KEYCLOAK_ADMIN_CLIENT_SECRET` — Admin client secret (empty for public `admin-cli` client)
- `KEYCLOAK_ADMIN_USERNAME` — Keycloak **admin** username (NOT a regular user — must have admin access to master realm)
- `KEYCLOAK_ADMIN_PASSWORD` — Keycloak admin password

**Important**: `KEYCLOAK_ADMIN_USERNAME`/`KEYCLOAK_ADMIN_PASSWORD` must be credentials for a Keycloak administrator account (the account used to log into the Keycloak Admin Console), not a regular application user. These are used for Admin API operations: user CRUD, password resets, role/group management, etc.

## Bruno API Collections

API collections for testing are located at `apps/bruno/carmen-inventory/`. Uses Bruno API client with `.bru` file format.

### Structure
- `environments/` — Environment configs (`localhost-4000.bru`, `dev.blueledgers.com-4001.bru`)
- `auth/` — Authentication endpoints (login, logout, refresh, change-password, user-info)
- `auth/login/` — Login variants for different user roles (test, requestor, HOD, purchaser, FC, GM, Owner)
- Domain folders: `stock-in/`, `stock-out/`, `transfer/`, `purchase-request/`, `purchase-order/`, `good-received-note/`, etc.
- `config/` — Configuration endpoints (32 modules)
- `platform/` — Platform management endpoints (8 modules)

### Conventions
- All endpoints include `x-app-id: {{x_app_id}}` header
- Bearer token auth uses `{{access_token}}` environment variable
- Login scripts auto-set `access_token` and `refresh_token` via post-response scripts
- Multi-tenant endpoints use `{{bu_code}}` path parameter
- API response wrapper: `{ data: {...}, status, success, message, timestamp }`

## Build Dependencies

The Turborepo pipeline enforces: `db:generate` → `build:package` → `build`/`dev`. If Prisma clients are missing, run `bun run db:generate`. If shared packages fail to resolve, run `bun run build:package`.
