import { and, count, desc, eq, isNull } from "drizzle-orm"

import { db } from "@/lib/db"
import { notifications, users } from "@/lib/db/schema"
import type { NotificationItem, NotificationType } from "@/lib/notifications/types"

const NOTIFICATION_LIST_LIMIT = 30

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
}

function toNotificationItem(row: NotificationRow): NotificationItem {
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
    })
    .from(notifications)
    .innerJoin(users, eq(users.id, notifications.latestActorId))
    .where(eq(notifications.recipientId, recipientId))
    .orderBy(desc(notifications.updatedAt), desc(notifications.id))
    .limit(NOTIFICATION_LIST_LIMIT)

  return rows.map(toNotificationItem)
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
