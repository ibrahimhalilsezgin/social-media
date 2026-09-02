# Deployment & Infrastructure

## Phase 1: Local Development (Docker Compose)

The entire stack runs locally via `docker-compose.yml`:
- **PostgreSQL**: `localhost:5432`
- **Cassandra**: `localhost:9042`
- **Redis**: `localhost:6379`
- **OpenSearch**: `localhost:9200`
- **Kafka**: `localhost:9092`
- **Zookeeper**: `localhost:2181`
- **MinIO**: `localhost:9000` (API), `9001` (Console)

## Phase 2: Production Target Architecture

Production deployment should follow microservices principles even if deployed as a modular monolith initially.

### Kubernetes (K8s) Cluster

1. **Ingress Layer**
   - Nginx Ingress or AWS ALB
   - SSL Termination
   - Rate limiting at Edge (Cloudflare)

2. **Application Layer**
   - `frontend-deployment`: Next.js Node server (SSR)
   - `api-deployment`: NestJS REST API nodes
   - `ws-deployment`: NestJS WebSocket nodes (scaled separately, sticky sessions if needed)
   - `worker-deployment`: Node.js background workers (BullMQ consumers)

3. **Stateful Services (Managed)**
   - Do NOT run databases in K8s for production. Use managed services:
   - PostgreSQL → AWS RDS / GCP Cloud SQL
   - Cassandra → DataStax Astra / AWS Keyspaces
   - Redis → AWS ElastiCache / Upstash
   - OpenSearch → AWS OpenSearch Service
   - Kafka → Confluent Cloud / AWS MSK
   - Object Storage → AWS S3 / Cloudflare R2

### CI/CD Pipeline (GitHub Actions)

1. **PR Checks**
   - ESLint & Prettier
   - TypeScript `tsc --noEmit`
   - Jest Unit Tests
   - Prisma schema validation

2. **Merge to Main**
   - Build Docker images for Backend, Frontend, Workers
   - Tag with git SHA
   - Push to Container Registry (ECR/GHCR)
   - Deploy to Staging environment

3. **Release (Tag)**
   - Production deployment via ArgoCD or Helm
   - Run database migrations (PostgreSQL)

## Observability

- **Metrics**: Prometheus + Grafana (Node.js metrics, BullMQ queues, HTTP response times)
- **Tracing**: OpenTelemetry (trace request from Next.js → NestJS → DB)
- **Logging**: Winston/Pino → stdout → FluentBit → OpenSearch
- **Error Tracking**: Sentry (Frontend + Backend)
