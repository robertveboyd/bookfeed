import { and, asc, desc, eq } from "drizzle-orm"
import { z } from "zod"

import { authorsForBookIds } from "@/lib/books/queries"
import { isGenre } from "@/lib/books/types"
import { db } from "@/lib/db"
import { books, libraryEntries } from "@/lib/db/schema"
import type {
  LibraryBook,
  LibraryEntry,
  LibraryEntryTile,
  LibraryLists,
} from "@/lib/library/types"

const entrySelect = {
  id: libraryEntries.id,
  bookId: libraryEntries.bookId,
  status: libraryEntries.status,
  updatedAt: libraryEntries.updatedAt,
} as const

export async function getLibraryEntry(
  userId: string,
  bookId: string,
): Promise<LibraryEntry | null> {
  if (!z.uuid().safeParse(bookId).success) return null

  const [row] = await db
    .select(entrySelect)
    .from(libraryEntries)
    .where(
      and(
        eq(libraryEntries.userId, userId),
        eq(libraryEntries.bookId, bookId),
      ),
    )
    .limit(1)

  return row ?? null
}

export async function getCurrentlyReading(
  userId: string,
): Promise<LibraryEntry | null> {
  const [row] = await db
    .select(entrySelect)
    .from(libraryEntries)
    .where(
      and(
        eq(libraryEntries.userId, userId),
        eq(libraryEntries.status, "reading"),
      ),
    )
    .limit(1)

  return row ?? null
}

export async function listLibrary(userId: string): Promise<LibraryLists> {
  const rows = await db
    .select({
      ...entrySelect,
      title: books.title,
      coverImageId: books.coverImageId,
      genre: books.genre,
      description: books.description,
      publishYear: books.publishYear,
    })
    .from(libraryEntries)
    .innerJoin(books, eq(books.id, libraryEntries.bookId))
    .where(eq(libraryEntries.userId, userId))
    .orderBy(desc(libraryEntries.updatedAt), asc(books.title))

  const authorMap = await authorsForBookIds(rows.map((r) => r.bookId))

  const tiles: LibraryEntryTile[] = rows.map((row) => {
    const book: LibraryBook = {
      id: row.bookId,
      title: row.title,
      coverImageId: row.coverImageId,
      genre: isGenre(row.genre) ? row.genre : null,
      authors: authorMap.get(row.bookId) ?? [],
      description: row.description,
      publishYear: row.publishYear,
    }

    return {
      id: row.id,
      bookId: row.bookId,
      status: row.status,
      updatedAt: row.updatedAt,
      book,
    }
  })

  const reading = tiles.find((t) => t.status === "reading") ?? null
  const read = tiles.filter((t) => t.status === "read")
  const interested = tiles.filter((t) => t.status === "interested")

  return { reading, read, interested }
}
