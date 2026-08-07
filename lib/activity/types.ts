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
