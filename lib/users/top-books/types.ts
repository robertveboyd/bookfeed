import type { BookTile } from "@/lib/books/types"

export type TopBookSlot = {
  position: number
  book: BookTile
}

export type TopBooksActionResult =
  | { ok: true }
  | {
      ok: false
      code: "unauthorized" | "not_found" | "invalid" | "forbidden"
      message: string
    }
