import { and, count, desc, eq, isNull } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"

import type { ActivityType } from "@/lib/activity/types"
import { db } from "@/lib/db"
import { activities, books, notifications, users } from "@/lib/db/schema"
import type { NotificationItem, NotificationType } from "@/lib/notifications/types"

const NOTIFICATION_LIST_LIMIT = 30
const activityOwners = alias(users, "activity_owner")

type NotificationRow = {
  id: string
  type: NotificationType
  actorCount: number
  activityId: string | null
  commentId: string | null
  friendshipId: string | null
  readAt: Date | null
  updatedAt: Date
  latestActorId: string
  latestActorUsername: string
  latestActorImage: string | null
  activityType: ActivityType | null
  bookTitle: string | null
  activityOwnerId: string | null
  activityOwnerUsername: string | null
}

function toNotificationItem(
  row: NotificationRow,
  recipientId: string,
): NotificationItem {
  const activity =
    row.activityType &&
    row.bookTitle &&
    row.activityOwnerId &&
    row.activityOwnerUsername
      ? {
          type: row.activityType,
          bookTitle: row.bookTitle,
          ownerUsername: row.activityOwnerUsername,
          isOwn: row.activityOwnerId === recipientId,
        }
      : null

  return {
    id: row.id,
    type: row.type,
    actorCount: row.actorCount,
    latestActor: {
      id: row.latestActorId,
      username: row.latestActorUsername,
      image: row.latestActorImage,
    },
    activityId: row.activityId,
    commentId: row.commentId,
    friendshipId: row.friendshipId,
    activity,
    readAt: row.readAt,
    updatedAt: row.updatedAt,
  }
}

export async function countUnreadNotifications(
  recipientId: string,
): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(notifications)
    .where(
      and(
        eq(notifications.recipientId, recipientId),
        isNull(notifications.readAt),
      ),
    )
  return Number(row?.n ?? 0)
}

export async function listNotifications(
  recipientId: string,
): Promise<NotificationItem[]> {
  const rows = await db
    .select({
      id: notifications.id,
      type: notifications.type,
      actorCount: notifications.actorCount,
      activityId: notifications.activityId,
      commentId: notifications.commentId,
      friendshipId: notifications.friendshipId,
      readAt: notifications.readAt,
      updatedAt: notifications.updatedAt,
      latestActorId: users.id,
      latestActorUsername: users.username,
      latestActorImage: users.image,
      activityType: activities.type,
      bookTitle: books.title,
      activityOwnerId: activityOwners.id,
      activityOwnerUsername: activityOwners.username,
    })
    .from(notifications)
    .innerJoin(users, eq(users.id, notifications.latestActorId))
    .leftJoin(activities, eq(activities.id, notifications.activityId))
    .leftJoin(books, eq(books.id, activities.bookId))
    .leftJoin(activityOwners, eq(activityOwners.id, activities.actorId))
    .where(eq(notifications.recipientId, recipientId))
    .orderBy(desc(notifications.updatedAt), desc(notifications.id))
    .limit(NOTIFICATION_LIST_LIMIT)

  return rows.map((row) => toNotificationItem(row, recipientId))
}

export async function getNotificationForRecipient(
  recipientId: string,
  notificationId: string,
): Promise<{ id: string } | null> {
  const [row] = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.recipientId, recipientId),
      ),
    )
    .limit(1)
  return row ?? null
}

export async function markAllNotificationsRead(recipientId: string) {
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notifications.recipientId, recipientId),
        isNull(notifications.readAt),
      ),
    )
}
