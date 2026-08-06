import { BOOK_SEED } from "./books"

/** Effective cover id stored in DB / used for local filenames */
export function seedCoverImageId(book: {
  coverImageId?: string
  isbn13: string
}): string {
  return book.coverImageId ?? book.isbn13
}

export function allSeedCoverImageIds(): string[] {
  const ids = new Set(BOOK_SEED.map(seedCoverImageId))
  return [...ids]
}
