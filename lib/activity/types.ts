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
}

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
