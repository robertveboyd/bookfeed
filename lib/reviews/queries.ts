import { and, avg, count, eq, inArray } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/lib/db"
import { reviews } from "@/lib/db/schema"
import type { BookRatingStats, Review } from "@/lib/reviews/types"

const reviewSelect = {
  id: reviews.id,
  userId: reviews.userId,
  bookId: reviews.bookId,
  rating: reviews.rating,
  body: reviews.body,
  createdAt: reviews.createdAt,
  updatedAt: reviews.updatedAt,
} as const

export async function getMyReview(
  userId: string,
  bookId: string,
): Promise<Review | null> {
  if (!z.uuid().safeParse(bookId).success) return null

  const [row] = await db
    .select(reviewSelect)
    .from(reviews)
    .where(and(eq(reviews.userId, userId), eq(reviews.bookId, bookId)))
    .limit(1)

  return row ?? null
}

export async function getUserBookReview(
  userId: string,
  bookId: string,
): Promise<Review | null> {
  return getMyReview(userId, bookId)
}

export async function ratingStatsForBookIds(
  bookIds: string[],
): Promise<Map<string, BookRatingStats>> {
  const byBook = new Map<string, BookRatingStats>()
  if (bookIds.length === 0) return byBook

  const rows = await db
    .select({
      bookId: reviews.bookId,
      average: avg(reviews.rating),
      count: count(),
    })
    .from(reviews)
    .where(inArray(reviews.bookId, bookIds))
    .groupBy(reviews.bookId)

  for (const row of rows) {
    const n = Number(row.count ?? 0)
    if (n === 0) continue
    byBook.set(row.bookId, {
      average: Number(row.average ?? 0),
      count: n,
    })
  }

  return byBook
}

export async function getBookRatingStats(
  bookId: string,
): Promise<BookRatingStats> {
  if (!z.uuid().safeParse(bookId).success) {
    return { average: 0, count: 0 }
  }

  const byBook = await ratingStatsForBookIds([bookId])
  return byBook.get(bookId) ?? { average: 0, count: 0 }
}

/** Normalize review body: trim, empty → null, enforce max length in actions. */
export function normalizeReviewBody(
  body: string | null | undefined,
): string | null {
  if (body == null) return null
  const trimmed = body.trim()
  return trimmed.length === 0 ? null : trimmed
}

export { reviewSelect }
