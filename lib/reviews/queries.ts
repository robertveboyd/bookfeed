import { and, avg, count, eq } from "drizzle-orm"
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

export async function getBookRatingStats(
  bookId: string,
): Promise<BookRatingStats> {
  if (!z.uuid().safeParse(bookId).success) {
    return { average: 0, count: 0 }
  }

  const [row] = await db
    .select({
      average: avg(reviews.rating),
      count: count(),
    })
    .from(reviews)
    .where(eq(reviews.bookId, bookId))

  const n = Number(row?.count ?? 0)
  if (n === 0) return { average: 0, count: 0 }

  return {
    average: Number(row?.average ?? 0),
    count: n,
  }
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
