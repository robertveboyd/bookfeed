import { sql } from "drizzle-orm"
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  integer,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core"

import { LIBRARY_STATUSES } from "@/lib/library/types"

export const UsersUnique = {
  email: "users_email_unique",
  username: "users_username_unique",
} as const

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Auth.js-compatible fields
  name: text("name"),
  email: text("email").notNull().unique(UsersUnique.email),
  emailVerified: timestamp("email_verified", {
    withTimezone: true,
    mode: "date",
  }),
  image: text("image"),

  // Bookfeed auth + profile
  passwordHash: text("password_hash"), // null until signup sets it; never store plaintext
  username: text("username").notNull().unique(UsersUnique.username),
  bio: text("bio"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
})

export const AuthorsUnique = {
  openLibraryAuthorKey: "authors_open_library_author_key_unique",
} as const

export const authors = pgTable(
  "authors",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    openLibraryAuthorKey: text("open_library_author_key").unique(
      AuthorsUnique.openLibraryAuthorKey,
    ),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("authors_name_idx").on(t.name)],
)

export const BooksUnique = {
  openLibraryWorkKey: "books_open_library_work_key_unique",
  isbn13: "books_isbn13_unique",
} as const

export const books = pgTable(
  "books",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    openLibraryWorkKey: text("open_library_work_key")
      .notNull()
      .unique(BooksUnique.openLibraryWorkKey),
    title: text("title").notNull(),
    description: text("description"),
    genre: text("genre"), // optional denormalized label; may become genres + book_genres later
    isbn13: text("isbn13").unique(BooksUnique.isbn13),
    isbn10: text("isbn10"),
    coverImageId: text("cover_image_id").notNull(), // Open Library covers id (ISBN for now); build S/M/L URLs in code
    publishYear: integer("publish_year"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("books_title_idx").on(t.title)],
)

export const bookAuthors = pgTable(
  "book_authors",
  {
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => authors.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),
  },
  (t) => [
    primaryKey({ columns: [t.bookId, t.authorId] }),
    index("book_authors_author_id_idx").on(t.authorId),
  ],
)

export const libraryStatusEnum = pgEnum("library_status", LIBRARY_STATUSES)

export const LibraryEntriesUnique = {
  userBook: "library_entries_user_id_book_id_unique",
  oneReadingPerUser: "library_entries_one_reading_per_user",
} as const

export const libraryEntries = pgTable(
  "library_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    status: libraryStatusEnum("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex(LibraryEntriesUnique.userBook).on(t.userId, t.bookId),
    uniqueIndex(LibraryEntriesUnique.oneReadingPerUser)
      .on(t.userId)
      .where(sql`${t.status} = 'reading'`),
    index("library_entries_user_id_status_idx").on(t.userId, t.status),
  ],
)
