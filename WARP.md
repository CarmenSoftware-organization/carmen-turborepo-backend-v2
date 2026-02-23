# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a TypeScript Turborepo monorepo for Carmen Software's hotel management backend system. It implements a microservices architecture using NestJS with the following key characteristics:

- **Multi-tenant SaaS platform** supporting hotel/procurement operations
- **Platform/tenant separation** with dedicated Prisma schemas for each
- **API Gateway pattern** with TCP-based inter-service communication
- **Consolidated business service** — most domain logic lives in `micro-business`

## Repository Structure

```
apps/                              # Microservice applications
├── backend-gateway/              # API Gateway (HTTP:4000, HTTPS:4001)
├── micro-business/               # Consolidated business service (TCP:5020, HTTP:6020)
│   └── src/
│       ├── authen/               # Auth, roles, permissions
│       ├── cluster/              # Cluster & business unit management
│       ├── inventory/            # GRN, stock in/out, transfers
│       ├── master/               # Products, vendors, locations, currencies, units
│       ├── procurement/          # Purchase orders, requests, credit notes
│       ├── recipe/               # Recipe management
│       ├── notification/         # Internal notifications
│       ├── log/                  # Activity logging
│       └── tenant/               # Tenant information
├── micro-file/                   # File storage (TCP:5007, HTTP:6007)
├── micro-notification/           # Real-time notifications via Socket.io (TCP:5006, HTTP:6006)
├── micro-keycloak-api/           # Keycloak integration (TCP:5013, HTTP:6013)
├── micro-cronjob/                # Scheduled tasks - Elysia/Bun (TCP:5012, HTTP:6012)
└── bruno/                        # API testing collection

packages/                          # Shared packages
├── eslint-config/                # Shared ESLint configurations (base, nestjs, next-js, react-internal)
├── log-events-library/           # Audit logging (interceptors, Zod schemas, file-based writers)
├── prisma-shared-schema-platform/ # Platform-level database schema & Prisma client
└── prisma-shared-schema-tenant/   # Tenant-level database schema & Prisma client
```

## Development Commands

### Quick Start
```bash
# Install dependencies and build shared packages
bun run setup

# Copy .env.example files for each service you need
cp apps/backend-gateway/.env.example apps/backend-gateway/.env
cp apps/micro-business/.env.example apps/micro-business/.env

# Generate Prisma clients and run migrations
bun run db:generate
bun run db:migrate
```

### Development Workflows
```bash
# Start all microservices in development mode
bun run dev

# Start base services only (gateway + business + keycloak-api) — most common
bun run dev:base

# Start individual services
bun run dev:business

# Build all applications
bun run build

# Build shared packages only (required before apps can build)
bun run build:package

# Run linting across all packages
bun run lint

# Format code
bun run format

# Type checking
bun run check-types
```

### Testing Commands
```bash
# Run tests for a specific service
cd apps/micro-business && bun run test

# Run tests with coverage
cd apps/micro-business && bun run test:cov

# Run tests in watch mode
cd apps/micro-business && bun run test:watch

# Run end-to-end tests
cd apps/micro-business && bun run test:e2e
```

### Database Operations
```bash
# Generate Prisma clients for both schemas
bun run db:generate

# Run database migrations
bun run db:migrate

# Deploy migrations to production
bun run db:deploy

# Per-schema operations
cd packages/prisma-shared-schema-platform
bun run db:generate
bun run db:migrate
bun run db:seed              # Seed platform data
bun run db:seed.permission   # Seed permissions
bun run db:mock              # Generate test data

cd packages/prisma-shared-schema-tenant
bun run db:generate
bun run db:migrate
bun run db:seed              # Seed tenant data
bun run db:mock              # Generate test data
```

### Container Operations
```bash
# Build and run all services with Docker
docker-compose up --build

# Run specific services
docker-compose up api-backend-gateway api-micro-business
```

## Architecture Patterns

### Microservice Communication
- **API Gateway**: Single entry point at port 4000 (HTTP) / 4001 (HTTPS), Swagger docs at `/swagger`
- **TCP Transport**: NestJS `@MessagePattern()` decorators for RPC-style inter-service communication
- **Dual Ports**: Each service runs TCP (inter-service) and HTTP (direct access/health checks)
- **Authentication**: Dual strategy — JWT (Supabase) + Keycloak HTTP Bearer via micro-keycloak-api
- **Authorization**: `KeycloakGuard` → `PermissionGuard` (order matters — PermissionGuard depends on user context)
- **Logging**: Winston with Loki integration via `BackendLogger`
- **Validation**: Zod schemas with `nestjs-zod` for input DTOs

### Database Architecture
- **Platform Schema** (`SYSTEM_DATABASE_URL`): Users, clusters, business units, roles, permissions, subscriptions
- **Tenant Schema**: Business-specific data (products, inventory, procurement, recipes, vendors, locations)
- **Multi-tenancy**: Per-business-unit database connections via `db_connection` JSON field
- **ORM**: Prisma 6.x with generated clients, UUID primary keys, soft deletes (`deleted_at`), audit fields
- **Always run** `bun run db:generate` after schema changes before building

### Service Architecture Evolution
The system was originally split into many separate microservices (micro-authen, micro-cluster, micro-license, micro-tenant-inventory, etc.). These have been consolidated into **micro-business** (TCP:5020), which now handles auth, clusters, inventory, master data, procurement, recipes, logging, and notifications. Separate services remain for file storage, real-time notifications, Keycloak integration, and cron jobs.

## Key Development Patterns

### Gateway Route Modules
The gateway organizes routes into domain modules under `src/config/`, `src/application/`, and `src/platform/`. Each module registers a controller that forwards requests to microservices via `ClientsModule.register()` with TCP transport.

### Working with Prisma Schemas
- Platform schema changes affect user management and core platform features
- Tenant schema changes affect business operations for all tenants
- Always run `db:generate` after schema changes before building
- Use seed scripts for development data, mock scripts for testing

### Environment Configuration
- Each microservice has its own `.env.example` file
- Services discover each other via host/port configuration (e.g., `BUSINESS_SERVICE_HOST`, `BUSINESS_SERVICE_PORT`)
- Key env vars: `SYSTEM_DATABASE_URL`, `SUPABASE_JWT_SECRET`, `LOKI_*`, `SMTP_*`, `SENTRY_DSN`

### Build Pipeline
Turborepo enforces: `db:generate` → `build:package` → `build`/`dev`. If Prisma clients are missing, run `bun run db:generate`. If shared packages fail to resolve, run `bun run build:package`.

## Business Domain Context

This system manages hotel operations including:
- **Multi-property management** (clusters → business units)
- **Department organization** (IT, HR, housekeeping, kitchens: Thai, Chinese, Western)
- **User roles & permissions** (admin, manager, staff with granular RBAC)
- **Product catalog** (food, beverages, general merchandise, assets)
- **Procurement workflows** with approval processes
- **Inventory tracking** across departments
- **Recipe management** for kitchen operations
- **Notification system** for workflow alerts

## Package Manager

This project uses **Bun** as the primary package manager (`packageManager: "bun@1.2.5"`). All commands should use `bun` instead of `npm` or `yarn`.
