import { and, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { notifications } from "@/lib/db/schema"
import type { NotificationType } from "@/lib/notifications/types"

type AggregatedNotificationInput = {
  recipientId: string
  actorId: string
  type: NotificationType
  activityId?: string
  commentId?: string
  friendshipId?: string
}

function groupWhere(input: AggregatedNotificationInput) {
  const base = and(
    eq(notifications.recipientId, input.recipientId),
    eq(notifications.type, input.type),
  )

  if (input.friendshipId) {
    return and(base, eq(notifications.friendshipId, input.friendshipId))
  }
  if (input.commentId) {
    return and(base, eq(notifications.commentId, input.commentId))
  }
  if (input.activityId) {
    return and(base, eq(notifications.activityId, input.activityId))
  }

  return base
}

export async function upsertAggregatedNotification(
  input: AggregatedNotificationInput,
): Promise<void> {
  if (input.recipientId === input.actorId) return

  const now = new Date()
  const [existing] = await db
    .select({
      id: notifications.id,
      actorIds: notifications.actorIds,
      actorCount: notifications.actorCount,
    })
    .from(notifications)
    .where(groupWhere(input))
    .limit(1)

  if (!existing) {
    await db.insert(notifications).values({
      recipientId: input.recipientId,
      type: input.type,
      latestActorId: input.actorId,
      actorCount: 1,
      actorIds: [input.actorId],
      activityId: input.activityId ?? null,
      commentId: input.commentId ?? null,
      friendshipId: input.friendshipId ?? null,
      readAt: null,
      createdAt: now,
      updatedAt: now,
    })
    return
  }

  const actorIds = existing.actorIds ?? []
  const alreadyCounted = actorIds.includes(input.actorId)
  const nextActorIds = alreadyCounted
    ? actorIds
    : [...actorIds, input.actorId]

  await db
    .update(notifications)
    .set({
      latestActorId: input.actorId,
      actorCount: alreadyCounted ? existing.actorCount : existing.actorCount + 1,
      actorIds: nextActorIds,
      readAt: null,
      updatedAt: now,
    })
    .where(eq(notifications.id, existing.id))
}

export async function removeActorFromNotification(
  input: AggregatedNotificationInput,
): Promise<void> {
  const [existing] = await db
    .select({
      id: notifications.id,
      actorIds: notifications.actorIds,
      actorCount: notifications.actorCount,
    })
    .from(notifications)
    .where(groupWhere(input))
    .limit(1)

  if (!existing) return

  const nextActorIds = (existing.actorIds ?? []).filter(
    (id) => id !== input.actorId,
  )

  if (nextActorIds.length === 0) {
    await db.delete(notifications).where(eq(notifications.id, existing.id))
    return
  }

  await db
    .update(notifications)
    .set({
      actorIds: nextActorIds,
      actorCount: nextActorIds.length,
      latestActorId: nextActorIds[nextActorIds.length - 1]!,
      updatedAt: new Date(),
    })
    .where(eq(notifications.id, existing.id))
}

export async function deleteNotificationsByFriendship(
  friendshipId: string,
): Promise<void> {
  await db
    .delete(notifications)
    .where(eq(notifications.friendshipId, friendshipId))
}

export async function notifyFriendRequest(input: {
  friendshipId: string
  requesterId: string
  addresseeId: string
}) {
  await upsertAggregatedNotification({
    recipientId: input.addresseeId,
    actorId: input.requesterId,
    type: "friend_request",
    friendshipId: input.friendshipId,
  })
}

export async function notifyFriendRequestAccepted(input: {
  friendshipId: string
  requesterId: string
  addresseeId: string
}) {
  await deleteNotificationsByFriendship(input.friendshipId)
  await upsertAggregatedNotification({
    recipientId: input.requesterId,
    actorId: input.addresseeId,
    type: "friend_request_accepted",
    friendshipId: input.friendshipId,
  })
}

export async function notifyActivityLiked(input: {
  activityId: string
  actorId: string
  ownerId: string
  liked: boolean
}) {
  const payload = {
    recipientId: input.ownerId,
    actorId: input.actorId,
    type: "activity_like" as const,
    activityId: input.activityId,
  }

  if (input.liked) {
    await upsertAggregatedNotification(payload)
  } else {
    await removeActorFromNotification(payload)
  }
}

export async function notifyCommentLiked(input: {
  commentId: string
  activityId: string
  actorId: string
  authorId: string
  liked: boolean
}) {
  const payload = {
    recipientId: input.authorId,
    actorId: input.actorId,
    type: "comment_like" as const,
    commentId: input.commentId,
    activityId: input.activityId,
  }

  if (input.liked) {
    await upsertAggregatedNotification(payload)
  } else {
    await removeActorFromNotification(payload)
  }
}

export async function notifyActivityCommented(input: {
  activityId: string
  actorId: string
  ownerId: string
}) {
  if (input.ownerId !== input.actorId) {
    await upsertAggregatedNotification({
      recipientId: input.ownerId,
      actorId: input.actorId,
      type: "activity_comment",
      activityId: input.activityId,
    })
  }
}

export async function notifyThreadCommented(input: {
  activityId: string
  actorId: string
  participantIds: string[]
}) {
  const recipients = input.participantIds.filter((id) => id !== input.actorId)

  await Promise.all(
    recipients.map((recipientId) =>
      upsertAggregatedNotification({
        recipientId,
        actorId: input.actorId,
        type: "thread_comment",
        activityId: input.activityId,
      }),
    ),
  )
}
