export const ACTIVITY_TYPES = [
  "started_reading",
  "finished_reading",
  "rated",
  "reviewed",
] as const

export type ActivityType = (typeof ACTIVITY_TYPES)[number]

export type Activity = {
  id: string
  actorId: string
  type: ActivityType
  bookId: string
  reviewId: string | null
  rating: number | null
  createdAt: Date
}

export type RecordActivityInput = {
  actorId: string
  type: ActivityType
  bookId: string
  reviewId?: string | null
  rating?: number | null
}

export type FeedActor = {
  id: string
  username: string
  image: string | null
}

export type FeedBook = {
  id: string
  title: string
  coverImageId: string
}

export type FeedActivityItem = {
  id: string
  type: ActivityType
  createdAt: Date
  rating: number | null
  reviewBody: string | null
  actor: FeedActor
  book: FeedBook
  likeCount: number
  commentCount: number
  viewerHasLiked: boolean
}

export type ActivityComment = {
  id: string
  activityId: string
  createdAt: Date
  deleted: boolean
  /** Null when the comment has been soft-deleted. */
  body: string | null
  author: FeedActor
  canDelete: boolean
  canRestore: boolean
  likeCount: number
  viewerHasLiked: boolean
}

export type CommentsPage = {
  comments: ActivityComment[]
  /** Older comments than the current window; null if the thread is fully loaded. */
  previousCursor: string | null
}

export type EngageErrorCode =
  | "unauthorized"
  | "not_found"
  | "invalid"
  | "forbidden"

export type ToggleLikeResult =
  | { ok: true; liked: boolean; likeCount: number }
  | { ok: false; code: EngageErrorCode; message: string }

export type CreateCommentResult =
  | { ok: true; comment: ActivityComment }
  | { ok: false; code: EngageErrorCode; message: string }

export type ListCommentsResult =
  | { ok: true; comments: ActivityComment[]; previousCursor: string | null }
  | { ok: false; code: EngageErrorCode; message: string }

export type DeleteCommentResult =
  | { ok: true }
  | { ok: false; code: EngageErrorCode; message: string }

export type RestoreCommentResult =
  | { ok: true; comment: ActivityComment }
  | { ok: false; code: EngageErrorCode; message: string }

export type FeedPage = {
  items: FeedActivityItem[]
  nextCursor: string | null
}

export type FeedCursor = {
  createdAt: string
  id: string
}

export const FEED_PAGE_SIZE = 20
export const REVIEW_EXCERPT_MAX = 140
export const COMMENT_BODY_MAX = 1000
export const COMMENT_PAGE_SIZE = 10
