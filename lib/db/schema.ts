import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core"

export const UsersUnique = {
    email: "users_email_unique",
    username: "users_username_unique",
} as const

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Auth.js-compatible fields
  name: text("name"),
  email: text("email").notNull().unique(UsersUnique.email),
  emailVerified: timestamp("email_verified", { withTimezone: true, mode: "date" }),
  image: text("image"),

  // Bookfeed auth + profile
  passwordHash: text("password_hash"), // null until signup sets it; never store plaintext
  username: text("username").notNull().unique(UsersUnique.username),
  bio: text("bio"),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})