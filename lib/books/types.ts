import type { BookRatingStats } from "@/lib/reviews/types"

/** Canonical genres — keep in sync with docs/GENRE_TAXONOMY.md */
export const GENRES = [
  "Fiction",
  "Fantasy",
  "Science Fiction",
  "Horror",
  "Mystery",
  "Romance",
  "Historical Fiction",
  "Young Adult",
  "Childrens",
  "Comics",
  "Short Stories",
  "Western",
  "Poetry",
  "Drama",
  "History",
  "Biography",
  "Politics",
  "Religion",
  "Science",
  "Business",
  "Philosophy",
  "Art",
  "Music",
  "Law",
  "Education",
  "Travel",
  "Technology",
  "Cooking",
  "Sports",
  "Essays",
] as const

export type Genre = (typeof GENRES)[number]

export function isGenre(value: string | null): value is Genre {
  return value !== null && (GENRES as readonly string[]).includes(value)
}

export type BookTile = {
  id: string
  title: string
  coverImageId: string
  genre: Genre | null
  authors: string[]
  /** Present on catalog tiles; omitted elsewhere. Hidden in UI when count is 0. */
  rating?: BookRatingStats | null
}

export type BookShelf = {
  genre: Genre
  books: BookTile[]
}

export type BookDetail = BookTile & {
  description: string | null
  isbn13: string | null
  isbn10: string | null
  publishYear: number | null
  openLibraryWorkKey: string
}

export type SearchBooksParams = {
  q: string;
  limit?: number;
  offset?: number;
} 

export type SearchBooksResult = {
  items: BookTile[];
  total: number;
}