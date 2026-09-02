# Redis Key Design

## Naming Convention

Pattern: `{domain}:{entity}:{id}:{field}`

All TTLs in seconds unless noted.

---

## Session & Auth

| Key | Type | TTL | Purpose |
|-----|------|-----|---------|
| `session:{userId}:{sessionId}` | Hash | 7d | Active session data |
| `refresh:{token}` | String (userId) | 30d | Refresh token → user lookup |
| `ratelimit:{endpoint}:{ip}` | String (count) | varies | Rate limiting counter |
| `ratelimit:login:{ip}` | String (count) | 15min | Login brute force protection |
| `blacklist:token:{jti}` | String (1) | access token TTL | Revoked JWT |

## User & Profile

| Key | Type | TTL | Purpose |
|-----|------|-----|---------|
| `user:{userId}` | Hash | 1h | Cached user profile |
| `user:username:{username}` | String (userId) | 1h | Username → userId lookup |
| `profile:counters:{userId}` | Hash | 10min | followers_count, following_count, posts_count |
| `user:online:{userId}` | String (timestamp) | 5min | Online status (refreshed on activity) |
| `user:lastseen:{userId}` | String (timestamp) | 7d | Last seen timestamp |

## Feed

| Key | Type | TTL | Purpose |
|-----|------|-----|---------|
| `feed:{userId}` | List | 1h | Cached home feed (post IDs) |
| `feed:{userId}:cursor` | String | 1h | Feed cursor state |

## Post

| Key | Type | TTL | Purpose |
|-----|------|-----|---------|
| `post:{postId}` | Hash | 30min | Hot post cache |
| `post:likes:{postId}` | String (count) | 10min | Like count cache |
| `post:comments:{postId}` | String (count) | 10min | Comment count cache |

## Story

| Key | Type | TTL | Purpose |
|-----|------|-----|---------|
| `story:active:{userId}` | List (storyIds) | 24h | Active stories for user |
| `story:{storyId}` | Hash | 24h | Story data |
| `story:views:{storyId}` | Set (userIds) | 24h | Story viewers |
| `story:order:{userId}` | Sorted Set | 1h | Story tray ordering (score = engagement) |

## Messaging

| Key | Type | TTL | Purpose |
|-----|------|-----|---------|
| `typing:{conversationId}:{userId}` | String (1) | 5s | Typing indicator |
| `unread:{userId}:{conversationId}` | String (count) | none | Unread message count |
| `unread:total:{userId}` | String (count) | none | Total unread across all conversations |

## Notifications

| Key | Type | TTL | Purpose |
|-----|------|-----|---------|
| `notif:unread:{userId}` | String (count) | none | Unread notification count |

## Search & Trending

| Key | Type | TTL | Purpose |
|-----|------|-----|---------|
| `search:cache:{queryHash}` | String (JSON) | 5min | Search result cache |
| `trending:hashtags` | Sorted Set | none | Trending hashtags (score = engagement × freshness) |
| `trending:posts` | Sorted Set | none | Trending posts |
| `trending:users` | Sorted Set | none | Trending users |
| `autocomplete:users` | Sorted Set | 1h | Username autocomplete |

## WebSocket

| Key | Type | TTL | Purpose |
|-----|------|-----|---------|
| `ws:user:{userId}` | Set (socketIds) | none | User's active socket connections |

## Distributed Locks

| Key | Type | TTL | Purpose |
|-----|------|-----|---------|
| `lock:feed:{userId}` | String (lockId) | 30s | Feed generation lock |
| `lock:media:{uploadId}` | String (lockId) | 5min | Media processing lock |

## Job Queues (BullMQ)

BullMQ uses `bull:` prefix automatically. Queue names:
- `bull:media-processing`
- `bull:video-processing`
- `bull:image-processing`
- `bull:notification`
- `bull:email`
- `bull:feed-generation`
- `bull:search-indexing`
- `bull:analytics`
- `bull:cleanup`
- `bull:moderation`
