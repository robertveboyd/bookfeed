"use server"

import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { recordActivity } from "@/lib/activity/record"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { books, reviews } from "@/lib/db/schema"
import { getLibraryEntry } from "@/lib/library/queries"
import {
  getMyReview,
  normalizeReviewBody,
  reviewSelect,
} from "@/lib/reviews/queries"
import {
  REVIEW_BODY_MAX,
  type DeleteReviewResult,
  type ReviewActionResult,
  type UpsertReviewInput,
} from "@/lib/reviews/types"

const upsertSchema = z.object({
  bookId: z.uuid(),
  rating: z.number().int().min(1).max(5),
  body: z.string().max(REVIEW_BODY_MAX).nullable().optional(),
})

const deleteSchema = z.object({
  bookId: z.uuid(),
})

function revalidateReviewPaths(bookId: string, username?: string) {
  revalidatePath(`/books/${bookId}`)
  revalidatePath("/library")
  revalidatePath("/")
  if (username) {
    revalidatePath(`/users/${username}/books/${bookId}`)
  }
}

export async function upsertReview(
  input: UpsertReviewInput,
): Promise<ReviewActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, code: "unauthorized", message: "Sign in required." }
  }
  const userId = session.user.id
  const username = session.user.username

  const parsed = upsertSchema.safeParse({
    bookId: input.bookId,
    rating: input.rating,
    body: input.body ?? null,
  })
  if (!parsed.success) {
    return { ok: false, code: "invalid", message: "Invalid rating or review." }
  }

  const { bookId, rating } = parsed.data
  const body = normalizeReviewBody(parsed.data.body)
  if (body && body.length > REVIEW_BODY_MAX) {
    return {
      ok: false,
      code: "invalid",
      message: `Review must be at most ${REVIEW_BODY_MAX} characters.`,
    }
  }

  const [book] = await db
    .select({ id: books.id })
    .from(books)
    .where(eq(books.id, bookId))
    .limit(1)
  if (!book) {
    return { ok: false, code: "not_found", message: "Book not found." }
  }

  const entry = await getLibraryEntry(userId, bookId)
  if (entry?.status !== "read") {
    return {
      ok: false,
      code: "forbidden",
      message: "Mark this book as read before rating it.",
    }
  }

  const now = new Date()
  const existing = await getMyReview(userId, bookId)

  try {
    if (existing) {
      const [updated] = await db
        .update(reviews)
        .set({ rating, body, updatedAt: now })
        .where(eq(reviews.id, existing.id))
        .returning(reviewSelect)

      // First time body appears → reviewed. Rating/body edits alone → no event.
      if (!existing.body && body) {
        await recordActivity({
          actorId: userId,
          type: "reviewed",
          bookId,
          reviewId: updated.id,
          rating: updated.rating,
        })
      }

      revalidateReviewPaths(bookId, username)
      return { ok: true, review: updated }
    }

    const [inserted] = await db
      .insert(reviews)
      .values({ userId, bookId, rating, body, updatedAt: now })
      .returning(reviewSelect)

    // First save with body → reviewed only; rating-only → rated.
    await recordActivity({
      actorId: userId,
      type: body ? "reviewed" : "rated",
      bookId,
      reviewId: inserted.id,
      rating: inserted.rating,
    })

    revalidateReviewPaths(bookId, username)
    return { ok: true, review: inserted }
  } catch {
    return {
      ok: false,
      code: "invalid",
      message: "Something went wrong. Please try again.",
    }
  }
}

export async function deleteReview(input: {
  bookId: string
}): Promise<DeleteReviewResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, code: "unauthorized", message: "Sign in required." }
  }
  const userId = session.user.id
  const username = session.user.username

  const parsed = deleteSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, code: "invalid", message: "Invalid input." }
  }
  const { bookId } = parsed.data

  const existing = await getMyReview(userId, bookId)
  if (!existing) {
    return { ok: false, code: "not_found", message: "No rating to clear." }
  }

  // Activity rows kept; reviewId set null via FK ON DELETE SET NULL.
  await db
    .delete(reviews)
    .where(and(eq(reviews.id, existing.id), eq(reviews.userId, userId)))

  revalidateReviewPaths(bookId, username)
  return { ok: true }
}
