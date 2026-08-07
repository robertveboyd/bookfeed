import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { BookDetail } from "@/components/catalog/book-detail"
import { requireSession } from "@/lib/auth/util/session"
import { getBookById } from "@/lib/books/queries"
import { getLibraryEntry } from "@/lib/library/queries"
import { getBookRatingStats, getMyReview } from "@/lib/reviews/queries"

type PageProps = {
  params: Promise<{ bookId: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { bookId } = await params
  const book = await getBookById(bookId)

  return {
    title: book?.title ?? "Book",
  }
}

export default async function Page({ params }: PageProps) {
  const { bookId } = await params
  const session = await requireSession()

  const [book, entry, review, stats] = await Promise.all([
    getBookById(bookId),
    getLibraryEntry(session.user.id, bookId),
    getMyReview(session.user.id, bookId),
    getBookRatingStats(bookId),
  ])

  if (!book) notFound()

  return (
    <BookDetail
      book={book}
      libraryStatus={entry?.status ?? null}
      canEditLibrary
      initialReview={review}
      stats={stats}
    />
  )
}
