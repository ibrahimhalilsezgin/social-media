# System Architecture

## Overview

Monolithic NestJS backend designed for future microservice extraction. Each domain is a NestJS module with its own controller/service/repository layers. No cross-module database access — modules communicate via events and service interfaces.

## High-Level Architecture

```
[Next.js Frontend] <--REST/WS--> [NestJS API Gateway]
                                       |
                    ┌──────────────────┼──────────────────────┐
                    |                  |                      |
              [PostgreSQL]       [Cassandra]             [Redis]
              (users,auth,       (posts,feeds,           (cache,
               roles,settings)    messages,likes,         sessions,
                                  comments,follows,       queues,
                                  notifications,          realtime)
                                  stories)
                    |                  |                      |
                    └──────────────────┼──────────────────────┘
                                       |
                    ┌──────────────────┼──────────────────────┐
                    |                  |                      |
              [OpenSearch]        [Kafka]                [MinIO]
              (search,            (event bus)            (media
               autocomplete)                              storage)
```

## Service Modules

| Module | Database | Cache | Events Produced |
|--------|----------|-------|-----------------|
| Auth | PostgreSQL | Redis (sessions) | UserRegistered, UserLoggedIn |
| User | PostgreSQL | Redis (profiles) | UserUpdated, UserDeleted |
| Profile | PostgreSQL | Redis (counters) | ProfileUpdated |
| Social Graph | Cassandra | Redis (counts) | UserFollowed, UserUnfollowed, UserBlocked |
| Post | Cassandra | Redis (hot posts) | PostCreated, PostUpdated, PostDeleted |
| Feed | Cassandra + Redis | Redis (feed cache) | — (consumer only) |
| Story | Cassandra + Redis | Redis (TTL stories) | StoryCreated, StoryViewed |
| Comment | Cassandra | Redis (counts) | CommentCreated, CommentDeleted |
| Like | Cassandra | Redis (counts) | PostLiked, PostUnliked |
| Media | MinIO | Redis (upload state) | MediaUploaded, MediaProcessed |
| Messaging | Cassandra | Redis (realtime) | MessageSent, MessageRead |
| Group | Cassandra | Redis | GroupCreated, MemberAdded |
| Notification | Cassandra | Redis (unread counts) | — (consumer only) |
| Search | OpenSearch | Redis (autocomplete) | — (consumer only) |
| Explore | Cassandra + Redis | Redis (trending) | — (consumer only) |
| Moderation | PostgreSQL | — | ContentFlagged, UserBanned |
| Admin | PostgreSQL | — | AdminAction |
| Analytics | Cassandra | Redis | — (consumer only) |

## Communication Patterns

### Synchronous
- REST API: client → backend
- WebSocket: bidirectional realtime (Socket.IO + Redis adapter)

### Asynchronous
- Kafka: domain events (fan-out to multiple consumers)
- BullMQ + Redis: job queues (media processing, email, cleanup)

## Data Flow Example: Post Creation

1. Client → POST /api/v1/posts (REST)
2. PostService validates, stores metadata in Cassandra
3. Media files uploaded via presigned URL to MinIO
4. PostCreated event → Kafka
5. Consumers:
   - FeedService: fan-out to follower feeds (Redis + Cassandra)
   - SearchService: index in OpenSearch
   - NotificationService: notify mentioned users
   - AnalyticsService: track post creation

## Scalability Strategy

- **Horizontal**: stateless API servers behind load balancer
- **WebSocket**: Redis adapter for cross-instance pub/sub
- **Database**: Cassandra built for horizontal scaling
- **Cache**: Redis Cluster when needed
- **Queue**: Kafka partitions for parallel consumption
- **Media**: MinIO/S3 — infinitely scalable object storage

## Security Layers

1. Rate limiting (Redis-based, per endpoint)
2. JWT + refresh token rotation
3. Input validation (class-validator DTOs)
4. Authorization guards (RBAC)
5. IDOR protection (ownership checks)
6. Helmet, CORS, CSRF where needed
