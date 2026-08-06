import type { Genre } from "../../lib/books/types"

export type BookSeed = {
  openLibraryWorkKey: string
  title: string
  description: string
  genre: Genre
  isbn13: string
  isbn10?: string
  /** OL numeric cover id when ISBN has no cover; defaults to isbn13 at insert */
  coverImageId?: string
  publishYear: number
  authorKeys: string[]
}

export type AuthorSeed = {
  openLibraryAuthorKey: string
  name: string
}
