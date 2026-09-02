# WebSocket Architecture

## Overview
Socket.IO used for bidirectional realtime communication.
Redis Adapter is required for horizontal scaling across multiple NestJS instances.

Namespace: `/realtime`
Authentication: JWT in connection handshake (`auth: { token: 'jwt' }`)

## Connection Lifecycle

1. Client connects with JWT
2. Server validates JWT
3. Server joins client to `user:{userId}` room
4. Server sets `user:online:{userId}` in Redis
5. Server emits `user:online` event to followers (if applicable)
6. On disconnect, Server removes online status, emits `user:offline`

## Server → Client Events (Incoming to App)

| Event | Payload | Trigger |
|-------|---------|---------|
| `message:new` | `{ messageId, conversationId, senderId, content, createdAt }` | New DM/Group message received |
| `message:update` | `{ messageId, conversationId, status }` | Message marked delivered/read |
| `user:typing` | `{ conversationId, userId }` | User starts typing in conversation |
| `user:stop_typing` | `{ conversationId, userId }` | User stops typing |
| `notification:new` | `{ id, type, actor, content, createdAt }` | New notification received |
| `user:online` | `{ userId }` | Followed user comes online |
| `user:offline` | `{ userId }` | Followed user goes offline |
| `error` | `{ code, message }` | WebSocket level error |

## Client → Server Events (Outgoing from App)

| Event | Payload | Action |
|-------|---------|--------|
| `message:send` | `{ conversationId, content, type, replyTo }` | Send a message |
| `message:read` | `{ conversationId, messageId }` | Mark message(s) read |
| `user:typing` | `{ conversationId }` | Set typing indicator |
| `user:stop_typing` | `{ conversationId }` | Clear typing indicator |
| `room:join` | `{ roomId }` | Join specific conversation room |
| `room:leave` | `{ roomId }` | Leave conversation room |

## Rooms Structure

Socket.IO rooms are used to route messages efficiently:

- `user:{userId}` — Private room for the user (receives notifications, direct events)
- `conversation:{conversationId}` — Room for chat participants (receives messages, typing indicators)

## Scaling Setup

```
[Client 1] <--> [NestJS WS Node 1] <--> [Redis PubSub]
[Client 2] <--> [NestJS WS Node 2] <--> [Redis PubSub]
```

When Node 1 emits to `conversation:X`, Redis PubSub broadcasts it to all nodes. Node 2 receives it and forwards to Client 2 if they are in that room.
