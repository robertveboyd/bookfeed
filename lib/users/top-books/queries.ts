import { and, asc, eq } from "drizzle-orm"
import { z } from "zod"

import { authorsForBookIds } from "@/lib/books/queries"
import { isGenre } from "@/lib/books/types"
import { db } from "@/lib/db"
import { books, userTopBooks } from "@/lib/db/schema"
import type { TopBookSlot } from "@/lib/users/top-books/types"

export async function listTopBooks(userId: string): Promise<TopBookSlot[]> {
  const rows = await db
    .select({
      position: userTopBooks.position,
      bookId: books.id,
      title: books.title,
      coverImageId: books.coverImageId,
      genre: books.genre,
    })
    .from(userTopBooks)
    .innerJoin(books, eq(books.id, userTopBooks.bookId))
    .where(eq(userTopBooks.userId, userId))
    .orderBy(asc(userTopBooks.position))

  const authorMap = await authorsForBookIds(rows.map((r) => r.bookId))

  return rows.map((row) => ({
    position: row.position,
    book: {
      id: row.bookId,
      title: row.title,
      coverImageId: row.coverImageId,
      genre: isGenre(row.genre) ? row.genre : null,
      authors: authorMap.get(row.bookId) ?? [],
    },
  }))
}

export async function removeTopBookForUserBook(
  userId: string,
  bookId: string,
): Promise<void> {
  if (!z.uuid().safeParse(bookId).success) return

  await db
    .delete(userTopBooks)
    .where(
      and(eq(userTopBooks.userId, userId), eq(userTopBooks.bookId, bookId)),
    )
}
