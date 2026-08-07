import { and, desc, eq, inArray, lt, or } from "drizzle-orm"

import { FEED_PAGE_SIZE } from "@/lib/activity/types"
import type {
  FeedActivityItem,
  FeedCursor,
  FeedPage,
} from "@/lib/activity/types"
import { db } from "@/lib/db"
import { activities, books, reviews, users } from "@/lib/db/schema"
import { listAcceptedFriendIds } from "@/lib/friends/queries"

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

export async function listFriendsFeed(
  viewerId: string,
  options?: { cursor?: string | null; limit?: number },
): Promise<FeedPage> {
  const limit = options?.limit ?? FEED_PAGE_SIZE
  const friendIds = await listAcceptedFriendIds(viewerId)
  if (friendIds.length === 0) {
    return { items: [], nextCursor: null }
  }

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
        inArray(activities.actorId, friendIds),
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

  const items: FeedActivityItem[] = pageRows.map((row) => ({
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
  }))

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
