# Feed & Recommendation Architecture

## 1. Feed Generation Strategy

We use a **Hybrid Feed Architecture (Push/Pull)**.

### Regular Users (Push / Fan-out on Write)
For users with a standard number of followers (e.g., < 10,000):
1. User A creates a post.
2. `PostCreated` event triggers FeedService.
3. FeedService fetches User A's followers.
4. For each follower, the post ID is pushed to their Redis `feed:{followerId}` list.
5. Also persisted to Cassandra `feed_by_user` for durability.

### Celebrities / High-follower Users (Pull / Fan-out on Read)
For users with huge follower counts (e.g., > 10,000):
1. Celebrity creates a post.
2. `PostCreated` event is fired.
3. We do **NOT** push to millions of Redis lists (avoids massive write amplification).
4. When a user requests their feed, the FeedService:
   - Reads the user's base feed from Redis.
   - Fetches recent posts from the Celebrities the user follows.
   - Merges and sorts the two lists in-memory.
   - Returns the combined feed.

## 2. Feed Ranking & Edge Rank

Initially, chronological. Later, algorithm-based scoring.

**Score Components:**
- **Affinity (A):** How often the user interacts with the author (likes, comments, DMs).
- **Weight (W):** Type of interaction (comment > like > view).
- **Time Decay (T):** Newer posts score higher. Exponential decay based on hours elapsed.

`Score = A * W * T`

## 3. Explore & Trending

### Trending Hashtags
- Updated via Redis Sorted Sets.
- Key: `trending:hashtags`
- When a post is created with a hashtag, `ZINCRBY trending:hashtags 1 {hashtag}`.
- Hourly cron job applies time decay (multiplies all scores by 0.9) to keep trending fresh.

### Explore Feed
- A mix of:
  1. Posts liked by users you follow (2nd degree connections).
  2. Popular posts in categories you interact with.
  3. Trending global posts.
- Cached globally and personalized periodically via BullMQ background jobs.

## 4. Pagination

Cursor-based pagination is mandatory to prevent duplicate/skipped posts as new content arrives.

**Cursor format:** Base64 encoded string containing `timestamp_postId`.
- Example: `Base64(1693673400000_550e8400-e29b-41d4-a716-446655440000)`

Query Cassandra:
```cql
SELECT * FROM feed_by_user 
WHERE user_id = ? 
  AND post_id < ? 
LIMIT 20;
```
