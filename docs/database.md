# Database Design

## PostgreSQL — Transactional & Relational Data

### users
```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      VARCHAR(30) UNIQUE NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name  VARCHAR(100),
  avatar_url    TEXT,
  bio           TEXT,
  website       VARCHAR(255),
  is_verified   BOOLEAN DEFAULT FALSE,
  is_private    BOOLEAN DEFAULT FALSE,
  role          VARCHAR(20) DEFAULT 'user', -- user, moderator, admin
  status        VARCHAR(20) DEFAULT 'active', -- active, suspended, banned, deleted
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
```

### sessions
```sql
CREATE TABLE sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token   VARCHAR(500) NOT NULL,
  device_info     JSONB,
  ip_address      INET,
  user_agent      TEXT,
  is_revoked      BOOLEAN DEFAULT FALSE,
  expires_at      TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_refresh_token ON sessions(refresh_token);
```

### oauth_accounts
```sql
CREATE TABLE oauth_accounts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider    VARCHAR(20) NOT NULL, -- google, github, apple
  provider_id VARCHAR(255) NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, provider_id)
);
```

### reports
```sql
CREATE TABLE reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id   UUID NOT NULL REFERENCES users(id),
  target_type   VARCHAR(20) NOT NULL, -- user, post, comment, message
  target_id     UUID NOT NULL,
  reason        VARCHAR(50) NOT NULL, -- spam, harassment, violence, etc.
  description   TEXT,
  status        VARCHAR(20) DEFAULT 'pending', -- pending, reviewed, resolved, dismissed
  reviewed_by   UUID REFERENCES users(id),
  resolved_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### audit_logs
```sql
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID NOT NULL REFERENCES users(id),
  action      VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id   UUID,
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Cassandra — High-Volume Social Data

### Design Principles
- Query-driven denormalization
- Partition key = access pattern
- Clustering key = sort order
- No secondary indexes (use materialized views or separate tables)

### posts_by_user
```cql
CREATE TABLE posts_by_user (
  user_id     UUID,
  post_id     TIMEUUID,
  post_type   TEXT,        -- text, image, video, link, poll, carousel
  caption     TEXT,
  hashtags    SET<TEXT>,
  mentions    SET<TEXT>,
  media_urls  LIST<TEXT>,
  location    TEXT,
  visibility  TEXT,        -- public, followers, private
  likes_count COUNTER,     -- separate counter table
  comments_count COUNTER,  -- separate counter table
  shares_count COUNTER,    -- separate counter table
  created_at  TIMESTAMP,
  updated_at  TIMESTAMP,
  PRIMARY KEY ((user_id), post_id)
) WITH CLUSTERING ORDER BY (post_id DESC);
```

### post_counters
```cql
CREATE TABLE post_counters (
  post_id         UUID,
  likes_count     COUNTER,
  comments_count  COUNTER,
  shares_count    COUNTER,
  views_count     COUNTER,
  PRIMARY KEY (post_id)
);
```

### feed_by_user
```cql
CREATE TABLE feed_by_user (
  user_id    UUID,
  post_id    TIMEUUID,
  author_id  UUID,
  post_type  TEXT,
  caption    TEXT,
  media_urls LIST<TEXT>,
  created_at TIMESTAMP,
  PRIMARY KEY ((user_id), post_id)
) WITH CLUSTERING ORDER BY (post_id DESC);
```

### likes_by_post
```cql
CREATE TABLE likes_by_post (
  post_id    UUID,
  user_id    UUID,
  created_at TIMESTAMP,
  PRIMARY KEY ((post_id), user_id)
);
```

### likes_by_user (reverse lookup: "did I like this?")
```cql
CREATE TABLE likes_by_user (
  user_id    UUID,
  post_id    UUID,
  created_at TIMESTAMP,
  PRIMARY KEY ((user_id), post_id)
);
```

### comments_by_post
```cql
CREATE TABLE comments_by_post (
  post_id     UUID,
  comment_id  TIMEUUID,
  user_id     UUID,
  parent_id   UUID,       -- NULL for top-level, comment_id for replies
  content     TEXT,
  mentions    SET<TEXT>,
  created_at  TIMESTAMP,
  updated_at  TIMESTAMP,
  PRIMARY KEY ((post_id), comment_id)
) WITH CLUSTERING ORDER BY (comment_id DESC);
```

### followers_by_user
```cql
CREATE TABLE followers_by_user (
  user_id      UUID,
  follower_id  UUID,
  created_at   TIMESTAMP,
  PRIMARY KEY ((user_id), follower_id)
);
```

### following_by_user
```cql
CREATE TABLE following_by_user (
  user_id      UUID,
  following_id UUID,
  created_at   TIMESTAMP,
  PRIMARY KEY ((user_id), following_id)
);
```

### follow_requests
```cql
CREATE TABLE follow_requests (
  user_id       UUID,
  requester_id  UUID,
  status        TEXT,     -- pending, accepted, rejected
  created_at    TIMESTAMP,
  PRIMARY KEY ((user_id), requester_id)
);
```

### blocked_users
```cql
CREATE TABLE blocked_users (
  user_id      UUID,
  blocked_id   UUID,
  created_at   TIMESTAMP,
  PRIMARY KEY ((user_id), blocked_id)
);
```

### messages_by_conversation
```cql
CREATE TABLE messages_by_conversation (
  conversation_id UUID,
  message_id      TIMEUUID,
  sender_id       UUID,
  message_type    TEXT,    -- text, image, video, audio, file, sticker, gif, shared_post, shared_profile
  content         TEXT,
  media_url       TEXT,
  reply_to        UUID,
  status          TEXT,    -- sent, delivered, read
  created_at      TIMESTAMP,
  updated_at      TIMESTAMP,
  PRIMARY KEY ((conversation_id), message_id)
) WITH CLUSTERING ORDER BY (message_id DESC);
```

### conversations_by_user
```cql
CREATE TABLE conversations_by_user (
  user_id           UUID,
  conversation_id   UUID,
  conversation_type TEXT,   -- direct, group
  last_message      TEXT,
  last_message_at   TIMESTAMP,
  unread_count      INT,
  is_muted          BOOLEAN,
  PRIMARY KEY ((user_id), last_message_at, conversation_id)
) WITH CLUSTERING ORDER BY (last_message_at DESC, conversation_id ASC);
```

### notifications_by_user
```cql
CREATE TABLE notifications_by_user (
  user_id           UUID,
  notification_id   TIMEUUID,
  type              TEXT,    -- follow, like, comment, mention, message, etc.
  actor_id          UUID,
  target_type       TEXT,
  target_id         UUID,
  content           TEXT,
  is_read           BOOLEAN,
  created_at        TIMESTAMP,
  PRIMARY KEY ((user_id), notification_id)
) WITH CLUSTERING ORDER BY (notification_id DESC);
```

### stories_by_user
```cql
CREATE TABLE stories_by_user (
  user_id    UUID,
  story_id   TIMEUUID,
  media_type TEXT,       -- image, video, text
  media_url  TEXT,
  caption    TEXT,
  mentions   SET<TEXT>,
  hashtags   SET<TEXT>,
  location   TEXT,
  views_count INT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP,
  PRIMARY KEY ((user_id), story_id)
) WITH CLUSTERING ORDER BY (story_id DESC);
```

### story_views
```cql
CREATE TABLE story_views (
  story_id   UUID,
  viewer_id  UUID,
  viewed_at  TIMESTAMP,
  PRIMARY KEY ((story_id), viewer_id)
);
```

### hashtag_posts
```cql
CREATE TABLE hashtag_posts (
  hashtag    TEXT,
  post_id    TIMEUUID,
  user_id    UUID,
  created_at TIMESTAMP,
  PRIMARY KEY ((hashtag), post_id)
) WITH CLUSTERING ORDER BY (post_id DESC);
```

---

## Partition Strategy Summary

| Table | Partition Key | Clustering Key | Access Pattern |
|-------|--------------|----------------|----------------|
| posts_by_user | user_id | post_id DESC | User's posts timeline |
| feed_by_user | user_id | post_id DESC | User's home feed |
| likes_by_post | post_id | user_id | All likes on a post |
| likes_by_user | user_id | post_id | Posts user liked |
| comments_by_post | post_id | comment_id DESC | Comments on a post |
| followers_by_user | user_id | follower_id | User's followers |
| following_by_user | user_id | following_id | Who user follows |
| messages_by_conversation | conversation_id | message_id DESC | Conversation history |
| conversations_by_user | user_id | last_message_at DESC | User's inbox |
| notifications_by_user | user_id | notification_id DESC | User's notifications |
| stories_by_user | user_id | story_id DESC | User's active stories |
| hashtag_posts | hashtag | post_id DESC | Posts with hashtag |
