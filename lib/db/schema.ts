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
  check,
} from "drizzle-orm/pg-core"

import { FRIENDSHIP_STATUSES } from "@/lib/friends/types"
import { LIBRARY_STATUSES } from "@/lib/library/types"
import { ACTIVITY_TYPES, COMMENT_BODY_MAX } from "@/lib/activity/types"

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
    coverImageId: text("cover_image_id").notNull(), // OL numeric cover id (or ISBN for legacy seed); build S/M/L URLs via coverUrl()
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

export const friendshipStatusEnum = pgEnum(
  "friendship_status",
  FRIENDSHIP_STATUSES,
)

export const FriendshipsUnique = {
  pair: "friendships_requester_id_addressee_id_unique",
} as const

export const friendships = pgTable(
  "friendships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    requesterId: uuid("requester_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    addresseeId: uuid("addressee_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: friendshipStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex(FriendshipsUnique.pair).on(t.requesterId, t.addresseeId),
    check(
      "friendships_no_self",
      sql`${t.requesterId} <> ${t.addresseeId}`,
    ),
    index("friendships_addressee_id_status_idx").on(t.addresseeId, t.status),
    index("friendships_requester_id_status_idx").on(t.requesterId, t.status),
  ],
)

export const ReviewsUnique = {
  userBook: "reviews_user_id_book_id_unique",
} as const

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    body: text("body"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex(ReviewsUnique.userBook).on(t.userId, t.bookId),
    check("reviews_rating_range", sql`${t.rating} >= 1 AND ${t.rating} <= 5`),
    index("reviews_book_id_updated_at_idx").on(t.bookId, t.updatedAt),
    index("reviews_user_id_idx").on(t.userId),
  ],
)

export const activityTypeEnum = pgEnum("activity_type", ACTIVITY_TYPES)

export const activities = pgTable(
  "activities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: uuid("actor_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: activityTypeEnum("type").notNull(),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    reviewId: uuid("review_id").references(() => reviews.id, {
      onDelete: "set null",
    }),
    rating: integer("rating"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("activities_created_at_idx").on(t.createdAt),
    index("activities_actor_id_created_at_idx").on(t.actorId, t.createdAt),
    check(
      "activities_rating_range",
      sql`${t.rating} IS NULL OR (${t.rating} >= 1 AND ${t.rating} <= 5)`,
    ),
  ],
)

export const ActivityLikesUnique = {
  activityUser: "activity_likes_activity_id_user_id_pk",
} as const

export const activityLikes = pgTable(
  "activity_likes",
  {
    activityId: uuid("activity_id")
      .notNull()
      .references(() => activities.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    primaryKey({
      name: ActivityLikesUnique.activityUser,
      columns: [t.activityId, t.userId],
    }),
    index("activity_likes_user_id_idx").on(t.userId),
  ],
)

export const activityComments = pgTable(
  "activity_comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    activityId: uuid("activity_id")
      .notNull()
      .references(() => activities.id, { onDelete: "cascade" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
    deletedById: uuid("deleted_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    check(
      "activity_comments_body_length",
      sql`char_length(${t.body}) > 0 AND char_length(${t.body}) <= ${sql.raw(String(COMMENT_BODY_MAX))}`,
    ),
    index("activity_comments_activity_id_created_at_idx").on(
      t.activityId,
      t.createdAt,
      t.id,
    ),
    index("activity_comments_author_id_idx").on(t.authorId),
  ],
)

export const CommentLikesUnique = {
  commentUser: "comment_likes_comment_id_user_id_pk",
} as const

export const commentLikes = pgTable(
  "comment_likes",
  {
    commentId: uuid("comment_id")
      .notNull()
      .references(() => activityComments.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    primaryKey({
      name: CommentLikesUnique.commentUser,
      columns: [t.commentId, t.userId],
    }),
    index("comment_likes_user_id_idx").on(t.userId),
  ],
)

export const UserTopBooksUnique = {
  userPosition: "user_top_books_user_id_position_unique",
  userBook: "user_top_books_user_id_book_id_unique",
} as const

export const userTopBooks = pgTable(
  "user_top_books",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.position] }),
    uniqueIndex(UserTopBooksUnique.userPosition).on(t.userId, t.position),
    uniqueIndex(UserTopBooksUnique.userBook).on(t.userId, t.bookId),
    check(
      "user_top_books_position_range",
      sql`${t.position} >= 1 AND ${t.position} <= 5`,
    ),
    index("user_top_books_user_id_idx").on(t.userId),
  ],
)
