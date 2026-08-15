import { config } from "dotenv"
config({ path: ".env.local" })

import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

import { ACTIVITY_TYPES, COMMENT_BODY_MAX } from "../../lib/activity/types"
import { getPgError, PgCode } from "../../lib/db/errors"
import {
  activities,
  activityComments,
  activityLikes,
  books,
  commentLikes,
  friendships,
  libraryEntries,
  reviews,
  userTopBooks,
  users,
} from "../../lib/db/schema"
import { REVIEW_BODY_MAX } from "../../lib/reviews/types"
import { normalizeEmail, normalizeUsername } from "../../lib/users/util/normalize"
import { hashPassword } from "../../lib/users/util/password"
import { demoConfig } from "./config"

const EXPECTED_USER_COUNT = 12
const FINISH_BEFORE_RATE_DAYS = 3
const FRIENDSHIP_DAYS_AGO = 60
const USER_CREATED_DAYS_AGO = 90

type ActivityType = (typeof ACTIVITY_TYPES)[number]

type UserJson = {
  username: string
  email: string
  name: string
  bio?: string
  showcase?: boolean
}

type ReadBookJson = {
  title: string
  rating?: number
  review?: string
  daysAgo: number
}

type LibraryJson = {
  currentlyReading: { title: string; daysAgo: number }
  read: ReadBookJson[]
  interested?: string[]
  top5?: string[]
}

type CommentJson = {
  author: string
  on: { username: string; title: string; type: string }
  body: string
  daysAgo: number
  likedBy?: string[]
}

type LikeJson = {
  username: string
  title: string
  type: string
  likedBy: string[]
}

const dir = dirname(fileURLToPath(import.meta.url))

function loadJson<T>(filename: string): T {
  const path = join(dir, "data", filename)
  return JSON.parse(readFileSync(path, "utf8")) as T
}

function daysAgo(days: number, extraHours = 0): Date {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - days)
  d.setUTCHours(12, extraHours, 0, 0)
  return d
}

function titleKey(title: string) {
  return title.trim().toLowerCase()
}

function activityKey(username: string, title: string, type: string) {
  return `${normalizeUsername(username)}|${titleKey(title)}|${type}`
}

function isActivityType(value: string): value is ActivityType {
  return (ACTIVITY_TYPES as readonly string[]).includes(value)
}

function trimBody(value: string | undefined): string | null {
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed.length === 0 ? null : trimmed
}

function requireIntDays(value: unknown, context: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new Error(`${context}: daysAgo must be a non-negative integer`)
  }
  return value
}

function requireRating(value: unknown, context: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 5) {
    throw new Error(`${context}: rating must be an integer from 1 to 5`)
  }
  return value
}

function validateUsers(raw: UserJson[]) {
  if (!Array.isArray(raw) || raw.length !== EXPECTED_USER_COUNT) {
    throw new Error(
      `users.json must list exactly ${EXPECTED_USER_COUNT} people (got ${Array.isArray(raw) ? raw.length : "non-array"})`,
    )
  }

  const seenUsernames = new Set<string>()
  const seenEmails = new Set<string>()
  let showcase: UserJson | null = null

  for (const user of raw) {
    const username = normalizeUsername(user.username ?? "")
    const email = normalizeEmail(user.email ?? "")
    if (username.length < 3 || username.length > 32) {
      throw new Error(`Invalid username "${user.username}" (3–32 characters)`)
    }
    if (!/^[a-z0-9_-]+$/.test(username)) {
      throw new Error(`Invalid username "${user.username}" (letters, numbers, _ and -)`)
    }
    if (username === "you") {
      throw new Error(`Username "you" is reserved`)
    }
    if (!email.includes("@")) {
      throw new Error(`Invalid email for ${username}`)
    }
    if (seenUsernames.has(username)) {
      throw new Error(`Duplicate username "${username}"`)
    }
    if (seenEmails.has(email)) {
      throw new Error(`Duplicate email "${email}"`)
    }
    seenUsernames.add(username)
    seenEmails.add(email)
    if (user.showcase) {
      if (showcase) {
        throw new Error(
          `Exactly one showcase user allowed (already ${showcase.username}, also ${username})`,
        )
      }
      showcase = user
    }
  }

  if (!showcase) {
    throw new Error(`users.json must mark exactly one person with "showcase": true`)
  }

  return {
    showcaseUsername: normalizeUsername(showcase.username),
    showcaseEmail: normalizeEmail(showcase.email),
  }
}

function collectTitles(libraries: Record<string, LibraryJson>): string[] {
  const titles = new Set<string>()
  for (const [username, library] of Object.entries(libraries)) {
    if (!library?.currentlyReading?.title) {
      throw new Error(`${username}: currentlyReading.title is required`)
    }
    titles.add(library.currentlyReading.title)
    for (const book of library.read ?? []) {
      titles.add(book.title)
    }
    for (const title of library.interested ?? []) {
      titles.add(title)
    }
    for (const title of library.top5 ?? []) {
      titles.add(title)
    }
  }
  return [...titles]
}

function plannedActivityKeys(libraries: Record<string, LibraryJson>): Set<string> {
  const keys = new Set<string>()
  for (const [username, library] of Object.entries(libraries)) {
    keys.add(activityKey(username, library.currentlyReading.title, "started_reading"))
    for (const book of library.read) {
      keys.add(activityKey(username, book.title, "finished_reading"))
      if (book.rating == null) continue
      const type = trimBody(book.review) ? "reviewed" : "rated"
      keys.add(activityKey(username, book.title, type))
    }
  }
  return keys
}

function assertEngageRefs(
  comments: CommentJson[],
  likes: LikeJson[],
  userSet: Set<string>,
  activityKeys: Set<string>,
) {
  if (!Array.isArray(comments)) {
    throw new Error("comments.json must be an array")
  }
  if (!Array.isArray(likes)) {
    throw new Error("likes.json must be an array")
  }

  const requireKnownUser = (username: string, context: string) => {
    if (!userSet.has(normalizeUsername(username))) {
      throw new Error(`${context}: unknown user "${username}"`)
    }
  }

  const requirePlannedActivity = (
    username: string,
    title: string,
    type: string,
    context: string,
  ) => {
    if (!isActivityType(type)) {
      throw new Error(`${context}: unknown activity type "${type}"`)
    }
    requireKnownUser(username, context)
    const key = activityKey(username, title, type)
    if (!activityKeys.has(key)) {
      throw new Error(
        `${context}: no ${type} activity for ${username} / "${title}". Check libraries.json.`,
      )
    }
  }

  for (const [index, comment] of comments.entries()) {
    const context = `comments.json[${index}]`
    requireKnownUser(comment.author, context)
    requirePlannedActivity(
      comment.on.username,
      comment.on.title,
      comment.on.type,
      context,
    )
    const body = trimBody(comment.body)
    if (!body) {
      throw new Error(`${context}: body is required`)
    }
    if (body.length > COMMENT_BODY_MAX) {
      throw new Error(`${context}: body exceeds ${COMMENT_BODY_MAX} characters`)
    }
    requireIntDays(comment.daysAgo, context)
    for (const username of comment.likedBy ?? []) {
      requireKnownUser(username, `${context} likedBy`)
    }
  }

  for (const [index, like] of likes.entries()) {
    const context = `likes.json[${index}]`
    requirePlannedActivity(like.username, like.title, like.type, context)
    if (!Array.isArray(like.likedBy) || like.likedBy.length === 0) {
      throw new Error(`${context}: likedBy must be a non-empty array`)
    }
    for (const username of like.likedBy) {
      requireKnownUser(username, `${context} likedBy`)
    }
  }
}

function assertLibraryShape(
  username: string,
  library: LibraryJson,
  userSet: Set<string>,
) {
  if (!userSet.has(username)) {
    throw new Error(`libraries.json has "${username}" who is not in users.json`)
  }
  requireIntDays(library.currentlyReading.daysAgo, `${username} currentlyReading`)
  if (!Array.isArray(library.read) || library.read.length === 0) {
    throw new Error(`${username}: read must be a non-empty array`)
  }

  const used = new Set<string>()
  const mark = (title: string, where: string) => {
    const key = titleKey(title)
    if (!title.trim()) {
      throw new Error(`${username}: empty title in ${where}`)
    }
    if (used.has(key)) {
      throw new Error(`${username}: "${title}" appears more than once in the library`)
    }
    used.add(key)
  }

  mark(library.currentlyReading.title, "currentlyReading")
  const readKeys = new Set<string>()
  for (const book of library.read) {
    mark(book.title, "read")
    readKeys.add(titleKey(book.title))
    requireIntDays(book.daysAgo, `${username} read "${book.title}"`)
    const body = trimBody(book.review)
    if (body && book.rating == null) {
      throw new Error(`${username}: "${book.title}" has a review but no rating`)
    }
    if (book.rating != null) {
      requireRating(book.rating, `${username} read "${book.title}"`)
    }
    if (body && body.length > REVIEW_BODY_MAX) {
      throw new Error(
        `${username}: review for "${book.title}" exceeds ${REVIEW_BODY_MAX} characters`,
      )
    }
  }
  for (const title of library.interested ?? []) {
    mark(title, "interested")
  }
  for (const title of library.top5 ?? []) {
    if (!readKeys.has(titleKey(title))) {
      throw new Error(
        `${username}: top5 title "${title}" is not in that user's read list`,
      )
    }
  }
  if ((library.top5?.length ?? 0) > 5) {
    throw new Error(`${username}: top5 can have at most 5 titles`)
  }
}

async function seed() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Use .env.local.")
  }

  const userRows = loadJson<UserJson[]>("users.json")
  const libraries = loadJson<Record<string, LibraryJson>>("libraries.json")
  const comments = loadJson<CommentJson[]>("comments.json")
  const likes = loadJson<LikeJson[]>("likes.json")

  const { showcaseUsername, showcaseEmail } = validateUsers(userRows)
  const userSet = new Set(userRows.map((u) => normalizeUsername(u.username)))

  for (const username of userSet) {
    if (!libraries[username]) {
      throw new Error(`libraries.json is missing ${username}`)
    }
  }
  for (const [username, library] of Object.entries(libraries)) {
    assertLibraryShape(username, library, userSet)
  }
  assertEngageRefs(comments, likes, userSet, plannedActivityKeys(libraries))

  const sql = neon(process.env.DATABASE_URL)
  const db = drizzle(sql)

  const catalog = await db.select({ id: books.id, title: books.title }).from(books)
  if (catalog.length === 0) {
    throw new Error("Catalog is empty. Run `pnpm db:seed` first.")
  }

  const bookIdByTitle = new Map<string, string>()
  for (const row of catalog) {
    const key = titleKey(row.title)
    if (!bookIdByTitle.has(key)) bookIdByTitle.set(key, row.id)
  }

  const missing = collectTitles(libraries).filter((title) => !bookIdByTitle.has(titleKey(title)))
  if (missing.length > 0) {
    throw new Error(
      `Catalog is missing these titles (run \`pnpm db:seed\` or fix libraries.json):\n  - ${missing.join("\n  - ")}`,
    )
  }

  const requireBook = (title: string) => bookIdByTitle.get(titleKey(title))!

  const passwordHash = await hashPassword(demoConfig.password)
  const userCreatedAt = daysAgo(USER_CREATED_DAYS_AGO)

  let insertedUsers: { id: string; username: string }[]
  try {
    insertedUsers = await db
      .insert(users)
      .values(
        userRows.map((user) => ({
          username: normalizeUsername(user.username),
          email: normalizeEmail(user.email),
          name: user.name,
          bio: trimBody(user.bio),
          passwordHash,
          createdAt: userCreatedAt,
          updatedAt: userCreatedAt,
        })),
      )
      .returning({ id: users.id, username: users.username })
  } catch (error) {
    const pg = getPgError(error)
    if (pg.code === PgCode.UniqueViolation) {
      throw new Error(
        "Demo users already exist (username or email is unique). Clear the database and run again. This script has no reset.",
      )
    }
    throw error
  }

  const userIdByUsername = new Map(insertedUsers.map((u) => [u.username, u.id]))
  const requireUser = (username: string, context: string) => {
    const id = userIdByUsername.get(normalizeUsername(username))
    if (!id) {
      throw new Error(`${context}: unknown user "${username}"`)
    }
    return id
  }

  const showcaseId = requireUser(showcaseUsername, "showcase")
  const friendAt = daysAgo(FRIENDSHIP_DAYS_AGO)
  const friendRows = insertedUsers
    .filter((u) => u.username !== showcaseUsername)
    .map((u) => ({
      requesterId: showcaseId,
      addresseeId: u.id,
      status: "accepted" as const,
      createdAt: friendAt,
      updatedAt: friendAt,
    }))
  await db.insert(friendships).values(friendRows)

  const activityIdByKey = new Map<string, string>()

  async function insertActivity(input: {
    username: string
    title: string
    type: ActivityType
    actorId: string
    bookId: string
    createdAt: Date
    reviewId?: string | null
    rating?: number | null
  }) {
    const [row] = await db
      .insert(activities)
      .values({
        actorId: input.actorId,
        type: input.type,
        bookId: input.bookId,
        reviewId: input.reviewId ?? null,
        rating: input.rating ?? null,
        createdAt: input.createdAt,
      })
      .returning({ id: activities.id })
    activityIdByKey.set(activityKey(input.username, input.title, input.type), row.id)
  }

  for (const user of userRows) {
    const username = normalizeUsername(user.username)
    const userId = requireUser(username, "library")
    const library = libraries[username]

    const readingBookId = requireBook(library.currentlyReading.title)
    const readingAt = daysAgo(library.currentlyReading.daysAgo)
    await db.insert(libraryEntries).values({
      userId,
      bookId: readingBookId,
      status: "reading",
      createdAt: readingAt,
      updatedAt: readingAt,
    })
    await insertActivity({
      username,
      title: library.currentlyReading.title,
      type: "started_reading",
      actorId: userId,
      bookId: readingBookId,
      createdAt: readingAt,
    })

    for (const [i, book] of library.read.entries()) {
      const bookId = requireBook(book.title)
      const ratedAt = daysAgo(book.daysAgo, i)
      const finishedAt = daysAgo(book.daysAgo + FINISH_BEFORE_RATE_DAYS, i)
      await db.insert(libraryEntries).values({
        userId,
        bookId,
        status: "read",
        createdAt: finishedAt,
        updatedAt: ratedAt,
      })
      await insertActivity({
        username,
        title: book.title,
        type: "finished_reading",
        actorId: userId,
        bookId,
        createdAt: finishedAt,
      })

      if (book.rating == null) continue

      const body = trimBody(book.review)
      const [review] = await db
        .insert(reviews)
        .values({
          userId,
          bookId,
          rating: book.rating,
          body,
          createdAt: ratedAt,
          updatedAt: ratedAt,
        })
        .returning({ id: reviews.id })
      await insertActivity({
        username,
        title: book.title,
        type: body ? "reviewed" : "rated",
        actorId: userId,
        bookId,
        reviewId: review.id,
        rating: book.rating,
        createdAt: ratedAt,
      })
    }

    for (const [i, title] of (library.interested ?? []).entries()) {
      const interestedAt = daysAgo(14, i)
      await db.insert(libraryEntries).values({
        userId,
        bookId: requireBook(title),
        status: "interested",
        createdAt: interestedAt,
        updatedAt: interestedAt,
      })
    }

    if (library.top5 && library.top5.length > 0) {
      await db.insert(userTopBooks).values(
        library.top5.map((title, index) => ({
          userId,
          bookId: requireBook(title),
          position: index + 1,
          createdAt: userCreatedAt,
          updatedAt: userCreatedAt,
        })),
      )
    }
  }

  const requireActivity = (username: string, title: string, type: string, context: string) => {
    const id = activityIdByKey.get(activityKey(username, title, type))
    if (!id) {
      throw new Error(
        `${context}: no ${type} activity for ${username} / "${title}". Check libraries.json.`,
      )
    }
    return id
  }

  for (const [index, comment] of comments.entries()) {
    const context = `comments.json[${index}]`
    const authorId = requireUser(comment.author, context)
    const activityId = requireActivity(
      comment.on.username,
      comment.on.title,
      comment.on.type,
      context,
    )
    const body = trimBody(comment.body)!
    const [row] = await db
      .insert(activityComments)
      .values({
        activityId,
        authorId,
        body,
        createdAt: daysAgo(comment.daysAgo, index),
      })
      .returning({ id: activityComments.id })

    const likers = [...new Set(comment.likedBy ?? [])]
    if (likers.length === 0) continue
    await db.insert(commentLikes).values(
      likers.map((username, likeIndex) => ({
        commentId: row.id,
        userId: requireUser(username, `${context} likedBy`),
        createdAt: daysAgo(Math.max(0, comment.daysAgo - 1), likeIndex),
      })),
    )
  }

  const likeRows: { activityId: string; userId: string; createdAt: Date }[] = []
  const likeSeen = new Set<string>()
  for (const [index, like] of likes.entries()) {
    const context = `likes.json[${index}]`
    const activityId = requireActivity(like.username, like.title, like.type, context)
    if (!Array.isArray(like.likedBy) || like.likedBy.length === 0) {
      throw new Error(`${context}: likedBy must be a non-empty array`)
    }
    for (const username of new Set(like.likedBy)) {
      const userId = requireUser(username, `${context} likedBy`)
      const key = `${activityId}|${userId}`
      if (likeSeen.has(key)) continue
      likeSeen.add(key)
      likeRows.push({
        activityId,
        userId,
        createdAt: daysAgo(1, index),
      })
    }
  }
  if (likeRows.length > 0) {
    await db.insert(activityLikes).values(likeRows)
  }

  console.log(
    [
      "Demo seed complete.",
      "",
      "Sign in as:",
      `  email:    ${showcaseEmail}`,
      `  password: ${demoConfig.password}`,
      `  profile:  /users/${showcaseUsername}`,
      "",
      `(all ${EXPECTED_USER_COUNT} accounts share this password)`,
    ].join("\n"),
  )
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
