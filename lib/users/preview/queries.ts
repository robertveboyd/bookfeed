import { and, count, eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/lib/db"
import { books, libraryEntries, users } from "@/lib/db/schema"
import type { UserHoverPreview } from "@/lib/users/preview/types"

export async function getUserHoverPreview(
  userId: string,
): Promise<UserHoverPreview | null> {
  if (!z.uuid().safeParse(userId).success) return null

  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
      image: users.image,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) return null

  const [[reading], [readRow]] = await Promise.all([
    db
      .select({
        bookId: books.id,
        title: books.title,
        coverImageId: books.coverImageId,
      })
      .from(libraryEntries)
      .innerJoin(books, eq(books.id, libraryEntries.bookId))
      .where(
        and(
          eq(libraryEntries.userId, userId),
          eq(libraryEntries.status, "reading"),
        ),
      )
      .limit(1),
    db
      .select({ n: count() })
      .from(libraryEntries)
      .where(
        and(
          eq(libraryEntries.userId, userId),
          eq(libraryEntries.status, "read"),
        ),
      ),
  ])

  return {
    id: user.id,
    username: user.username,
    image: user.image,
    booksRead: Number(readRow?.n ?? 0),
    reading: reading ?? null,
  }
}
