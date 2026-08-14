import {
  and,
  count,
  desc,
  eq,
  inArray,
  lt,
  or,
} from "drizzle-orm"
import { z } from "zod"

import {
  COMMENT_PAGE_SIZE,
  FEED_PAGE_SIZE,
} from "@/lib/activity/types"
import type {
  ActivityComment,
  CommentsPage,
  FeedActivityItem,
  FeedCursor,
  FeedPage,
} from "@/lib/activity/types"
import { db } from "@/lib/db"
import {
  activities,
  activityComments,
  activityLikes,
  books,
  commentLikes,
  reviews,
  users,
} from "@/lib/db/schema"
import {
  getFriendshipRelation,
  listAcceptedFriendIds,
} from "@/lib/friends/queries"

export function encodeFeedCursor(cursor: FeedCursor): string {
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url")
}

export function decodeFeedCursor(raw: string): FeedCursor | null {
  try {
    const parsed = JSON.parse(
      Buffer.from(raw, "base64url").toString("utf8"),
    ) as FeedCursor
    if (
      typeof parsed?.createdAt !== "string" ||
      typeof parsed?.id !== "string"
    ) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export type VisibleActivity = {
  id: string
  actorId: string
}

/** Activity the viewer may like/comment on: own post, or a friend's. */
export async function getVisibleActivity(
  viewerId: string,
  activityId: string,
): Promise<VisibleActivity | null> {
  if (!z.uuid().safeParse(activityId).success) return null

  const [row] = await db
    .select({
      id: activities.id,
      actorId: activities.actorId,
    })
    .from(activities)
    .where(eq(activities.id, activityId))
    .limit(1)

  if (!row) return null

  const { relation } = await getFriendshipRelation(viewerId, row.actorId)
  if (relation !== "self" && relation !== "friends") return null

  return row
}

export function canDeleteComment(input: {
  viewerId: string
  actorId: string
  authorId: string
  deleted: boolean
}): boolean {
  if (input.deleted) return false
  return input.viewerId === input.authorId || input.viewerId === input.actorId
}

export function canRestoreComment(input: {
  viewerId: string
  deleted: boolean
  deletedById: string | null
}): boolean {
  return input.deleted && input.deletedById === input.viewerId
}

export function normalizeCommentBody(body: string): string {
  return body.trim()
}

type CommentRow = {
  id: string
  activityId: string
  body: string
  deletedAt: Date | null
  deletedById: string | null
  createdAt: Date
  authorId: string
  authorUsername: string
  authorImage: string | null
}

function toActivityComment(
  row: CommentRow,
  viewerId: string,
  actorId: string,
): ActivityComment {
  const deleted = row.deletedAt != null
  return {
    id: row.id,
    activityId: row.activityId,
    createdAt: row.createdAt,
    deleted,
    body: deleted ? null : row.body,
    author: {
      id: row.authorId,
      username: row.authorUsername,
      image: row.authorImage,
    },
    canDelete: canDeleteComment({
      viewerId,
      actorId,
      authorId: row.authorId,
      deleted,
    }),
    canRestore: canRestoreComment({
      viewerId,
      deleted,
      deletedById: row.deletedById,
    }),
    likeCount: 0,
    viewerHasLiked: false,
  }
}

async function attachCommentLikes(
  viewerId: string,
  comments: ActivityComment[],
): Promise<ActivityComment[]> {
  const liveIds = comments.filter((c) => !c.deleted).map((c) => c.id)
  if (liveIds.length === 0) return comments

  const [countRows, likedRows] = await Promise.all([
    db
      .select({
        commentId: commentLikes.commentId,
        n: count(),
      })
      .from(commentLikes)
      .where(inArray(commentLikes.commentId, liveIds))
      .groupBy(commentLikes.commentId),
    db
      .select({ commentId: commentLikes.commentId })
      .from(commentLikes)
      .where(
        and(
          eq(commentLikes.userId, viewerId),
          inArray(commentLikes.commentId, liveIds),
        ),
      ),
  ])

  const likeCountById = new Map(
    countRows.map((row) => [row.commentId, Number(row.n)]),
  )
  const likedIds = new Set(likedRows.map((row) => row.commentId))

  return comments.map((comment) =>
    comment.deleted
      ? comment
      : {
          ...comment,
          likeCount: likeCountById.get(comment.id) ?? 0,
          viewerHasLiked: likedIds.has(comment.id),
        },
  )
}

const commentSelect = {
  id: activityComments.id,
  activityId: activityComments.activityId,
  body: activityComments.body,
  deletedAt: activityComments.deletedAt,
  deletedById: activityComments.deletedById,
  createdAt: activityComments.createdAt,
  authorId: users.id,
  authorUsername: users.username,
  authorImage: users.image,
} as const

export async function getActivityComment(
  commentId: string,
): Promise<{
  id: string
  activityId: string
  authorId: string
  deletedAt: Date | null
  deletedById: string | null
} | null> {
  if (!z.uuid().safeParse(commentId).success) return null

  const [row] = await db
    .select({
      id: activityComments.id,
      activityId: activityComments.activityId,
      authorId: activityComments.authorId,
      deletedAt: activityComments.deletedAt,
      deletedById: activityComments.deletedById,
    })
    .from(activityComments)
    .where(eq(activityComments.id, commentId))
    .limit(1)

  return row ?? null
}

export async function listActivityComments(
  viewerId: string,
  activityId: string,
  actorId: string,
  options?: { cursor?: string | null; limit?: number },
): Promise<CommentsPage> {
  const limit = options?.limit ?? COMMENT_PAGE_SIZE
  const cursor = options?.cursor ? decodeFeedCursor(options.cursor) : null
  const cursorDate = cursor ? new Date(cursor.createdAt) : null
  const cursorValid =
    cursor && cursorDate && !Number.isNaN(cursorDate.getTime())
      ? cursor
      : null

  // Newest-first fetch, then reverse so the window displays oldest → newest.
  const rows = await db
    .select(commentSelect)
    .from(activityComments)
    .innerJoin(users, eq(users.id, activityComments.authorId))
    .where(
      and(
        eq(activityComments.activityId, activityId),
        cursorValid
          ? or(
              lt(activityComments.createdAt, new Date(cursorValid.createdAt)),
              and(
                eq(activityComments.createdAt, new Date(cursorValid.createdAt)),
                lt(activityComments.id, cursorValid.id),
              ),
            )
          : undefined,
      ),
    )
    .orderBy(desc(activityComments.createdAt), desc(activityComments.id))
    .limit(limit + 1)

  const hasMore = rows.length > limit
  const newestFirst = hasMore ? rows.slice(0, limit) : rows
  const chronological = [...newestFirst].reverse()

  const comments = await attachCommentLikes(
    viewerId,
    chronological.map((row) => toActivityComment(row, viewerId, actorId)),
  )

  const oldest = chronological[0]
  const previousCursor =
    hasMore && oldest
      ? encodeFeedCursor({
          createdAt: oldest.createdAt.toISOString(),
          id: oldest.id,
        })
      : null

  return { comments, previousCursor }
}

export async function getCommentById(
  commentId: string,
  viewerId: string,
  actorId: string,
): Promise<ActivityComment | null> {
  if (!z.uuid().safeParse(commentId).success) return null

  const [row] = await db
    .select(commentSelect)
    .from(activityComments)
    .innerJoin(users, eq(users.id, activityComments.authorId))
    .where(eq(activityComments.id, commentId))
    .limit(1)

  return row
    ? (await attachCommentLikes(viewerId, [
        toActivityComment(row, viewerId, actorId),
      ]))[0] ?? null
    : null
}

async function attachFeedEngagement(
  viewerId: string,
  items: Omit<
    FeedActivityItem,
    "likeCount" | "commentCount" | "viewerHasLiked"
  >[],
): Promise<FeedActivityItem[]> {
  if (items.length === 0) return []

  const ids = items.map((item) => item.id)

  const [likeRows, commentRows, likedRows] = await Promise.all([
    db
      .select({
        activityId: activityLikes.activityId,
        n: count(),
      })
      .from(activityLikes)
      .where(inArray(activityLikes.activityId, ids))
      .groupBy(activityLikes.activityId),
    db
      .select({
        activityId: activityComments.activityId,
        n: count(),
      })
      .from(activityComments)
      .where(inArray(activityComments.activityId, ids))
      .groupBy(activityComments.activityId),
    db
      .select({ activityId: activityLikes.activityId })
      .from(activityLikes)
      .where(
        and(
          eq(activityLikes.userId, viewerId),
          inArray(activityLikes.activityId, ids),
        ),
      ),
  ])

  const likeCountById = new Map(
    likeRows.map((row) => [row.activityId, Number(row.n)]),
  )
  const commentCountById = new Map(
    commentRows.map((row) => [row.activityId, Number(row.n)]),
  )
  const likedIds = new Set(likedRows.map((row) => row.activityId))

  return items.map((item) => ({
    ...item,
    likeCount: likeCountById.get(item.id) ?? 0,
    commentCount: commentCountById.get(item.id) ?? 0,
    viewerHasLiked: likedIds.has(item.id),
  }))
}

export async function countActivityLikes(activityId: string): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(activityLikes)
    .where(eq(activityLikes.activityId, activityId))
  return Number(row?.n ?? 0)
}

export async function countCommentLikes(commentId: string): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(commentLikes)
    .where(eq(commentLikes.commentId, commentId))
  return Number(row?.n ?? 0)
}

export async function listFriendsFeed(
  viewerId: string,
  options?: { cursor?: string | null; limit?: number },
): Promise<FeedPage> {
  const limit = options?.limit ?? FEED_PAGE_SIZE
  const friendIds = await listAcceptedFriendIds(viewerId)
  const actorIds = [...friendIds, viewerId]

  const cursor = options?.cursor ? decodeFeedCursor(options.cursor) : null
  const cursorDate = cursor ? new Date(cursor.createdAt) : null
  const cursorValid =
    cursor && cursorDate && !Number.isNaN(cursorDate.getTime())
      ? cursor
      : null

  const rows = await db
    .select({
      activityId: activities.id,
      activityType: activities.type,
      activityCreatedAt: activities.createdAt,
      activityRating: activities.rating,
      actorId: users.id,
      actorUsername: users.username,
      actorImage: users.image,
      bookId: books.id,
      bookTitle: books.title,
      bookCoverImageId: books.coverImageId,
      reviewBody: reviews.body,
    })
    .from(activities)
    .innerJoin(users, eq(users.id, activities.actorId))
    .innerJoin(books, eq(books.id, activities.bookId))
    .leftJoin(reviews, eq(reviews.id, activities.reviewId))
    .where(
      and(
        inArray(activities.actorId, actorIds),
        cursorValid
          ? or(
              lt(activities.createdAt, new Date(cursorValid.createdAt)),
              and(
                eq(activities.createdAt, new Date(cursorValid.createdAt)),
                lt(activities.id, cursorValid.id),
              ),
            )
          : undefined,
      ),
    )
    .orderBy(desc(activities.createdAt), desc(activities.id))
    .limit(limit + 1)

  const hasMore = rows.length > limit
  const pageRows = hasMore ? rows.slice(0, limit) : rows

  const items = await attachFeedEngagement(
    viewerId,
    pageRows.map((row) => ({
      id: row.activityId,
      type: row.activityType,
      createdAt: row.activityCreatedAt,
      rating: row.activityRating,
      reviewBody: row.reviewBody,
      actor: {
        id: row.actorId,
        username: row.actorUsername,
        image: row.actorImage,
      },
      book: {
        id: row.bookId,
        title: row.bookTitle,
        coverImageId: row.bookCoverImageId,
      },
    })),
  )

  const last = pageRows[pageRows.length - 1]
  const nextCursor =
    hasMore && last
      ? encodeFeedCursor({
          createdAt: last.activityCreatedAt.toISOString(),
          id: last.activityId,
        })
      : null

  return { items, nextCursor }
}
