"use server"

import { and, eq, inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { libraryEntries, userTopBooks } from "@/lib/db/schema"
import type { TopBooksActionResult } from "@/lib/users/top-books/types"

const saveSchema = z.object({
  bookIds: z.array(z.uuid()).max(5),
})

function revalidateTopBookPaths(username?: string) {
  revalidatePath("/library")
  if (username) revalidatePath(`/users/${username}`)
}

/**
 * Replace the user's Top 5 with an ordered list (positions 1..n).
 * Empty array clears all slots. Ranks are compacted by array order.
 */
export async function saveTopBooks(input: {
  bookIds: string[]
}): Promise<TopBooksActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, code: "unauthorized", message: "Sign in required." }
  }
  const userId = session.user.id
  const username = session.user.username

  const parsed = saveSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, code: "invalid", message: "Invalid input." }
  }

  const bookIds = parsed.data.bookIds
  if (new Set(bookIds).size !== bookIds.length) {
    return {
      ok: false,
      code: "invalid",
      message: "Duplicate books are not allowed in Top 5.",
    }
  }

  if (bookIds.length > 0) {
    const readRows = await db
      .select({ bookId: libraryEntries.bookId })
      .from(libraryEntries)
      .where(
        and(
          eq(libraryEntries.userId, userId),
          eq(libraryEntries.status, "read"),
          inArray(libraryEntries.bookId, bookIds),
        ),
      )

    if (readRows.length !== bookIds.length) {
      return {
        ok: false,
        code: "forbidden",
        message: "Only finished books can be in your Top 5.",
      }
    }
  }

  const now = new Date()

  try {
    await db.delete(userTopBooks).where(eq(userTopBooks.userId, userId))

    if (bookIds.length > 0) {
      await db.insert(userTopBooks).values(
        bookIds.map((bookId, index) => ({
          userId,
          bookId,
          position: index + 1,
          updatedAt: now,
        })),
      )
    }

    revalidateTopBookPaths(username)
    return { ok: true }
  } catch {
    return {
      ok: false,
      code: "invalid",
      message: "Something went wrong. Please try again.",
    }
  }
}
