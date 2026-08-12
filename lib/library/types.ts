import type { BookTile } from "@/lib/books/types"

export const LIBRARY_STATUSES = ["interested", "reading", "read"] as const
export type LibraryStatus = (typeof LIBRARY_STATUSES)[number]

export type LibraryEntry = {
  id: string
  bookId: string
  status: LibraryStatus
  updatedAt: Date
}

/** Catalog tile fields plus detail used on library surfaces */
export type LibraryBook = BookTile & {
  description: string | null
  publishYear: number | null
}

/** Entry + tile fields for /library lists */
export type LibraryEntryTile = LibraryEntry & {
  book: LibraryBook
}

export type LibraryLists = {
  reading: LibraryEntryTile | null // at most one
  read: LibraryEntryTile[]
  interested: LibraryEntryTile[]
}

/** Action: conflict when starting B while A is reading */
export type ReadingConflict = {
  bookId: string
  title: string
}

export type SetLibraryStatusInput = {
  bookId: string
  status: LibraryStatus
  /** Required when status === "reading" and another book is already reading */
  resolveReadingConflict?: "finish" | "demote"
}

export type SetLibraryStatusResult =
  | { ok: true; entry: LibraryEntry }
  | {
      ok: false
      code: "conflict"
      conflict: ReadingConflict
      message: string
    }
  | {
      ok: false
      code: "unauthorized" | "not_found" | "invalid"
      message: string
    }

export type ClearLibraryStatusResult =
  | { ok: true }
  | {
      ok: false
      code: "unauthorized" | "not_found" | "invalid"
      message: string
    }
