# Carmen System Architecture

## Overview Diagram

```
                                    USERS (Browser / Mobile)
                                             |
                        +--------------------+--------------------+
                        |                                         |
                        v                                         v
            carmen-inventory-frontend                    carmen-platform
              (Next.js / React)                        (Next.js / React)
                        |                                         |
                        +--------------------+--------------------+
                                             |
                                        HTTPS/REST
                                             |
         ================================================================
         |              DEPLOYMENT ZONE 1: AWS EC2 (Production)         |
         |                                                              |
         |    +------------------------------------------------------+  |
         |    |           backend-gateway (:4000/:4001)               |  |
         |    |        [Auth, Routing, Swagger, WebSocket]            |  |
         |    |      JWT / Keycloak Auth Guards                       |  |
         |    +--+-------+-------+-------+-------+-------+-----------+  |
         |       |       |       |       |       |       |              |
         |      TCP     TCP     TCP     TCP     TCP     TCP             |
         |       |       |       |       |       |       |              |
         |  +----+--+ +--+---+ +--+--+ +-+---+ +--+--+ +--+--------+  |
         |  | micro  | |micro | |micro| |micro| |micro| |  micro    |  |
         |  |business| |key-  | |file | |noti-| |cron-| |  cluster  |  |
         |  | :5020  | |cloak | |:5007| |fica-| | job | |  :5014    |  |
         |  | :6020  | |api   | |:6007| |tion | |:5012| |  :6014    |  |
         |  |        | |:5013 | |     | |:5006| |:6012| |           |  |
         |  |        | |:6013 | |     | |:6006| |     | |           |  |
         |  +--------+ +--+---+ +-----+ +-----+ +-----+ +----------+  |
         |       |         |                                            |
         |       |         |        Docker Compose + ECR Images         |
         ===|====|=========|============================================
            |    |         |
            |    |         v
            |    |    +---------+
            |    |    |Keycloak |  (Identity Provider)
            |    |    |  Server |
            |    |    +---------+
            |    |
            v    v
         +---------------------------+
         |       AWS RDS             |
         |     (PostgreSQL)          |
         |                           |
         |  +---------------------+  |
         |  | Platform Schema     |  |
         |  | - users             |  |
         |  | - clusters          |  |
         |  | - business_units    |  |
         |  | - roles/permissions |  |
         |  | - subscriptions     |  |
         |  +---------------------+  |
         |                           |
         |  +---------------------+  |
         |  | Tenant Schema       |  |
         |  | - products          |  |
         |  | - inventory         |  |
         |  | - procurement       |  |
         |  | - recipes           |  |
         |  | - vendors           |  |
         |  | - locations         |  |
         |  +---------------------+  |
         +---------------------------+


         ================================================================
         |        DEPLOYMENT ZONE 2: VM dev.blueledgers.com (Dev/UAT)   |
         |                                                              |
         |    +------------------------------------------------------+  |
         |    |           backend-gateway (:4000/:4001)               |  |
         |    +--+-------+-------+-------+-------+-------+-----------+  |
         |       |       |       |       |       |       |              |
         |      TCP     TCP     TCP     TCP     TCP     TCP             |
         |       |       |       |       |       |       |              |
         |  +----+--+ +--+---+ +--+--+ +-+---+ +--+--+ +--+--------+  |
         |  | micro  | |micro | |micro| |micro| |micro| |  micro    |  |
         |  |business| |key-  | |file | |noti-| |cron-| |  cluster  |  |
         |  | :5020  | |cloak | |:5007| |fica-| | job | |  :5014    |  |
         |  | :6020  | |api   | |:6007| |tion | |:5012| |  :6014    |  |
         |  |        | |:5013 | |     | |:5006| |:6012| |           |  |
         |  |        | |:6013 | |     | |:6006| |     | |           |  |
         |  +--------+ +------+ +-----+ +-----+ +-----+ +----------+  |
         |                                                              |
         |            Docker Compose (Local Build)                      |
         ================================================================
```

## Service Communication Flow

```
                         HTTP Request
                              |
                              v
                    +-------------------+
                    | backend-gateway   |
                    | - JWT Validation  |
                    | - Keycloak Auth   |
                    | - Permission Guard|
                    | - Route to Service|
                    +--------+----------+
                             |
              +--------------+--------------+
              |    NestJS TCP Transport     |
              |    (@MessagePattern)        |
              +-+----+----+----+----+----+-+
                |    |    |    |    |    |
                v    v    v    v    v    v
        +-------+ +--+ +--+ +--+ +--+ +-------+
        |business| |kc| |fi| |no| |cr| |cluster|
        |        | |  | |le| |ti| |on| |       |
        +---+----+ +--+ +--+ +--+ +--+ +--+---+
            |                              |
            v                              v
     +------+------+               +-------+------+
     |   Prisma    |               |    Prisma    |
     |   Tenant    |               |   Platform   |
     |   Client    |               |    Client    |
     +------+------+               +-------+------+
            |                              |
            +-------------+----------------+
                          |
                          v
                  +-------+--------+
                  |    AWS RDS     |
                  |  (PostgreSQL)  |
                  +----------------+
```

## Deployment Pipeline

```
  Developer
      |
      v
  Git Push
      |
      v
  +---+---+
  | Build |  bun install -> db:generate -> build:package -> build
  +---+---+
      |
      +-------------------+
      |                   |
      v                   v
  Production          Dev/UAT
  (AWS EC2)           (dev.blueledgers.com)
      |                   |
      v                   v
  Docker Build        Docker Build
  Push to ECR         Local Images
      |                   |
      v                   v
  docker-compose      docker-compose
  .yml (pull ECR)     .dev.yml (build)
      |                   |
      v                   v
  Services UP         Services UP
```

## Port Mapping

| Service              | TCP (Internal) | HTTP (Direct) | Description                    |
|----------------------|----------------|---------------|--------------------------------|
| backend-gateway      | -              | 4000 / 4001   | HTTP / HTTPS entry point       |
| micro-business       | 5020           | 6020          | Core business logic            |
| micro-keycloak-api   | 5013           | 6013          | Keycloak integration           |
| micro-file           | 5007           | 6007          | File storage                   |
| micro-notification   | 5006           | 6006          | Real-time notifications        |
| micro-cronjob        | 5012           | 6012          | Scheduled tasks                |
| micro-cluster        | 5014           | 6014          | Cluster management             |

## Tech Stack

| Layer        | Technology                                      |
|--------------|--------------------------------------------------|
| Runtime      | Node.js 22 + Bun                                |
| Framework    | NestJS (micro-cronjob uses Elysia/Bun)          |
| Monorepo     | Turborepo                                        |
| Database     | PostgreSQL (AWS RDS) + Prisma ORM                |
| Auth         | JWT + Keycloak (OIDC)                            |
| Container    | Docker (multi-stage build)                       |
| Registry     | AWS ECR                                          |
| Orchestrator | Docker Compose (current) -> Kubernetes (planned) |
| Frontends    | carmen-inventory-frontend, carmen-platform        |
