import { COMMENT_BODY_MAX } from "../../lib/activity/types"
import { normalizeUsername } from "../../lib/users/util/normalize"
import {
  CURATED_THREAD_SPECS,
  buildThreadComments,
  getBookContext,
  maybeAppendChimeIn,
  maxSpeakerSlot,
  pickConversationThread,
  pickThreadParticipants,
} from "./comment-threads"

export const SHOWCASE_USERNAME = "robert"
/** Total friend connections for the showcase user (accepted + pending). */
export const DEMO_TOTAL_FRIENDS = 35
export const DEMO_ACCEPTED_FRIEND_COUNT = 30
/** Friends who won't appear as "currently reading" on the rail. */
export const NO_CURRENTLY_READING_COUNT = 5

function buildReadCountPool(total: number): number[] {
  if (total <= 0) return []

  const pool: number[] = [0, 0, 80, 45, 28]
  const middle = Math.max(total - pool.length, 0)
  for (let i = 0; i < middle; i++) {
    const base = 1 + Math.floor((i / Math.max(middle, 1)) * 17)
    const jitter = ((i * 7 + 3) % 5) - 2
    pool.push(Math.max(1, Math.min(22, base + jitter)))
  }

  return pool.slice(0, total)
}

function shuffleWithSeed<T>(items: T[], seed: number): T[] {
  const rng = mulberry32(seed)
  return [...items].sort(() => rng() - 0.5)
}

export type ReadBookJson = {
  title: string
  rating?: number
  review?: string
  daysAgo: number
}

export type LibraryJson = {
  currentlyReading?: { title: string; daysAgo: number }
  read: ReadBookJson[]
  interested?: string[]
  top5?: string[]
}

export type CommentJson = {
  author: string
  on: { username: string; title: string; type: string }
  body: string
  daysAgo: number
  likedBy?: string[]
}

export type LikeJson = {
  username: string
  title: string
  type: string
  likedBy: string[]
}

type ActivityRef = {
  username: string
  title: string
  type: string
  daysAgo: number
  isShowcase: boolean
  isFriend: boolean
}

function titleKey(title: string) {
  return title.trim().toLowerCase()
}

function hashString(value: string): number {
  let hash = 2166136261
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function rngFor(username: string) {
  return mulberry32(hashString(username))
}

function shuffledTitles(username: string, catalogTitles: string[]): string[] {
  const rng = rngFor(username)
  return [...catalogTitles].sort(() => rng() - 0.5)
}

const REVIEW_SNIPPETS = [
  "Exactly what I needed this month.",
  "Would recommend with zero caveats.",
  "Not perfect, but I get the hype now.",
  "Messy in places, still stuck with me.",
  "The kind of book you finish and immediately text a friend.",
  "I stayed up too late for this and regret nothing.",
  "Strong characters, uneven pacing, still a win.",
  "Comfort read energy without feeling fluffy.",
  "Deserves a reread already.",
  "Slow start, then I could not put it down.",
  "Finished in two sittings. No notes.",
  "Not my usual genre but I am converted.",
  "Smart, funny, and a little devastating.",
  "Perfect book club pick — so much to discuss.",
  "Held up better than I remembered.",
]

const CURATED_LIBRARY_BOOKS: Record<string, ReadBookJson[]> = {
  maya: [
    {
      title: "Dune",
      rating: 5,
      review: "Arrakis still has the best worldbuilding in the genre. Fight me.",
      daysAgo: 4,
    },
  ],
  lena: [
    {
      title: "The Seven Husbands of Evelyn Hugo",
      rating: 5,
      review: "Hollywood mythmaking with a gut punch at the end.",
      daysAgo: 25,
    },
  ],
}

function mergeCuratedBooks(libraries: Record<string, LibraryJson>) {
  for (const [username, curatedBooks] of Object.entries(CURATED_LIBRARY_BOOKS)) {
    const library = libraries[normalizeUsername(username)]
    if (!library) continue
    for (const book of curatedBooks) {
      const key = titleKey(book.title)
      const existingIndex = library.read.findIndex(
        (entry) => titleKey(entry.title) === key,
      )
      if (existingIndex >= 0) {
        library.read[existingIndex] = book
      } else {
        library.read.unshift(book)
      }
    }
    library.read.sort((a, b) => a.daysAgo - b.daysAgo)
  }
}

export function assignFriendReadCounts(friendUsernames: string[]): Map<string, number> {
  const normalized = friendUsernames.map((username) => normalizeUsername(username))
  const counts = shuffleWithSeed(
    buildReadCountPool(normalized.length),
    hashString("demo-read-count-shuffle"),
  )
  const shuffledUsers = shuffleWithSeed(
    normalized,
    hashString("demo-read-count-users"),
  )

  const map = new Map<string, number>()
  shuffledUsers.forEach((username, index) => {
    map.set(username, counts[index] ?? 9)
  })
  return map
}

function applyCurrentlyReadingGaps(
  libraries: Record<string, LibraryJson>,
  friendUsernames: string[],
) {
  const candidates = friendUsernames
    .map((username) => normalizeUsername(username))
    .filter((username) => username !== SHOWCASE_USERNAME)
  const withoutReading = shuffleWithSeed(
    candidates,
    hashString("demo-no-currently-reading"),
  ).slice(0, NO_CURRENTLY_READING_COUNT)

  for (const username of withoutReading) {
    const library = libraries[username]
    if (!library) continue
    delete library.currentlyReading
  }
}

function buildTop5(read: ReadBookJson[], rng: () => number): string[] | undefined {
  const rated = read.filter((book) => book.rating != null)
  if (rated.length === 0) return undefined
  if (rng() > 0.72) return undefined

  const count = 1 + Math.floor(rng() * Math.min(5, rated.length))
  const shuffled = [...rated].sort(() => rng() - 0.5)
  return shuffled.slice(0, count).map((book) => book.title)
}

export function buildFriendLibrary(
  username: string,
  readCount: number,
  catalogTitles: string[],
): LibraryJson {
  const rng = rngFor(username)
  const pool = shuffledTitles(username, catalogTitles)
  const read: ReadBookJson[] = []
  const take = Math.min(readCount, pool.length)

  for (let i = 0; i < take; i++) {
    const title = pool[i]!
    const daysAgo = 3 + Math.floor(rng() * 120) + i
    const hasRating = readCount === 0 ? false : rng() < 0.94
    if (!hasRating) {
      read.push({ title, daysAgo })
      continue
    }
    const rating = 3 + Math.floor(rng() * 3)
    const hasReview = rng() < 0.88
    read.push({
      title,
      daysAgo,
      rating,
      review: hasReview
        ? REVIEW_SNIPPETS[Math.floor(rng() * REVIEW_SNIPPETS.length)]
        : undefined,
    })
  }

  const used = new Set(read.map((book) => titleKey(book.title)))
  let readingTitle = pool[Math.min(readCount + 1, pool.length - 1)]!
  while (used.has(titleKey(readingTitle))) {
    readingTitle = pool[Math.floor(rng() * pool.length)]!
  }
  used.add(titleKey(readingTitle))

  const interestedPool = pool.filter((title) => !used.has(titleKey(title)))
  const interested = interestedPool.slice(0, Math.floor(rng() * 4))

  const top5 = buildTop5(read, rng)

  return {
    currentlyReading: {
      title: readingTitle,
      daysAgo: 1 + Math.floor(rng() * 6),
    },
    read,
    interested: interested.length > 0 ? interested : undefined,
    top5: top5 && top5.length > 0 ? top5 : undefined,
  }
}

export function buildLibraries(
  usernames: string[],
  catalogTitles: string[],
  overrides: Record<string, LibraryJson>,
): Record<string, LibraryJson> {
  const readCounts = assignFriendReadCounts(
    usernames.filter((u) => normalizeUsername(u) !== SHOWCASE_USERNAME),
  )
  const libraries: Record<string, LibraryJson> = {}

  for (const username of usernames) {
    const normalized = normalizeUsername(username)
    if (overrides[normalized]) {
      libraries[normalized] = overrides[normalized]
      continue
    }
    libraries[normalized] = buildFriendLibrary(
      normalized,
      readCounts.get(normalized) ?? 9,
      catalogTitles,
    )
  }

  mergeCuratedBooks(libraries)
  applyCurrentlyReadingGaps(
    libraries,
    usernames.filter((username) => normalizeUsername(username) !== SHOWCASE_USERNAME),
  )
  return libraries
}

function activityKey(username: string, title: string, type: string) {
  return `${normalizeUsername(username)}|${titleKey(title)}|${type}`
}

function listActivities(
  libraries: Record<string, LibraryJson>,
  showcaseUsername: string,
  friendUsernames: Set<string>,
): ActivityRef[] {
  const refs: ActivityRef[] = []
  for (const [username, library] of Object.entries(libraries)) {
    const normalized = normalizeUsername(username)
    const isShowcase = normalized === showcaseUsername
    const isFriend = friendUsernames.has(normalized)
    if (library.currentlyReading) {
      refs.push({
        username: normalized,
        title: library.currentlyReading.title,
        type: "started_reading",
        daysAgo: library.currentlyReading.daysAgo,
        isShowcase,
        isFriend,
      })
    }
    for (const book of library.read) {
      refs.push({
        username: normalized,
        title: book.title,
        type: "finished_reading",
        daysAgo: book.daysAgo + 3,
        isShowcase,
        isFriend,
      })
      if (book.rating == null) continue
      const type = book.review?.trim() ? "reviewed" : "rated"
      refs.push({
        username: normalized,
        title: book.title,
        type,
        daysAgo: book.daysAgo,
        isShowcase,
        isFriend,
      })
    }
  }
  return refs
}

function pickLikers(
  owner: string,
  candidates: string[],
  count: number,
  rng: () => number,
): string[] {
  const pool = candidates.filter((u) => u !== owner)
  const shuffled = [...pool].sort(() => rng() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

export function generateEngagement(input: {
  libraries: Record<string, LibraryJson>
  showcaseUsername: string
  friendUsernames: string[]
  allUsernames: string[]
}): { comments: CommentJson[]; likes: LikeJson[] } {
  const friendSet = new Set(input.friendUsernames.map(normalizeUsername))
  const activities = listActivities(
    input.libraries,
    input.showcaseUsername,
    friendSet,
  )
  const comments: CommentJson[] = []
  const likes: LikeJson[] = []

  for (const activity of activities) {
    const key = activityKey(activity.username, activity.title, activity.type)
    const curated = CURATED_THREAD_SPECS[key]
    if (curated) {
      for (const row of curated) {
        comments.push({
          author: row.author,
          on: {
            username: activity.username,
            title: activity.title,
            type: activity.type,
          },
          body: row.body,
          daysAgo: row.daysAgo,
          likedBy: row.likedBy,
        })
      }
      likes.push({
        username: activity.username,
        title: activity.title,
        type: activity.type,
        likedBy: pickLikers(
          activity.username,
          input.allUsernames,
          6,
          mulberry32(hashString(key)),
        ),
      })
      continue
    }

    const rng = mulberry32(hashString(`engage|${key}`))
    let engageChance = 0.08
    if (activity.isShowcase) {
      engageChance = 1
    } else if (activity.isFriend) {
      if (activity.daysAgo <= 35) engageChance = 0.82
      else if (activity.daysAgo <= 70) engageChance = 0.45
      else engageChance = 0.15
    } else {
      continue
    }

    if (rng() > engageChance) continue

    const likeCount = activity.isShowcase
      ? 4 + Math.floor(rng() * 5)
      : 2 + Math.floor(rng() * 5)
    const likers = pickLikers(
      activity.username,
      input.allUsernames,
      likeCount,
      rng,
    )
    if (likers.length > 0) {
      likes.push({
        username: activity.username,
        title: activity.title,
        type: activity.type,
        likedBy: likers,
      })
    }

    const commentChance = activity.isShowcase ? 0.85 : 0.52
    if (rng() > commentChance) continue
    if (activity.type === "rated" && rng() > 0.35) continue

    const book = getBookContext(activity.title)
    const thread = maybeAppendChimeIn(
      pickConversationThread(book, activity.type, rng),
      rng,
    )
    const participants = pickThreadParticipants(
      activity.username,
      input.allUsernames,
      thread,
      rng,
    )
    if (participants.length < maxSpeakerSlot(thread) + 1) continue

    const drafts = buildThreadComments(thread, book, participants)

    drafts.forEach((draft, index) => {
      if (draft.body.length > COMMENT_BODY_MAX) return
      const commentLikers =
        index === 0 && rng() > 0.4
          ? pickLikers(draft.author, input.allUsernames, 2 + Math.floor(rng() * 2), rng)
          : undefined
      comments.push({
        author: draft.author,
        on: {
          username: activity.username,
          title: activity.title,
          type: activity.type,
        },
        body: draft.body,
        daysAgo: Math.max(0, activity.daysAgo - index - 1),
        likedBy: commentLikers,
      })
    })
  }

  return { comments, likes }
}

export function summarizeLibraries(libraries: Record<string, LibraryJson>) {
  const rows = Object.entries(libraries).map(([username, library]) => ({
    username,
    read: library.read.length,
  }))
  const friends = rows.filter((row) => row.username !== SHOWCASE_USERNAME)
  const avg =
    friends.reduce((sum, row) => sum + row.read, 0) / Math.max(friends.length, 1)
  return { rows, avg }
}
