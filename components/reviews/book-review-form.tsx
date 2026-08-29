"use client"

import { StarIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"

import { StarRatingInput } from "@/components/reviews/star-rating"
import { Button } from "@/components/ui/button"
import type { LibraryStatus } from "@/lib/library/types"
import { deleteReview, upsertReview } from "@/lib/reviews/actions"
import {
  REVIEW_BODY_MAX,
  type BookRatingStats,
  type Review,
} from "@/lib/reviews/types"
import { cn } from "@/lib/utils"

type BookReviewFormProps = {
  bookId: string
  libraryStatus: LibraryStatus | null
  initialReview: Review | null
  stats: BookRatingStats
}

function formatAverage(average: number): string {
  return average.toFixed(1)
}

export function BookCommunityRating({
  stats,
  className,
}: {
  stats: BookRatingStats
  className?: string
}) {
  if (stats.count === 0) return null

  return (
    <p
      className={cn(
        "text-muted-foreground flex items-center gap-1.5 text-sm",
        className,
      )}
    >
      <StarIcon className="text-foreground size-3.5 fill-current" aria-hidden />
      <span>
        <span className="text-foreground font-medium">
          {formatAverage(stats.average)}
        </span>
        {" · "}
        {stats.count} {stats.count === 1 ? "rating" : "ratings"}
      </span>
    </p>
  )
}

export function BookReviewForm({
  bookId,
  libraryStatus,
  initialReview,
  stats,
}: BookReviewFormProps) {
  const router = useRouter()
  const canRate = libraryStatus === "read"
  const [rating, setRating] = useState(initialReview?.rating ?? 0)
  const [body, setBody] = useState(initialReview?.body ?? "")
  const [hasReview, setHasReview] = useState(Boolean(initialReview))
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    setRating(initialReview?.rating ?? 0)
    setBody(initialReview?.body ?? "")
    setHasReview(Boolean(initialReview))
  }, [initialReview])

  function onSave() {
    if (!canRate || rating < 1) return
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const result = await upsertReview({
        bookId,
        rating,
        body,
      })
      if (!result.ok) {
        setError(result.message)
        return
      }
      setHasReview(true)
      setRating(result.review.rating)
      setBody(result.review.body ?? "")
      setSaved(true)
      router.refresh()
    })
  }

  function onClear() {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const result = await deleteReview({ bookId })
      if (!result.ok) {
        setError(result.message)
        return
      }
      setHasReview(false)
      setRating(0)
      setBody("")
      router.refresh()
    })
  }

  if (!canRate) return null

  const heading = hasReview ? "Your rating" : "Rate this book"

  return (
    <section className="space-y-4 border-t border-border pt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-medium tracking-tight">{heading}</h2>
        {stats.count > 0 ? (
          <BookCommunityRating stats={stats} />
        ) : (
          <p className="text-muted-foreground text-sm">Be the first to rate</p>
        )}
      </div>

      <div className="space-y-3">
        <StarRatingInput
          value={rating}
          onChange={(next) => {
            setRating(next)
            setSaved(false)
          }}
          disabled={pending}
        />

        <div className="space-y-1.5">
          <label htmlFor={`review-body-${bookId}`} className="sr-only">
            Review (optional)
          </label>
          <textarea
            id={`review-body-${bookId}`}
            value={body}
            onChange={(e) => {
              setBody(e.target.value)
              setSaved(false)
            }}
            disabled={pending}
            maxLength={REVIEW_BODY_MAX}
            rows={4}
            placeholder="Write a short review (optional)…"
            className={cn(
              "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full min-w-0 rounded-lg border bg-transparent px-2.5 py-2 text-sm transition-colors outline-none focus-visible:ring-3 disabled:opacity-50 dark:bg-input/30",
            )}
          />
          <p className="text-muted-foreground text-xs">
            {body.length}/{REVIEW_BODY_MAX}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            disabled={pending || rating < 1}
            onClick={onSave}
          >
            {hasReview ? "Update" : "Save"}
          </Button>
          {hasReview ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={onClear}
            >
              Clear rating
            </Button>
          ) : null}
        </div>

        {saved ? (
          <p className="text-muted-foreground text-sm">Saved.</p>
        ) : null}
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
      </div>
    </section>
  )
}
