"use server"

import { and, eq } from "drizzle-orm"
import { z } from "zod"

import { auth } from "@/lib/auth"
import {
  countActivityLikes,
  countCommentLikes,
  getActivityComment,
  getCommentById,
  getVisibleActivity,
  listActivityComments,
  listFriendsFeed,
  normalizeCommentBody,
} from "@/lib/activity/queries"
import {
  COMMENT_BODY_MAX,
  type CreateCommentResult,
  type DeleteCommentResult,
  type FeedActivityItem,
  type ListCommentsResult,
  type RestoreCommentResult,
  type ToggleLikeResult,
} from "@/lib/activity/types"
import { db } from "@/lib/db"
import { activityComments, activityLikes, commentLikes } from "@/lib/db/schema"

export type LoadMoreFeedResult =
  | { ok: true; items: FeedActivityItem[]; nextCursor: string | null }
  | { ok: false; message: string }

const activityIdSchema = z.object({
  activityId: z.uuid(),
})

const commentIdSchema = z.object({
  commentId: z.uuid(),
})

const createCommentSchema = z.object({
  activityId: z.uuid(),
  body: z.string().max(COMMENT_BODY_MAX),
})

const listCommentsSchema = z.object({
  activityId: z.uuid(),
  cursor: z.string().min(1).optional(),
})

export async function loadMoreFeed(input: {
  cursor: string
}): Promise<LoadMoreFeedResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, message: "Sign in required." }
  }

  if (!input.cursor) {
    return { ok: false, message: "Invalid cursor." }
  }

  const page = await listFriendsFeed(session.user.id, {
    cursor: input.cursor,
  })
  return { ok: true, items: page.items, nextCursor: page.nextCursor }
}

export async function toggleActivityLike(input: {
  activityId: string
}): Promise<ToggleLikeResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, code: "unauthorized", message: "Sign in required." }
  }
  const viewerId = session.user.id

  const parsed = activityIdSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, code: "invalid", message: "Invalid activity." }
  }
  const { activityId } = parsed.data

  const activity = await getVisibleActivity(viewerId, activityId)
  if (!activity) {
    return { ok: false, code: "not_found", message: "Activity not found." }
  }

  const inserted = await db
    .insert(activityLikes)
    .values({ activityId, userId: viewerId })
    .onConflictDoNothing()
    .returning({ activityId: activityLikes.activityId })

  let liked = inserted.length > 0
  if (!liked) {
    await db
      .delete(activityLikes)
      .where(
        and(
          eq(activityLikes.activityId, activityId),
          eq(activityLikes.userId, viewerId),
        ),
      )
  }

  const likeCount = await countActivityLikes(activityId)
  return { ok: true, liked, likeCount }
}

export async function toggleCommentLike(input: {
  commentId: string
}): Promise<ToggleLikeResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, code: "unauthorized", message: "Sign in required." }
  }
  const viewerId = session.user.id

  const parsed = commentIdSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, code: "invalid", message: "Invalid comment." }
  }

  const existing = await getActivityComment(parsed.data.commentId)
  if (!existing || existing.deletedAt) {
    return { ok: false, code: "not_found", message: "Comment not found." }
  }

  const activity = await getVisibleActivity(viewerId, existing.activityId)
  if (!activity) {
    return { ok: false, code: "not_found", message: "Activity not found." }
  }

  const inserted = await db
    .insert(commentLikes)
    .values({ commentId: existing.id, userId: viewerId })
    .onConflictDoNothing()
    .returning({ commentId: commentLikes.commentId })

  let liked = inserted.length > 0
  if (!liked) {
    await db
      .delete(commentLikes)
      .where(
        and(
          eq(commentLikes.commentId, existing.id),
          eq(commentLikes.userId, viewerId),
        ),
      )
  }

  const likeCount = await countCommentLikes(existing.id)
  return { ok: true, liked, likeCount }
}

export async function createActivityComment(input: {
  activityId: string
  body: string
}): Promise<CreateCommentResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, code: "unauthorized", message: "Sign in required." }
  }
  const viewerId = session.user.id

  const parsed = createCommentSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, code: "invalid", message: "Invalid comment." }
  }

  const body = normalizeCommentBody(parsed.data.body)
  if (!body) {
    return { ok: false, code: "invalid", message: "Write a comment first." }
  }
  if (body.length > COMMENT_BODY_MAX) {
    return {
      ok: false,
      code: "invalid",
      message: `Comment must be at most ${COMMENT_BODY_MAX} characters.`,
    }
  }

  const activity = await getVisibleActivity(viewerId, parsed.data.activityId)
  if (!activity) {
    return { ok: false, code: "not_found", message: "Activity not found." }
  }

  const [inserted] = await db
    .insert(activityComments)
    .values({
      activityId: activity.id,
      authorId: viewerId,
      body,
    })
    .returning({ id: activityComments.id })

  if (!inserted) {
    return {
      ok: false,
      code: "invalid",
      message: "Something went wrong. Please try again.",
    }
  }

  const comment = await getCommentById(inserted.id, viewerId, activity.actorId)
  if (!comment) {
    return {
      ok: false,
      code: "invalid",
      message: "Something went wrong. Please try again.",
    }
  }

  return { ok: true, comment }
}

export async function loadActivityComments(input: {
  activityId: string
  cursor?: string
}): Promise<ListCommentsResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, code: "unauthorized", message: "Sign in required." }
  }
  const viewerId = session.user.id

  const parsed = listCommentsSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, code: "invalid", message: "Invalid input." }
  }

  const activity = await getVisibleActivity(viewerId, parsed.data.activityId)
  if (!activity) {
    return { ok: false, code: "not_found", message: "Activity not found." }
  }

  const page = await listActivityComments(
    viewerId,
    activity.id,
    activity.actorId,
    { cursor: parsed.data.cursor },
  )

  return {
    ok: true,
    comments: page.comments,
    previousCursor: page.previousCursor,
  }
}

export async function deleteActivityComment(input: {
  commentId: string
}): Promise<DeleteCommentResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, code: "unauthorized", message: "Sign in required." }
  }
  const viewerId = session.user.id

  const parsed = commentIdSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, code: "invalid", message: "Invalid comment." }
  }

  const existing = await getActivityComment(parsed.data.commentId)
  if (!existing || existing.deletedAt) {
    return { ok: false, code: "not_found", message: "Comment not found." }
  }

  const activity = await getVisibleActivity(viewerId, existing.activityId)
  if (!activity) {
    return { ok: false, code: "not_found", message: "Activity not found." }
  }

  const isAuthor = existing.authorId === viewerId
  const isActor = activity.actorId === viewerId
  if (!isAuthor && !isActor) {
    return {
      ok: false,
      code: "forbidden",
      message: "You can’t hide this comment.",
    }
  }

  await db
    .update(activityComments)
    .set({
      deletedAt: new Date(),
      deletedById: viewerId,
    })
    .where(eq(activityComments.id, existing.id))

  return { ok: true }
}

export async function restoreActivityComment(input: {
  commentId: string
}): Promise<RestoreCommentResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, code: "unauthorized", message: "Sign in required." }
  }
  const viewerId = session.user.id

  const parsed = commentIdSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, code: "invalid", message: "Invalid comment." }
  }

  const existing = await getActivityComment(parsed.data.commentId)
  if (!existing || !existing.deletedAt) {
    return { ok: false, code: "not_found", message: "Comment not found." }
  }

  if (existing.deletedById !== viewerId) {
    return {
      ok: false,
      code: "forbidden",
      message: "You can’t show this comment.",
    }
  }

  const activity = await getVisibleActivity(viewerId, existing.activityId)
  if (!activity) {
    return { ok: false, code: "not_found", message: "Activity not found." }
  }

  await db
    .update(activityComments)
    .set({
      deletedAt: null,
      deletedById: null,
    })
    .where(eq(activityComments.id, existing.id))

  const comment = await getCommentById(existing.id, viewerId, activity.actorId)
  if (!comment) {
    return {
      ok: false,
      code: "invalid",
      message: "Something went wrong. Please try again.",
    }
  }

  return { ok: true, comment }
}
