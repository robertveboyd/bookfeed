"use server"

import { and, eq, ne } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { recordActivity } from "@/lib/activity/record"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getPgError, PgCode } from "@/lib/db/errors"
import {
  books,
  libraryEntries,
  LibraryEntriesUnique,
} from "@/lib/db/schema"
import {
  LIBRARY_STATUSES,
  type LibraryEntry,
  type LibraryStatus,
  type SetLibraryStatusInput,
  type SetLibraryStatusResult,
} from "@/lib/library/types"

const inputSchema = z.object({
  bookId: z.uuid(),
  status: z.enum(LIBRARY_STATUSES),
  resolveReadingConflict: z.enum(["finish", "demote"]).optional(),
})

const entryReturning = {
  id: libraryEntries.id,
  bookId: libraryEntries.bookId,
  status: libraryEntries.status,
  updatedAt: libraryEntries.updatedAt,
} as const

export async function setLibraryStatus(
  input: SetLibraryStatusInput,
): Promise<SetLibraryStatusResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, code: "unauthorized", message: "Sign in required." }
  }
  const userId = session.user.id

  const parsed = inputSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, code: "invalid", message: "Invalid input." }
  }
  const { bookId, status, resolveReadingConflict } = parsed.data

  const [book] = await db
    .select({ id: books.id, title: books.title })
    .from(books)
    .where(eq(books.id, bookId))
    .limit(1)
  if (!book) {
    return { ok: false, code: "not_found", message: "Book not found." }
  }

  try {
    if (status === "reading") {
      const [current] = await db
        .select({
          id: libraryEntries.id,
          bookId: libraryEntries.bookId,
        })
        .from(libraryEntries)
        .where(
          and(
            eq(libraryEntries.userId, userId),
            eq(libraryEntries.status, "reading"),
            ne(libraryEntries.bookId, bookId),
          ),
        )
        .limit(1)

      if (current) {
        if (!resolveReadingConflict) {
          const [conflictBook] = await db
            .select({ title: books.title })
            .from(books)
            .where(eq(books.id, current.bookId))
            .limit(1)

          const title = conflictBook?.title ?? "Another book"
          return {
            ok: false,
            code: "conflict",
            conflict: { bookId: current.bookId, title },
            message: `You're already reading “${title}”. Mark it finished, or move it to Interested?`,
          }
        }

        const now = new Date()
        await db
          .update(libraryEntries)
          .set({
            status:
              resolveReadingConflict === "finish" ? "read" : "interested",
            updatedAt: now,
          })
          .where(eq(libraryEntries.id, current.id))

        // Only reading → read emits finished_reading (not demote to interested).
        if (resolveReadingConflict === "finish") {
          await recordActivity({
            actorId: userId,
            type: "finished_reading",
            bookId: current.bookId,
          })
        }
      }
    }

    const now = new Date()
    const [existing] = await db
      .select(entryReturning)
      .from(libraryEntries)
      .where(
        and(
          eq(libraryEntries.userId, userId),
          eq(libraryEntries.bookId, bookId),
        ),
      )
      .limit(1)

    const previousStatus: LibraryStatus | null = existing?.status ?? null
    const fields = { status, updatedAt: now }

    let entry: LibraryEntry
    if (existing) {
      const [updated] = await db
        .update(libraryEntries)
        .set(fields)
        .where(eq(libraryEntries.id, existing.id))
        .returning(entryReturning)
      entry = updated
    } else {
      const [inserted] = await db
        .insert(libraryEntries)
        .values({ userId, bookId, ...fields })
        .returning(entryReturning)
      entry = inserted
    }

    if (status === "reading" && previousStatus !== "reading") {
      await recordActivity({
        actorId: userId,
        type: "started_reading",
        bookId,
      })
    } else if (status === "read" && previousStatus === "reading") {
      await recordActivity({
        actorId: userId,
        type: "finished_reading",
        bookId,
      })
    }

    revalidatePath(`/books/${bookId}`)
    revalidatePath("/library")
    revalidatePath("/profile")
    revalidatePath("/")

    return { ok: true, entry }
  } catch (error) {
    const pg = getPgError(error)
    if (
      pg.code === PgCode.UniqueViolation &&
      pg.constraint === LibraryEntriesUnique.oneReadingPerUser
    ) {
      const [current] = await db
        .select({
          bookId: libraryEntries.bookId,
          title: books.title,
        })
        .from(libraryEntries)
        .innerJoin(books, eq(books.id, libraryEntries.bookId))
        .where(
          and(
            eq(libraryEntries.userId, userId),
            eq(libraryEntries.status, "reading"),
            ne(libraryEntries.bookId, bookId),
          ),
        )
        .limit(1)

      if (current) {
        return {
          ok: false,
          code: "conflict",
          conflict: { bookId: current.bookId, title: current.title },
          message: `You're already reading “${current.title}”. Mark it finished, or move it to Interested?`,
        }
      }

      return {
        ok: false,
        code: "conflict",
        conflict: { bookId: "", title: "Another book" },
        message: "You're already reading another book.",
      }
    }

    return {
      ok: false,
      code: "invalid",
      message: "Something went wrong. Please try again.",
    }
  }
}
