import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { BookDetail } from "@/components/catalog/book-detail"
import { auth } from "@/lib/auth"
import { getBookById } from "@/lib/books/queries"
import { getLibraryEntry } from "@/lib/library/queries"

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
  const session = await auth()

  const [book, entry] = await Promise.all([
    getBookById(bookId),
    session?.user?.id
      ? getLibraryEntry(session.user.id, bookId)
      : Promise.resolve(null),
  ])

  if (!book) notFound()

  return (
    <BookDetail
      book={book}
      libraryStatus={entry?.status ?? null}
      canEditLibrary
    />
  )
}
