export const REVIEW_BODY_MAX = 2000

export type Review = {
  id: string
  userId: string
  bookId: string
  rating: number
  body: string | null
  createdAt: Date
  updatedAt: Date
}

export type BookRatingStats = {
  average: number
  count: number
}

export type UpsertReviewInput = {
  bookId: string
  rating: number
  body?: string | null
}

export type ReviewActionResult =
  | { ok: true; review: Review }
  | {
      ok: false
      code: "unauthorized" | "not_found" | "invalid" | "forbidden"
      message: string
    }

export type DeleteReviewResult =
  | { ok: true }
  | {
      ok: false
      code: "unauthorized" | "not_found" | "invalid"
      message: string
    }
