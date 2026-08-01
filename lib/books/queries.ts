import { asc, eq, ilike, inArray, or, sql } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/lib/db"
import { authors, bookAuthors, books } from "@/lib/db/schema"

import {
  GENRES,
  isGenre,
  type BookDetail,
  type BookShelf,
  type BookTile,
  type SearchBooksParams,
  type SearchBooksResult,
} from "@/lib/books/types"

export async function authorsForBookIds(
  bookIds: string[],
): Promise<Map<string, string[]>> {
  if (bookIds.length === 0) return new Map()

  const rows = await db
    .select({
      bookId: bookAuthors.bookId,
      name: authors.name,
      position: bookAuthors.position,
    })
    .from(bookAuthors)
    .innerJoin(authors, eq(authors.id, bookAuthors.authorId))
    .where(inArray(bookAuthors.bookId, bookIds))
    .orderBy(asc(bookAuthors.bookId), asc(bookAuthors.position))

  const byBook = new Map<string, string[]>()
  for (const row of rows) {
    const list = byBook.get(row.bookId) ?? []
    list.push(row.name)
    byBook.set(row.bookId, list)
  }
  return byBook
}

export async function listShelves(options?: {
  perShelf?: number
}): Promise<BookShelf[]> {
  // await new Promise((resolve) => setTimeout(resolve, 5000))

  const perShelf = options?.perShelf ?? 12

  const booksByGenre = await Promise.all(
    GENRES.map(async (genre) => {
      const bookRows = await db
        .select({
          id: books.id,
          title: books.title,
          coverImageId: books.coverImageId,
          genre: books.genre,
        })
        .from(books)
        .where(eq(books.genre, genre))
        .orderBy(asc(books.title))
        .limit(perShelf)

      return { genre, bookRows }
    }),
  )

  const allIds = booksByGenre.flatMap(({ bookRows }) =>
    bookRows.map((b) => b.id),
  )
  const authorMap = await authorsForBookIds(allIds)

  return booksByGenre
    .map(({ genre, bookRows }) => {
      const tiles: BookTile[] = bookRows.map((book) => ({
        id: book.id,
        title: book.title,
        coverImageId: book.coverImageId,
        genre: isGenre(book.genre) ? book.genre : null,
        authors: authorMap.get(book.id) ?? [],
      }))

      return { genre, books: tiles } satisfies BookShelf
    })
    .filter((shelf) => shelf.books.length > 0)
}

export async function getBookById(id: string): Promise<BookDetail | null> {
  if (!z.uuid().safeParse(id).success) return null

  const [book] = await db
    .select({
      id: books.id,
      title: books.title,
      coverImageId: books.coverImageId,
      genre: books.genre,
      description: books.description,
      isbn13: books.isbn13,
      isbn10: books.isbn10,
      publishYear: books.publishYear,
      openLibraryWorkKey: books.openLibraryWorkKey,
    })
    .from(books)
    .where(eq(books.id, id))
    .limit(1)

  if (!book) return null

  const authorMap = await authorsForBookIds([book.id])

  return {
    id: book.id,
    title: book.title,
    coverImageId: book.coverImageId,
    genre: isGenre(book.genre) ? book.genre : null,
    authors: authorMap.get(book.id) ?? [],
    description: book.description,
    isbn13: book.isbn13,
    isbn10: book.isbn10,
    publishYear: book.publishYear,
    openLibraryWorkKey: book.openLibraryWorkKey,
  }
}

function escapeLikePattern(value: string) {
  return value.replace(/[\\%_]/g, (ch) => `\\${ch}`)
}
export async function searchBooks(
  params: SearchBooksParams,
): Promise<SearchBooksResult> {
  const q = params.q.trim()
  const limit = params.limit ?? 24
  const offset = params.offset ?? 0
  if (!q) {
    return { items: [], total: 0 }
  }
  const pattern = `%${escapeLikePattern(q)}%`
  const match = or(
    ilike(books.title, pattern),
    ilike(authors.name, pattern),
  )
  const [countRow] = await db
    .select({
      total: sql<number>`count(distinct ${books.id})::int`,
    })
    .from(books)
    .leftJoin(bookAuthors, eq(bookAuthors.bookId, books.id))
    .leftJoin(authors, eq(authors.id, bookAuthors.authorId))
    .where(match)
  const bookRows = await db
    .selectDistinct({
      id: books.id,
      title: books.title,
      coverImageId: books.coverImageId,
      genre: books.genre,
    })
    .from(books)
    .leftJoin(bookAuthors, eq(bookAuthors.bookId, books.id))
    .leftJoin(authors, eq(authors.id, bookAuthors.authorId))
    .where(match)
    .orderBy(asc(books.title))
    .limit(limit)
    .offset(offset)
  const authorMap = await authorsForBookIds(bookRows.map((b) => b.id))
  const items: BookTile[] = bookRows.map((book) => ({
    id: book.id,
    title: book.title,
    coverImageId: book.coverImageId,
    genre: isGenre(book.genre) ? book.genre : null,
    authors: authorMap.get(book.id) ?? [],
  }))
  return {
    items,
    total: countRow?.total ?? 0,
  }
}