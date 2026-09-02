# Domain Events

## Event Bus: Kafka

Topics follow pattern: `social.{domain}.{event}`

## Event List

### Auth Events
| Event | Topic | Payload | Consumers |
|-------|-------|---------|-----------|
| UserRegistered | social.auth.user-registered | userId, email, username | SearchService, AnalyticsService |
| UserLoggedIn | social.auth.user-logged-in | userId, ip, device | AnalyticsService |

### User Events
| Event | Topic | Payload | Consumers |
|-------|-------|---------|-----------|
| UserUpdated | social.user.updated | userId, changedFields | SearchService, CacheInvalidator |
| UserDeleted | social.user.deleted | userId | All services (cleanup) |

### Social Graph Events
| Event | Topic | Payload | Consumers |
|-------|-------|---------|-----------|
| UserFollowed | social.graph.followed | followerId, followingId | FeedService, NotificationService, AnalyticsService |
| UserUnfollowed | social.graph.unfollowed | followerId, followingId | FeedService, AnalyticsService |
| FollowRequested | social.graph.follow-requested | requesterId, targetId | NotificationService |
| FollowAccepted | social.graph.follow-accepted | requesterId, targetId | FeedService, NotificationService |
| UserBlocked | social.graph.blocked | blockerId, blockedId | FeedService, MessagingService |
| UserUnblocked | social.graph.unblocked | blockerId, blockedId | — |

### Post Events
| Event | Topic | Payload | Consumers |
|-------|-------|---------|-----------|
| PostCreated | social.post.created | postId, userId, type, hashtags, mentions | FeedService, SearchService, NotificationService, AnalyticsService |
| PostUpdated | social.post.updated | postId, changedFields | SearchService, CacheInvalidator |
| PostDeleted | social.post.deleted | postId, userId | FeedService, SearchService, CacheInvalidator |

### Engagement Events
| Event | Topic | Payload | Consumers |
|-------|-------|---------|-----------|
| PostLiked | social.engagement.liked | postId, userId, authorId | NotificationService, AnalyticsService, TrendingService |
| PostUnliked | social.engagement.unliked | postId, userId | AnalyticsService, TrendingService |
| CommentCreated | social.engagement.comment-created | commentId, postId, userId, authorId, mentions | NotificationService, AnalyticsService, TrendingService |
| CommentDeleted | social.engagement.comment-deleted | commentId, postId | AnalyticsService |
| PostShared | social.engagement.shared | postId, userId, shareType | NotificationService, AnalyticsService |

### Story Events
| Event | Topic | Payload | Consumers |
|-------|-------|---------|-----------|
| StoryCreated | social.story.created | storyId, userId | NotificationService (close friends) |
| StoryViewed | social.story.viewed | storyId, viewerId | AnalyticsService |
| StoryExpired | social.story.expired | storyId, userId | CleanupService |

### Messaging Events
| Event | Topic | Payload | Consumers |
|-------|-------|---------|-----------|
| MessageSent | social.message.sent | messageId, conversationId, senderId | NotificationService, AnalyticsService |
| MessageRead | social.message.read | conversationId, userId, lastReadId | — (WebSocket only) |

### Media Events
| Event | Topic | Payload | Consumers |
|-------|-------|---------|-----------|
| MediaUploaded | social.media.uploaded | mediaId, type, objectKey | MediaProcessingWorker |
| MediaProcessed | social.media.processed | mediaId, variants | PostService (update URLs) |
| MediaFailed | social.media.failed | mediaId, error | NotificationService (notify user) |

### Moderation Events
| Event | Topic | Payload | Consumers |
|-------|-------|---------|-----------|
| ContentReported | social.moderation.reported | reportId, targetType, targetId | ModerationService |
| ContentFlagged | social.moderation.flagged | targetType, targetId, reason | AdminService |
| UserBanned | social.moderation.user-banned | userId, reason | All services (block access) |
| UserSuspended | social.moderation.user-suspended | userId, until | AuthService |

### Mention Events
| Event | Topic | Payload | Consumers |
|-------|-------|---------|-----------|
| UserMentioned | social.mention.created | mentionedUserId, authorId, targetType, targetId | NotificationService |

## Kafka Topics Summary

```
social.auth.user-registered
social.auth.user-logged-in
social.user.updated
social.user.deleted
social.graph.followed
social.graph.unfollowed
social.graph.follow-requested
social.graph.follow-accepted
social.graph.blocked
social.graph.unblocked
social.post.created
social.post.updated
social.post.deleted
social.engagement.liked
social.engagement.unliked
social.engagement.comment-created
social.engagement.comment-deleted
social.engagement.shared
social.story.created
social.story.viewed
social.story.expired
social.message.sent
social.message.read
social.media.uploaded
social.media.processed
social.media.failed
social.moderation.reported
social.moderation.flagged
social.moderation.user-banned
social.moderation.user-suspended
social.mention.created
```

## Consumer Groups

| Group | Topics Consumed |
|-------|----------------|
| feed-service | post.created, post.deleted, graph.followed, graph.unfollowed, graph.blocked |
| notification-service | graph.*, engagement.*, story.created, message.sent, mention.created, media.failed |
| search-service | auth.user-registered, user.updated, user.deleted, post.created, post.updated, post.deleted |
| analytics-service | ALL topics |
| trending-service | engagement.liked, engagement.unliked, engagement.comment-created, engagement.shared |
| media-worker | media.uploaded |
| cleanup-service | story.expired, user.deleted |
| moderation-service | moderation.reported |
