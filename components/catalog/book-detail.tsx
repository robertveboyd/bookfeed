import Link from "next/link"

import { BookCover } from "@/components/catalog/book-cover"
import { BookDetailActions } from "@/components/catalog/book-detail-actions"
import type { BookDetail as BookDetailData } from "@/lib/books/types"
import type { LibraryStatus } from "@/lib/library/types"
import type { BookRatingStats, Review } from "@/lib/reviews/types"

type BookDetailProps = {
  book: BookDetailData
  libraryStatus?: LibraryStatus | null
  canEditLibrary?: boolean
  initialReview?: Review | null
  stats?: BookRatingStats
}

export function BookDetail({
  book,
  libraryStatus = null,
  canEditLibrary = true,
  initialReview = null,
  stats = { average: 0, count: 0 },
}: BookDetailProps) {
  const authorsLabel = book.authors.join(", ")
  const meta = [book.genre, book.publishYear].filter(Boolean).join(" · ")

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <p>
        <Link
          href="/books"
          className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
        >
          ← Back to catalog
        </Link>
      </p>

      <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
        <div className="relative mx-auto aspect-[2/3] w-48 shrink-0 overflow-hidden rounded-md bg-muted shadow-sm sm:mx-0 sm:w-56 md:w-64">
          <BookCover
            coverImageId={book.coverImageId}
            title={book.title}
            size="L"
          />
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-balance">
              {book.title}
            </h1>
            {authorsLabel ? (
              <p className="text-muted-foreground text-base">{authorsLabel}</p>
            ) : null}
            {meta ? (
              <p className="text-muted-foreground text-sm">{meta}</p>
            ) : null}
          </div>

          <BookDetailActions
            bookId={book.id}
            initialLibraryStatus={libraryStatus}
            canEditLibrary={canEditLibrary}
            initialReview={initialReview}
            stats={stats}
          />

          {book.description ? (
            <p className="text-sm leading-relaxed text-pretty whitespace-pre-wrap">
              {book.description}
            </p>
          ) : (
            <p className="text-muted-foreground text-sm">
              No description available.
            </p>
          )}

          {(book.isbn13 || book.isbn10) && (
            <dl className="text-muted-foreground space-y-1 text-sm">
              {book.isbn13 ? (
                <div className="flex gap-2">
                  <dt className="font-medium text-foreground">ISBN-13</dt>
                  <dd className="font-mono">{book.isbn13}</dd>
                </div>
              ) : null}
              {book.isbn10 ? (
                <div className="flex gap-2">
                  <dt className="font-medium text-foreground">ISBN-10</dt>
                  <dd className="font-mono">{book.isbn10}</dd>
                </div>
              ) : null}
            </dl>
          )}
        </div>
      </div>
    </div>
  )
}
