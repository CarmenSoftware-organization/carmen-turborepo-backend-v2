# Carmen Kubernetes Architecture

## High-Level Overview

```
                              USERS (Browser / Mobile)
                                       |
                      +----------------+----------------+
                      |                                 |
                      v                                 v
          carmen-inventory-frontend             carmen-platform
            (Next.js / Vercel)               (Next.js / Vercel)
                      |                                 |
                      +----------------+----------------+
                                       |
                                  HTTPS/REST
                                       |
=======================================================================
|                        AWS EKS Cluster                              |
|                                                                     |
|  +---------------------------------------------------------------+  |
|  |                     INGRESS LAYER                             |  |
|  |                                                               |  |
|  |   +-------------------+          +-------------------------+  |  |
|  |   | AWS ALB Ingress   |          | Certificate Manager     |  |  |
|  |   | Controller        |--------->| (ACM / TLS Termination) |  |  |
|  |   | api.carmen.com/*  |          +-------------------------+  |  |
|  |   +--------+----------+                                       |  |
|  +------------|--------------------------------------------------+  |
|               |                                                     |
|  +------------|--------------------------------------------------+  |
|  |            v          NAMESPACE: carmen-production             |  |
|  |                                                               |  |
|  |  +--------------------------------------------------------+  |  |
|  |  |              GATEWAY LAYER (Public)                     |  |  |
|  |  |                                                         |  |  |
|  |  |   +-------------------------------------------------+  |  |  |
|  |  |   |  backend-gateway (Deployment)                    |  |  |  |
|  |  |   |  Replicas: 2  |  HPA: 2-5  |  Port: 4000/4001  |  |  |  |
|  |  |   |  [Auth, Routing, Swagger, WebSocket]             |  |  |  |
|  |  |   |  [JWT + Keycloak Guards + Permission Guards]     |  |  |  |
|  |  |   +---------+---------------------------------------+  |  |  |
|  |  |             |                                           |  |  |
|  |  |        ClusterIP Service                                |  |  |
|  |  |     svc/backend-gateway:4000                            |  |  |
|  |  +---------|-----------------------------------------------+  |  |
|  |            |                                                  |  |
|  |            | NestJS TCP Transport (@MessagePattern)           |  |
|  |            |                                                  |  |
|  |  +---------v----------------------------------------------+   |  |
|  |  |              MICROSERVICES LAYER (Internal Only)        |  |  |
|  |  |                                                         |  |  |
|  |  |  +-------------+  +-------------+  +----------------+  |  |  |
|  |  |  | micro-      |  | micro-      |  | micro-         |  |  |  |
|  |  |  | business    |  | keycloak-api|  | report (NEW)   |  |  |  |
|  |  |  | Replicas: 3 |  | Replicas: 2 |  | Replicas: 2    |  |  |  |
|  |  |  | HPA: 2-6    |  | HPA: 2-4    |  | HPA: 2-4       |  |  |  |
|  |  |  | TCP:5020    |  | TCP:5013    |  | TCP:5015       |  |  |  |
|  |  |  | HTTP:6020   |  | HTTP:6013   |  | HTTP:6015      |  |  |  |
|  |  |  +-------------+  +-------------+  +----------------+  |  |  |
|  |  |                                                         |  |  |
|  |  |  +-------------+  +-------------+  +----------------+  |  |  |
|  |  |  | micro-      |  | micro-      |  | micro-         |  |  |  |
|  |  |  | file        |  | notification|  | cluster        |  |  |  |
|  |  |  | Replicas: 2 |  | Replicas: 2 |  | Replicas: 2    |  |  |  |
|  |  |  | HPA: 1-3    |  | HPA: 2-4    |  | HPA: 1-3       |  |  |  |
|  |  |  | TCP:5007    |  | TCP:5006    |  | TCP:5014       |  |  |  |
|  |  |  | HTTP:6007   |  | HTTP:6006   |  | HTTP:6014      |  |  |  |
|  |  |  +-------------+  +-------------+  +----------------+  |  |  |
|  |  |                                                         |  |  |
|  |  |                 +----------------+                      |  |  |
|  |  |                 | micro-         |                      |  |  |
|  |  |                 | cronjob        |                      |  |  |
|  |  |                 | Replicas: 1    |                      |  |  |
|  |  |                 | (No HPA)       |                      |  |  |
|  |  |                 | TCP:5012       |                      |  |  |
|  |  |                 | HTTP:6012      |                      |  |  |
|  |  |                 +----------------+                      |  |  |
|  |  +---------------------------------------------------------+  |  |
|  |                                                               |  |
|  |  +---------------------------------------------------------+  |  |
|  |  |              CONFIG & SECRETS LAYER                     |  |  |
|  |  |                                                         |  |  |
|  |  |  +------------------+  +-----------------------------+  |  |  |
|  |  |  | ConfigMap        |  | External Secrets            |  |  |  |
|  |  |  | - service hosts  |  | (AWS Secrets Manager)       |  |  |  |
|  |  |  | - service ports  |  | - DATABASE_URL              |  |  |  |
|  |  |  | - NODE_ENV       |  | - JWT_SECRET       |  |  |  |
|  |  |  | - LOKI_*         |  | - KEYCLOAK_*                |  |  |  |
|  |  |  +------------------+  | - SMTP_*                    |  |  |  |
|  |  |                        | - SENTRY_DSN                |  |  |  |
|  |  |                        +-----------------------------+  |  |  |
|  |  +---------------------------------------------------------+  |  |
|  |                                                               |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
=======================================================================
          |              |                    |
          v              v                    v
   +------------+  +-----------+     +----------------+
   |  AWS RDS   |  | Keycloak  |     | AWS ECR        |
   | PostgreSQL |  | Server    |     | (Container     |
   | (Multi-AZ) |  | (EKS or  |     |  Registry)     |
   |            |  |  ext.)    |     +----------------+
   | +--------+ |  +-----------+
   | |Platform| |
   | | Schema | |
   | +--------+ |
   | +--------+ |
   | |Tenant  | |
   | | Schema | |
   | +--------+ |
   +------------+
```

## Namespace Strategy

```
EKS Cluster
  |
  +-- carmen-production        # Production workloads
  |     +-- All 8 microservices + gateway
  |     +-- ConfigMaps, Secrets, HPA, PDB
  |
  +-- carmen-staging           # UAT / Staging (replaces dev.blueledgers.com)
  |     +-- Same services, lower replicas
  |     +-- Separate ConfigMap/Secrets pointing to staging DB
  |
  +-- carmen-system            # Shared infrastructure
  |     +-- Keycloak (if running in-cluster)
  |     +-- Monitoring stack (Prometheus, Grafana, Loki)
  |
  +-- ingress-nginx / kube-system
        +-- Ingress Controller, Cert Manager, External Secrets Operator
```

## Service Discovery (K8s vs Docker Compose)

```
  BEFORE (Docker Compose)                 AFTER (Kubernetes)
  ========================                ====================

  ENV hardcoded:                          K8s Service DNS:
  BUSINESS_SERVICE_HOST=                  BUSINESS_SERVICE_HOST=
    api-micro-business                      api-micro-business.carmen-production.svc.cluster.local
  BUSINESS_SERVICE_PORT=5020              BUSINESS_SERVICE_PORT=5020
                                          (or short: api-micro-business)

  Docker Network:                         ClusterIP Services:
  carmen-network (bridge)                 svc/api-micro-business      -> TCP:5020, HTTP:6020
                                          svc/api-micro-keycloak-api  -> TCP:5013, HTTP:6013
                                          svc/api-micro-report        -> TCP:5015, HTTP:6015
                                          svc/api-micro-file          -> TCP:5007, HTTP:6007
                                          svc/api-micro-notification  -> TCP:5006, HTTP:6006
                                          svc/api-micro-cronjob       -> TCP:5012, HTTP:6012
                                          svc/api-micro-cluster       -> TCP:5014, HTTP:6014

  NOTE: Service names match Docker Compose names
        -> ENV values stay the same, zero code changes needed!
```

## Network Policy

```
                    Internet
                       |
                       v
              +--------+--------+
              |  AWS ALB        |
              |  (Ingress)      |
              +--------+--------+
                       |
          Only port 4000/4001 exposed
                       |
                       v
    +-----------------------------------------+
    |          backend-gateway                |  <-- Public-facing
    |          (NetworkPolicy: allow ingress) |
    +----+----+----+----+----+----+----+------+
         |    |    |    |    |    |    |
         v    v    v    v    v    v    v
    +----+----+----+----+----+----+----+------+
    |  micro-services (Internal Only)         |  <-- No external access
    |  NetworkPolicy:                         |
    |    ingress: from gateway only           |
    |    egress: to RDS, Keycloak, internet   |
    +-----------------------------------------+
```

## Horizontal Pod Autoscaler (HPA) Strategy

```
  Service              Min  Max  CPU Target  Memory Target  Reason
  -------------------  ---  ---  ----------  -------------  -------------------------
  backend-gateway       2    5     70%         80%          Entry point, must be HA
  micro-business        3    6     70%         80%          Heaviest workload
  micro-report (NEW)    2    4     70%         80%          Report generation = CPU heavy
  micro-keycloak-api    2    4     60%         70%          Auth is critical path
  micro-notification    2    4     60%         70%          WebSocket connections
  micro-file            1    3     70%         80%          I/O bound, less CPU
  micro-cluster         1    3     60%         70%          Lower traffic
  micro-cronjob         1    1     N/A         N/A          Singleton, no scaling
```

## CI/CD Pipeline (GitHub Actions -> EKS)

```
  +----------+     +-----------+     +----------+     +-----------+
  |  GitHub  |     |  GitHub   |     |  AWS ECR |     |  AWS EKS  |
  |  Push    +---->+  Actions  +---->+  Push    +---->+  Deploy   |
  +----------+     +-----------+     +----------+     +-----------+

  Workflow Steps:
  ==============

  1. Trigger: push to main (prod) or uat (staging)
                    |
                    v
  2. Build:   bun install -> db:generate -> build:package
                    |
                    v
  3. Docker:  Build images for each service (parallel)
              docker build -f apps/<service>/Dockerfile .
                    |
                    v
  4. Push:    Tag & push to ECR
              <account>.dkr.ecr.ap-southeast-7.amazonaws.com/carmen-<service>:<sha>
                    |
                    v
  5. Deploy:  kubectl set image deployment/<service> <service>=<new-image>
              (or Helm upgrade / ArgoCD sync)
                    |
                    v
  6. Verify:  kubectl rollout status deployment/<service>
              Run smoke tests against /health endpoints
```

## Kubernetes Resource Structure

```
k8s/
  +-- base/                              # Shared base configs
  |   +-- namespace.yaml                 # carmen-production, carmen-staging
  |   +-- configmap.yaml                 # Service discovery ENVs
  |   +-- network-policy.yaml            # Gateway-only ingress rule
  |   +-- external-secret.yaml           # AWS Secrets Manager refs
  |
  +-- services/
  |   +-- backend-gateway/
  |   |   +-- deployment.yaml            # 2 replicas, health checks
  |   |   +-- service.yaml               # ClusterIP :4000, :4001
  |   |   +-- hpa.yaml                   # 2-5 pods
  |   |   +-- pdb.yaml                   # minAvailable: 1
  |   |
  |   +-- micro-business/
  |   |   +-- deployment.yaml            # 3 replicas
  |   |   +-- service.yaml               # ClusterIP TCP:5020, HTTP:6020
  |   |   +-- hpa.yaml                   # 2-6 pods
  |   |   +-- pdb.yaml                   # minAvailable: 2
  |   |
  |   +-- micro-report/                  # NEW SERVICE
  |   |   +-- deployment.yaml            # 2 replicas
  |   |   +-- service.yaml               # ClusterIP TCP:5015, HTTP:6015
  |   |   +-- hpa.yaml                   # 2-4 pods
  |   |   +-- pdb.yaml                   # minAvailable: 1
  |   |
  |   +-- micro-keycloak-api/
  |   |   +-- deployment.yaml
  |   |   +-- service.yaml
  |   |   +-- hpa.yaml
  |   |   +-- pdb.yaml
  |   |
  |   +-- micro-file/
  |   |   +-- deployment.yaml
  |   |   +-- service.yaml
  |   |   +-- hpa.yaml
  |   |
  |   +-- micro-notification/
  |   |   +-- deployment.yaml
  |   |   +-- service.yaml
  |   |   +-- hpa.yaml
  |   |
  |   +-- micro-cluster/
  |   |   +-- deployment.yaml
  |   |   +-- service.yaml
  |   |   +-- hpa.yaml
  |   |
  |   +-- micro-cronjob/
  |       +-- deployment.yaml            # 1 replica (singleton)
  |       +-- service.yaml
  |
  +-- ingress/
  |   +-- ingress.yaml                   # ALB Ingress -> gateway
  |   +-- certificate.yaml               # TLS cert ref
  |
  +-- overlays/                          # Kustomize overlays
      +-- production/
      |   +-- kustomization.yaml         # High replicas, prod secrets
      +-- staging/
          +-- kustomization.yaml         # Low replicas, staging secrets
```

## micro-report Service Design

```
  +----------------------------------------------------------+
  |  micro-report (NEW)                                      |
  |  TCP: 5015  |  HTTP: 6015                                |
  |                                                          |
  |  Responsibilities:                                       |
  |  - Generate PDF/Excel reports                            |
  |  - Inventory reports                                     |
  |  - Procurement reports                                   |
  |  - Financial summaries                                   |
  |  - Scheduled report generation (via micro-cronjob)       |
  |  - Report caching & storage (via micro-file)             |
  |                                                          |
  |  Communication:                                          |
  |  - Gateway -> micro-report (TCP:5015) for on-demand      |
  |  - micro-cronjob -> micro-report (TCP:5015) for schedule |
  |  - micro-report -> micro-file (TCP:5007) for storage     |
  |  - micro-report -> RDS for data queries                  |
  |                                                          |
  |  Resources (K8s):                                        |
  |  - CPU: 500m request / 1000m limit                       |
  |  - Memory: 512Mi request / 1Gi limit                     |
  |  - Reason: report generation is CPU/memory intensive     |
  +----------------------------------------------------------+

  Gateway Routing:
    /api/v1/report/*  -->  TCP:5015  -->  micro-report
```

## Port Mapping (Updated)

| Service              | TCP (Internal) | HTTP (Health) | K8s Service Name         | HPA   |
|----------------------|----------------|---------------|--------------------------|-------|
| backend-gateway      | -              | 4000 / 4001   | svc/backend-gateway      | 2-5   |
| micro-business       | 5020           | 6020          | svc/api-micro-business   | 2-6   |
| micro-report (NEW)   | 5015           | 6015          | svc/api-micro-report     | 2-4   |
| micro-keycloak-api   | 5013           | 6013          | svc/api-micro-keycloak   | 2-4   |
| micro-file           | 5007           | 6007          | svc/api-micro-file       | 1-3   |
| micro-notification   | 5006           | 6006          | svc/api-micro-notification| 2-4  |
| micro-cronjob        | 5012           | 6012          | svc/api-micro-cronjob    | 1     |
| micro-cluster        | 5014           | 6014          | svc/api-micro-cluster    | 1-3   |

## Migration Path: Docker Compose -> Kubernetes

```
  Phase 1: Prepare (Week 1)
  -------------------------
  [x] Dockerfiles ready (all services)
  [x] Health check endpoints (/health)
  [x] ECR registry configured
  [ ] Create micro-report service
  [ ] Write K8s manifests
  [ ] Setup EKS cluster (eksctl / Terraform)

  Phase 2: Staging (Week 2)
  -------------------------
  [ ] Deploy to EKS carmen-staging namespace
  [ ] Migrate dev.blueledgers.com -> EKS staging
  [ ] Validate all services + health checks
  [ ] Test HPA scaling

  Phase 3: Production (Week 3)
  ----------------------------
  [ ] Deploy to EKS carmen-production namespace
  [ ] Setup ALB Ingress + TLS
  [ ] Configure External Secrets (AWS Secrets Manager)
  [ ] Setup monitoring (Prometheus + Grafana)
  [ ] DNS cutover: api.carmen.com -> ALB

  Phase 4: Optimize (Week 4+)
  ----------------------------
  [ ] Fine-tune HPA thresholds
  [ ] Add PodDisruptionBudgets
  [ ] Setup ArgoCD for GitOps
  [ ] Network policies hardening
  [ ] Cost optimization (Spot instances, right-sizing)
```
