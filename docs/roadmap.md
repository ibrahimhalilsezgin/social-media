# Project Roadmap

Following the phased development strategy outlined in `PROJECT.md`.

## Phase 1: Project Infrastructure (Current)
- [x] Architecture documentation
- [ ] Monorepo setup (pnpm + Turborepo)
- [ ] Docker Compose (Postgres, Cassandra, Redis, OpenSearch, Kafka, MinIO)
- [ ] NestJS backend scaffold (Prisma, Config, Swagger)
- [ ] Next.js frontend scaffold (App Router, Tailwind, Zustand, TanStack Query)
- [ ] Shared packages (types, utils, config, database)

## Phase 2: Authentication & User Management
- [ ] PostgreSQL schema for users and sessions
- [ ] JWT + Refresh Token rotation implementation
- [ ] Login/Register REST API
- [ ] Profile CRUD
- [ ] Frontend Auth forms & protected routes

## Phase 3: Social Graph
- [ ] Cassandra schema for followers/following
- [ ] Follow/Unfollow/Block API
- [ ] Redis follower counts caching
- [ ] Private account follow request logic

## Phase 4: Posts & Media
- [ ] MinIO setup & Presigned URL generation
- [ ] BullMQ media processing worker (Sharp)
- [ ] Cassandra schema for posts, likes, comments
- [ ] Create Post API
- [ ] Like and Comment APIs

## Phase 5: Feed Generation
- [ ] Kafka event bus setup
- [ ] Fan-out on write logic (Push to Redis)
- [ ] Feed retrieval API (Cursor pagination)
- [ ] Frontend Infinite Scroll feed UI

## Phase 6: Stories
- [ ] Story schema & API
- [ ] Redis TTL implementation for 24h expiration
- [ ] Story view tracking
- [ ] Frontend Story UI (Instagram style)

## Phase 7: Realtime Messaging
- [ ] Socket.IO + Redis Adapter setup
- [ ] Cassandra schema for conversations & messages
- [ ] DM API & WebSocket events
- [ ] Frontend Chat UI

## Phase 8: Notifications & Search
- [ ] Notification event consumers
- [ ] OpenSearch indexing consumer
- [ ] Global search API & Autocomplete
- [ ] Frontend Notification dropdown & Search page

## Phase 9: Explore & Trending
- [ ] Redis Sorted Sets for trending hashtags
- [ ] Explore feed algorithm implementation
- [ ] Frontend Explore page

## Phase 10: Admin & Moderation
- [ ] Report API
- [ ] Admin dashboard UI
- [ ] User suspend/ban logic

## Phase 11 & 12: Polish & Production
- [ ] Performance optimizations
- [ ] Load testing
- [ ] K8s deployment manifests
- [ ] CI/CD Pipelines setup
