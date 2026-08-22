import type { ActivityType } from "@/lib/activity/types"
import { excerptText } from "@/lib/activity/format"
import type { NotificationItem } from "@/lib/notifications/types"

const BOOK_TITLE_MAX = 48

export type NotificationMessageSegment = {
  text: string
  emphasis?: boolean
}

function actorLabel(username: string): string {
  return `@${username}`
}

function bookTitleLabel(title: string): string {
  return excerptText(title, BOOK_TITLE_MAX)
}

function bookSegment(title: string): NotificationMessageSegment {
  return { text: bookTitleLabel(title), emphasis: true }
}

function othersPhrase(count: number): string {
  if (count === 1) return "1 other"
  return `${count} others`
}

function aggregatedActionSegments(
  latestUsername: string,
  actorCount: number,
  actionSegments: NotificationMessageSegment[],
): NotificationMessageSegment[] {
  const name = actorLabel(latestUsername)
  const prefix =
    actorCount <= 1
      ? [{ text: `${name} ` }]
      : [{ text: `${name} and ${othersPhrase(actorCount - 1)} ` }]
  return [...prefix, ...actionSegments]
}

function ownedActivityNounSegments(
  activityType: ActivityType,
  bookTitle: string,
): NotificationMessageSegment[] {
  switch (activityType) {
    case "started_reading":
      return [{ text: "your update: started reading " }, bookSegment(bookTitle)]
    case "finished_reading":
      return [{ text: "your update: finished " }, bookSegment(bookTitle)]
    case "rated":
      return [{ text: "your rating of " }, bookSegment(bookTitle)]
    case "reviewed":
      return [{ text: "your review of " }, bookSegment(bookTitle)]
  }
}

function activityNounSegments(
  activityType: ActivityType,
  bookTitle: string,
  ownerUsername: string,
  isOwn: boolean,
): NotificationMessageSegment[] {
  if (isOwn) {
    return ownedActivityNounSegments(activityType, bookTitle)
  }

  const owner = actorLabel(ownerUsername)
  switch (activityType) {
    case "started_reading":
      return [
        { text: `${owner}'s update: started reading ` },
        bookSegment(bookTitle),
      ]
    case "finished_reading":
      return [{ text: `${owner}'s update: finished ` }, bookSegment(bookTitle)]
    case "rated":
      return [{ text: `${owner}'s rating of ` }, bookSegment(bookTitle)]
    case "reviewed":
      return [{ text: `${owner}'s review of ` }, bookSegment(bookTitle)]
  }
}

function activityLikeSegments(item: NotificationItem): NotificationMessageSegment[] {
  if (!item.activity) return [{ text: "liked your update" }]
  return [
    { text: "liked " },
    ...activityNounSegments(
      item.activity.type,
      item.activity.bookTitle,
      item.activity.ownerUsername,
      item.activity.isOwn,
    ),
  ]
}

function activityCommentSegments(
  item: NotificationItem,
): NotificationMessageSegment[] {
  if (!item.activity) return [{ text: "commented on your update" }]
  return [
    { text: "commented on " },
    ...ownedActivityNounSegments(
      item.activity.type,
      item.activity.bookTitle,
    ),
  ]
}

function threadCommentSegments(item: NotificationItem): NotificationMessageSegment[] {
  if (!item.activity) return [{ text: "also commented" }]
  return [
    { text: "also commented on " },
    ...activityNounSegments(
      item.activity.type,
      item.activity.bookTitle,
      item.activity.ownerUsername,
      item.activity.isOwn,
    ),
  ]
}

function commentLikeSegments(item: NotificationItem): NotificationMessageSegment[] {
  if (!item.activity) return [{ text: "liked your comment" }]
  return [
    { text: "liked your comment on " },
    bookSegment(item.activity.bookTitle),
  ]
}

export function formatNotificationMessageSegments(
  item: NotificationItem,
): NotificationMessageSegment[] {
  switch (item.type) {
    case "friend_request":
      return [
        {
          text: `${actorLabel(item.latestActor.username)} sent you a friend request`,
        },
      ]
    case "friend_request_accepted":
      return [
        {
          text: `${actorLabel(item.latestActor.username)} accepted your friend request`,
        },
      ]
    case "activity_like":
      return aggregatedActionSegments(
        item.latestActor.username,
        item.actorCount,
        activityLikeSegments(item),
      )
    case "comment_like":
      return aggregatedActionSegments(
        item.latestActor.username,
        item.actorCount,
        commentLikeSegments(item),
      )
    case "activity_comment":
      return aggregatedActionSegments(
        item.latestActor.username,
        item.actorCount,
        activityCommentSegments(item),
      )
    case "thread_comment":
      return aggregatedActionSegments(
        item.latestActor.username,
        item.actorCount,
        threadCommentSegments(item),
      )
    default: {
      const _exhaustive: never = item.type
      return [{ text: _exhaustive }]
    }
  }
}

export function formatNotificationMessage(item: NotificationItem): string {
  return formatNotificationMessageSegments(item)
    .map((segment) => segment.text)
    .join("")
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
