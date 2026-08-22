import type { NotificationItem } from "@/lib/notifications/types"

function actorLabel(username: string): string {
  return `@${username}`
}

function othersPhrase(count: number): string {
  if (count === 1) return "1 other"
  return `${count} others`
}

function aggregatedAction(
  latestUsername: string,
  actorCount: number,
  verb: string,
): string {
  const name = actorLabel(latestUsername)
  if (actorCount <= 1) return `${name} ${verb}`
  return `${name} and ${othersPhrase(actorCount - 1)} ${verb}`
}

export function formatNotificationMessage(item: NotificationItem): string {
  switch (item.type) {
    case "friend_request":
      return `${actorLabel(item.latestActor.username)} sent you a friend request`
    case "friend_request_accepted":
      return `${actorLabel(item.latestActor.username)} accepted your friend request`
    case "activity_like":
      return aggregatedAction(
        item.latestActor.username,
        item.actorCount,
        "liked your update",
      )
    case "comment_like":
      return aggregatedAction(
        item.latestActor.username,
        item.actorCount,
        "liked your comment",
      )
    case "activity_comment":
      return aggregatedAction(
        item.latestActor.username,
        item.actorCount,
        "commented on your update",
      )
    case "thread_comment":
      return aggregatedAction(
        item.latestActor.username,
        item.actorCount,
        "also commented",
      )
    default: {
      const _exhaustive: never = item.type
      return _exhaustive
    }
  }
}

export function notificationHref(item: NotificationItem): string {
  switch (item.type) {
    case "friend_request":
    case "friend_request_accepted":
      return "/friends"
    case "activity_like":
      return item.activityId ? `/?activity=${item.activityId}` : "/"
    case "comment_like":
    case "activity_comment":
    case "thread_comment":
      return item.activityId
        ? `/?activity=${item.activityId}&comments=1`
        : "/"
    default: {
      const _exhaustive: never = item.type
      return _exhaustive
    }
  }
}

export function formatUnreadBadge(count: number): string | null {
  if (count <= 0) return null
  if (count > 9) return "9+"
  return String(count)
}
