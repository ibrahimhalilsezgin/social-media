# REST API Reference

Base URL: `/api/v1`

## Auth Module (`/auth`)

| Method | Endpoint | Description | Auth Required | Rate Limit |
|--------|----------|-------------|---------------|------------|
| POST | `/auth/register` | Register new user | No | 5/hr |
| POST | `/auth/login` | Login with email/username | No | 10/min |
| POST | `/auth/refresh` | Refresh access token | Token (RT) | 10/min |
| POST | `/auth/logout` | Revoke current session | Yes | 10/min |
| POST | `/auth/logout-all` | Revoke all sessions | Yes | 5/hr |
| GET | `/auth/sessions` | List active sessions | Yes | 30/min |
| DELETE | `/auth/sessions/:id` | Revoke specific session | Yes | 30/min |
| POST | `/auth/password/forgot` | Request password reset | No | 3/hr |
| POST | `/auth/password/reset` | Reset password | No | 3/hr |

## User & Profile Module (`/users`, `/profiles`)

| Method | Endpoint | Description | Auth Required | Rate Limit |
|--------|----------|-------------|---------------|------------|
| GET | `/users/me` | Get current user | Yes | 60/min |
| PATCH | `/users/me` | Update user settings | Yes | 30/min |
| GET | `/profiles/:username` | Get public profile | Optional | 60/min |
| PATCH | `/profiles/me` | Update profile info | Yes | 30/min |
| POST | `/profiles/me/avatar` | Generate avatar upload URL | Yes | 10/hr |

## Social Graph Module (`/follows`)

| Method | Endpoint | Description | Auth Required | Rate Limit |
|--------|----------|-------------|---------------|------------|
| POST | `/follows/:userId` | Follow user | Yes | 60/hr |
| DELETE | `/follows/:userId` | Unfollow user | Yes | 60/hr |
| GET | `/follows/:userId/followers` | List followers (cursor) | Optional | 60/min |
| GET | `/follows/:userId/following` | List following (cursor) | Optional | 60/min |
| GET | `/follows/requests` | List pending requests | Yes | 30/min |
| POST | `/follows/requests/:userId/accept` | Accept request | Yes | 30/min |
| POST | `/follows/requests/:userId/reject` | Reject request | Yes | 30/min |
| POST | `/follows/:userId/block` | Block user | Yes | 30/hr |
| DELETE | `/follows/:userId/block` | Unblock user | Yes | 30/hr |

## Post Module (`/posts`)

| Method | Endpoint | Description | Auth Required | Rate Limit |
|--------|----------|-------------|---------------|------------|
| POST | `/posts` | Create post | Yes | 30/hr |
| GET | `/posts/:id` | Get post details | Optional | 120/min |
| DELETE | `/posts/:id` | Delete post | Yes (owner) | 30/hr |
| GET | `/users/:username/posts` | Get user's posts (cursor) | Optional | 60/min |
| POST | `/posts/:id/likes` | Like post | Yes | 120/hr |
| DELETE | `/posts/:id/likes` | Unlike post | Yes | 120/hr |
| GET | `/posts/:id/likes` | List users who liked | Optional | 60/min |

## Comment Module (`/comments`)

| Method | Endpoint | Description | Auth Required | Rate Limit |
|--------|----------|-------------|---------------|------------|
| GET | `/posts/:postId/comments` | List comments (cursor) | Optional | 60/min |
| POST | `/posts/:postId/comments` | Add comment | Yes | 60/hr |
| DELETE | `/comments/:id` | Delete comment | Yes (owner) | 60/hr |
| POST | `/comments/:id/likes` | Like comment | Yes | 120/hr |
| DELETE | `/comments/:id/likes` | Unlike comment | Yes | 120/hr |

## Feed Module (`/feed`)

| Method | Endpoint | Description | Auth Required | Rate Limit |
|--------|----------|-------------|---------------|------------|
| GET | `/feed` | Get home feed (cursor) | Yes | 120/min |

## Story Module (`/stories`)

| Method | Endpoint | Description | Auth Required | Rate Limit |
|--------|----------|-------------|---------------|------------|
| GET | `/stories/feed` | Get stories from following | Yes | 60/min |
| POST | `/stories` | Create story | Yes | 30/hr |
| DELETE | `/stories/:id` | Delete story | Yes (owner) | 30/hr |
| GET | `/users/:username/stories` | Get user's active stories | Optional | 60/min |
| POST | `/stories/:id/view` | Mark story as viewed | Yes | 120/min |
| GET | `/stories/:id/viewers` | Get story viewers (cursor) | Yes (owner) | 30/min |

## Messaging Module (`/messages`)

| Method | Endpoint | Description | Auth Required | Rate Limit |
|--------|----------|-------------|---------------|------------|
| GET | `/messages/conversations` | List conversations (cursor) | Yes | 60/min |
| POST | `/messages/conversations` | Create DM conversation | Yes | 30/hr |
| GET | `/messages/conversations/:id` | Get messages (cursor) | Yes | 120/min |
| POST | `/messages/conversations/:id` | Send message (REST fallback) | Yes | 120/min |
| PATCH | `/messages/conversations/:id/read` | Mark conversation read | Yes | 120/min |

## Notification Module (`/notifications`)

| Method | Endpoint | Description | Auth Required | Rate Limit |
|--------|----------|-------------|---------------|------------|
| GET | `/notifications` | List notifications (cursor) | Yes | 60/min |
| GET | `/notifications/unread-count` | Get unread count | Yes | 120/min |
| PATCH | `/notifications/:id/read` | Mark read | Yes | 120/min |
| PATCH | `/notifications/read-all` | Mark all read | Yes | 10/min |

## Search & Explore Module (`/search`, `/explore`)

| Method | Endpoint | Description | Auth Required | Rate Limit |
|--------|----------|-------------|---------------|------------|
| GET | `/search` | Global search (q=term&type=all) | Optional | 60/min |
| GET | `/search/autocomplete` | Quick search | Optional | 120/min |
| GET | `/explore` | Suggested content (cursor) | Optional | 60/min |
| GET | `/explore/trending` | Trending topics/hashtags | Optional | 60/min |
| GET | `/hashtags/:tag` | Posts by hashtag (cursor) | Optional | 60/min |

## Media Module (`/media`)

| Method | Endpoint | Description | Auth Required | Rate Limit |
|--------|----------|-------------|---------------|------------|
| POST | `/media/upload-url` | Generate presigned upload URL | Yes | 30/hr |
| POST | `/media/confirm` | Confirm upload success | Yes | 30/hr |

## Moderation Module (`/moderation`)

| Method | Endpoint | Description | Auth Required | Rate Limit |
|--------|----------|-------------|---------------|------------|
| POST | `/moderation/report` | Report content/user | Yes | 10/hr |
