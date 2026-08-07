"use client"

import { useEffect, useState } from "react"

import { LibraryStatusControls } from "@/components/library/library-status-controls"
import { BookReviewForm } from "@/components/reviews/book-review-form"
import type { LibraryStatus } from "@/lib/library/types"
import type { BookRatingStats, Review } from "@/lib/reviews/types"

type BookDetailActionsProps = {
  bookId: string
  initialLibraryStatus: LibraryStatus | null
  canEditLibrary?: boolean
  initialReview: Review | null
  stats: BookRatingStats
}

export function BookDetailActions({
  bookId,
  initialLibraryStatus,
  canEditLibrary = true,
  initialReview,
  stats,
}: BookDetailActionsProps) {
  const [libraryStatus, setLibraryStatus] = useState(initialLibraryStatus)

  useEffect(() => {
    setLibraryStatus(initialLibraryStatus)
  }, [initialLibraryStatus])

  return (
    <>
      <LibraryStatusControls
        bookId={bookId}
        initialStatus={libraryStatus}
        canEdit={canEditLibrary}
        onStatusChange={setLibraryStatus}
      />
      <BookReviewForm
        bookId={bookId}
        libraryStatus={libraryStatus}
        initialReview={initialReview}
        stats={stats}
      />
    </>
  )
}
