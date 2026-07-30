export const GENRES = [
  "Fiction",
  "Fantasy",
  "Science Fiction",
  "Horror",
] as const

export type Genre = (typeof GENRES)[number]

export type BookTile = {
  id: string
  title: string
  coverImageId: string
  genre: Genre | null
  authors: string[]
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