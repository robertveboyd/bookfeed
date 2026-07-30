import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { BookDetail } from "@/components/catalog/book-detail"
import { getBookById } from "@/lib/books/queries"

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
  const book = await getBookById(bookId)

  if (!book) notFound()

  return <BookDetail book={book} />
}