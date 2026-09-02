export enum SocialTopics {
  USER_REGISTERED = 'social.auth.user-registered',
  USER_LOGGED_IN = 'social.auth.user-logged-in',
  USER_UPDATED = 'social.user.updated',
  USER_DELETED = 'social.user.deleted',
  USER_FOLLOWED = 'social.graph.followed',
  USER_UNFOLLOWED = 'social.graph.unfollowed',
  POST_CREATED = 'social.post.created',
  POST_UPDATED = 'social.post.updated',
  POST_DELETED = 'social.post.deleted',
  POST_LIKED = 'social.engagement.liked',
  POST_UNLIKED = 'social.engagement.unliked',
  COMMENT_CREATED = 'social.engagement.comment-created',
  COMMENT_DELETED = 'social.engagement.comment-deleted',
}

export interface UserRegisteredEvent {
  userId: string;
  email: string;
  username: string;
}

export interface PostCreatedEvent {
  postId: string;
  userId: string;
  type: string;
  hashtags: string[];
  mentions: string[];
}
