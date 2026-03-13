# Infrastructure Diagram

Server AWS

## Server

### CloudFront

    aws service : CloudFront
    comment : Domain management, Cloud, Proxy, DDOS

### Front-end

    aws service : S3
    project type : NextJS
    next-build : SSG

### Gateway

    aws service : EC2 (ECS)
    Project type : NestJS
    Concern : API Gateway Overload
    nest-build : microservice

### Elastic Load Balancing

    aws service : ELB
    comment : Load balancing, SSL termination, Proxy

### Microservices (Current Topology)

    - micro-business (Consolidated)

        project type : NestJS
        protocol : TCP
        Port number : 5020 (TCP) / 6020 (HTTP)
        Modules : auth, cluster, inventory, master, procurement, recipe, log, notification

    - micro-keycloak-api

        project type : NestJS
        protocol : TCP
        Port number : 5013 (TCP) / 6013 (HTTP)
        Integration : Keycloak identity provider

    - micro-file

        project type : NestJS
        protocol : TCP
        Port number : 5007 (TCP) / 6007 (HTTP)
        Storage : MinIO (S3-compatible)

    - micro-notification

        project type : NestJS
        protocol : TCP
        Port number : 5006 (TCP) / 6006 (HTTP)
        Real-time : Socket.io

    - micro-cronjob

        project type : Elysia + Bun
        protocol : TCP
        Port number : 5012 (TCP) / 6012 (HTTP)
        Scheduled tasks

### Database

    aws service : RDS OR Aurora
    project type : PostgreSQL
    Database : PostgreSQL
    schema : Dual-schema (Platform + Tenant)

```mermaid

flowchart TD

    FrontEnd["carmen-inventory-frontend\n(Next.JS)\nDocker Port: 3500"]
    FrontEndAPI["Frontend API Routes"]
    BackEnd["backend-gateway\nAPI Gateway\nHTTP: 4000 / HTTPS: 4001"]
    VendorPortal["Vendor Portal\n(Next.JS)"]
    ExchangeRate["Exchange Rate\nService\n(Bank Rate)"]
    Redis[(Redis)]
    PostgreSQL[(PostgreSQL\nAWS RDS)]
    S3Storage[(MinIO / S3\nStorage)]
    FileService["micro-file\nTCP: 5007\nHTTP: 6007"]
    BusinessService["micro-business\nTCP: 5020 / HTTP: 6020\n• Auth & Roles\n• Clusters & BUs\n• Inventory (GRN, Stock, Transfer)\n• Master Data (Products, Vendors)\n• Procurement (PO, PR, Credit Notes)\n• Recipes\n• Activity Logging\n• Notifications"]
    KeycloakService["micro-keycloak-api\nTCP: 5013 / HTTP: 6013"]
    KeycloakServer["Keycloak Server\n:8080"]
    NotificationService["micro-notification\nTCP: 5006 / HTTP: 6006\nSocket.io"]
    CronjobService["micro-cronjob\nTCP: 5012 / HTTP: 6012\nElysia + Bun"]

    FrontEnd <--> FrontEndAPI
    FrontEndAPI <--> BackEnd
    VendorPortal <--> BackEnd
    BackEnd <--> ExchangeRate
    BackEnd <--> Redis
    BackEnd <--> BusinessService
    BackEnd <--> KeycloakService
    BackEnd <--> FileService
    BackEnd <--> NotificationService
    BackEnd <--> CronjobService
    KeycloakService <--> KeycloakServer

    BusinessService <--> PostgreSQL
    KeycloakService <--> PostgreSQL
    FileService <--> S3Storage
    NotificationService <--> PostgreSQL

    subgraph PlatformDB["Platform Schema"]
        Users["tb_user, tb_platform_user"]
        Clusters["tb_cluster, tb_business_unit"]
        Roles["tb_application_role, tb_permission"]
    end

    subgraph TenantDB["Tenant Schema"]
        Products["tb_product, tb_vendor, tb_location"]
        Inventory["tb_stock_in, tb_stock_out, tb_transfer"]
        Procurement["tb_purchase_order, tb_purchase_request"]
    end

    PostgreSQL --- PlatformDB
    PostgreSQL --- TenantDB
```
