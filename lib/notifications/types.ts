export const NOTIFICATION_TYPES = [
  "friend_request",
  "friend_request_accepted",
  "activity_like",
  "comment_like",
  "activity_comment",
  "thread_comment",
] as const

export type NotificationType = (typeof NOTIFICATION_TYPES)[number]

export type NotificationActor = {
  id: string
  username: string
  image: string | null
}

export type NotificationItem = {
  id: string
  type: NotificationType
  actorCount: number
  latestActor: NotificationActor
  activityId: string | null
  commentId: string | null
  friendshipId: string | null
  readAt: Date | null
  updatedAt: Date
}

export type NotificationActionResult =
  | { ok: true }
  | {
      ok: false
      code: "unauthorized" | "not_found" | "invalid"
      message: string
    }

export type LoadNotificationsResult =
  | { ok: true; items: NotificationItem[]; unreadCount: number }
  | { ok: false; code: "unauthorized"; message: string }
