import { and, asc, eq, ilike, inArray, ne, or } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"

import { db } from "@/lib/db"
import { friendships, libraryEntries, books, users } from "@/lib/db/schema"
import type {
  FriendRailItem,
  FriendUser,
  Friendship,
  FriendshipRelation,
  FriendshipWithUser,
  UserSearchHit,
} from "@/lib/friends/types"

const friendshipSelect = {
  id: friendships.id,
  requesterId: friendships.requesterId,
  addresseeId: friendships.addresseeId,
  status: friendships.status,
  createdAt: friendships.createdAt,
  updatedAt: friendships.updatedAt,
} as const

const userSelect = {
  id: users.id,
  username: users.username,
  image: users.image,
} as const

export async function getUserByUsername(
  username: string,
): Promise<FriendUser | null> {
  const normalized = username.trim().toLowerCase()
  const [row] = await db
    .select(userSelect)
    .from(users)
    .where(eq(users.username, normalized))
    .limit(1)
  return row ?? null
}

export async function getUserById(userId: string): Promise<FriendUser | null> {
  const [row] = await db
    .select(userSelect)
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  return row ?? null
}

export async function getFriendshipBetween(
  userAId: string,
  userBId: string,
): Promise<Friendship | null> {
  const [row] = await db
    .select(friendshipSelect)
    .from(friendships)
    .where(
      or(
        and(
          eq(friendships.requesterId, userAId),
          eq(friendships.addresseeId, userBId),
        ),
        and(
          eq(friendships.requesterId, userBId),
          eq(friendships.addresseeId, userAId),
        ),
      ),
    )
    .limit(1)
  return row ?? null
}

export function relationFromFriendship(
  viewerId: string,
  friendship: Friendship | null,
  otherUserId: string,
): FriendshipRelation {
  if (viewerId === otherUserId) return "self"
  if (!friendship) return "none"
  if (friendship.status === "accepted") return "friends"
  if (friendship.requesterId === viewerId) return "outgoing_pending"
  return "incoming_pending"
}

export async function getFriendshipRelation(
  viewerId: string,
  otherUserId: string,
): Promise<{
  relation: FriendshipRelation
  friendship: Friendship | null
}> {
  if (viewerId === otherUserId) {
    return { relation: "self", friendship: null }
  }
  const friendship = await getFriendshipBetween(viewerId, otherUserId)
  return {
    relation: relationFromFriendship(viewerId, friendship, otherUserId),
    friendship,
  }
}

export async function listAcceptedFriendIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({
      requesterId: friendships.requesterId,
      addresseeId: friendships.addresseeId,
    })
    .from(friendships)
    .where(
      and(
        eq(friendships.status, "accepted"),
        or(
          eq(friendships.requesterId, userId),
          eq(friendships.addresseeId, userId),
        ),
      ),
    )

  return rows.map((row) =>
    row.requesterId === userId ? row.addresseeId : row.requesterId,
  )
}

export async function listFriends(
  userId: string,
): Promise<FriendshipWithUser[]> {
  const requester = alias(users, "friendship_requester")
  const addressee = alias(users, "friendship_addressee")

  // Flat unique keys — Neon fails when join selects share column names like `id`.
  const rows = await db
    .select({
      friendshipId: friendships.id,
      friendshipRequesterId: friendships.requesterId,
      friendshipAddresseeId: friendships.addresseeId,
      friendshipStatus: friendships.status,
      friendshipCreatedAt: friendships.createdAt,
      friendshipUpdatedAt: friendships.updatedAt,
      requesterUserId: requester.id,
      requesterUsername: requester.username,
      requesterImage: requester.image,
      addresseeUserId: addressee.id,
      addresseeUsername: addressee.username,
      addresseeImage: addressee.image,
    })
    .from(friendships)
    .innerJoin(requester, eq(requester.id, friendships.requesterId))
    .innerJoin(addressee, eq(addressee.id, friendships.addresseeId))
    .where(
      and(
        eq(friendships.status, "accepted"),
        or(
          eq(friendships.requesterId, userId),
          eq(friendships.addresseeId, userId),
        ),
      ),
    )

  return rows
    .map((row) => {
      const friendship: Friendship = {
        id: row.friendshipId,
        requesterId: row.friendshipRequesterId,
        addresseeId: row.friendshipAddresseeId,
        status: row.friendshipStatus,
        createdAt: row.friendshipCreatedAt,
        updatedAt: row.friendshipUpdatedAt,
      }
      const user: FriendUser =
        friendship.requesterId === userId
          ? {
              id: row.addresseeUserId,
              username: row.addresseeUsername,
              image: row.addresseeImage,
            }
          : {
              id: row.requesterUserId,
              username: row.requesterUsername,
              image: row.requesterImage,
            }
      return { friendship, user }
    })
    .sort((a, b) =>
      a.user.username.localeCompare(b.user.username, undefined, {
        sensitivity: "base",
      }),
    )
}

export async function listFriendsWithReading(
  userId: string,
): Promise<FriendRailItem[]> {
  const friends = await listFriends(userId)
  if (friends.length === 0) return []

  const friendIds = friends.map((f) => f.user.id)
  const readingRows = await db
    .select({
      userId: libraryEntries.userId,
      bookId: books.id,
      title: books.title,
      coverImageId: books.coverImageId,
    })
    .from(libraryEntries)
    .innerJoin(books, eq(books.id, libraryEntries.bookId))
    .where(
      and(
        inArray(libraryEntries.userId, friendIds),
        eq(libraryEntries.status, "reading"),
      ),
    )

  const readingByUser = new Map(
    readingRows.map((row) => [
      row.userId,
      {
        bookId: row.bookId,
        title: row.title,
        coverImageId: row.coverImageId,
      },
    ]),
  )

  return friends.map(({ user }) => ({
    ...user,
    reading: readingByUser.get(user.id) ?? null,
  }))
}

export async function listIncomingPending(
  userId: string,
): Promise<FriendshipWithUser[]> {
  const rows = await db
    .select({
      friendshipId: friendships.id,
      friendshipRequesterId: friendships.requesterId,
      friendshipAddresseeId: friendships.addresseeId,
      friendshipStatus: friendships.status,
      friendshipCreatedAt: friendships.createdAt,
      friendshipUpdatedAt: friendships.updatedAt,
      userId: users.id,
      username: users.username,
      image: users.image,
    })
    .from(friendships)
    .innerJoin(users, eq(users.id, friendships.requesterId))
    .where(
      and(
        eq(friendships.addresseeId, userId),
        eq(friendships.status, "pending"),
      ),
    )
    .orderBy(asc(users.username))

  return rows.map((row) => ({
    friendship: {
      id: row.friendshipId,
      requesterId: row.friendshipRequesterId,
      addresseeId: row.friendshipAddresseeId,
      status: row.friendshipStatus,
      createdAt: row.friendshipCreatedAt,
      updatedAt: row.friendshipUpdatedAt,
    },
    user: {
      id: row.userId,
      username: row.username,
      image: row.image,
    },
  }))
}

export async function listOutgoingPending(
  userId: string,
): Promise<FriendshipWithUser[]> {
  const rows = await db
    .select({
      friendshipId: friendships.id,
      friendshipRequesterId: friendships.requesterId,
      friendshipAddresseeId: friendships.addresseeId,
      friendshipStatus: friendships.status,
      friendshipCreatedAt: friendships.createdAt,
      friendshipUpdatedAt: friendships.updatedAt,
      userId: users.id,
      username: users.username,
      image: users.image,
    })
    .from(friendships)
    .innerJoin(users, eq(users.id, friendships.addresseeId))
    .where(
      and(
        eq(friendships.requesterId, userId),
        eq(friendships.status, "pending"),
      ),
    )
    .orderBy(asc(users.username))

  return rows.map((row) => ({
    friendship: {
      id: row.friendshipId,
      requesterId: row.friendshipRequesterId,
      addresseeId: row.friendshipAddresseeId,
      status: row.friendshipStatus,
      createdAt: row.friendshipCreatedAt,
      updatedAt: row.friendshipUpdatedAt,
    },
    user: {
      id: row.userId,
      username: row.username,
      image: row.image,
    },
  }))
}

const SEARCH_LIMIT = 20

/** Escape `%` / `_` so user input is treated as a literal prefix. */
function escapeIlikePrefix(raw: string): string {
  return raw.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_")
}

export async function searchUsersByUsername(
  query: string,
  viewerId: string,
): Promise<UserSearchHit[]> {
  const trimmed = query.trim().toLowerCase()
  if (trimmed.length < 2) return []

  const pattern = `${escapeIlikePrefix(trimmed)}%`

  const matches = await db
    .select(userSelect)
    .from(users)
    .where(and(ilike(users.username, pattern), ne(users.id, viewerId)))
    .orderBy(asc(users.username))
    .limit(SEARCH_LIMIT)

  if (matches.length === 0) return []

  const matchIds = matches.map((m) => m.id)
  const related = await db
    .select(friendshipSelect)
    .from(friendships)
    .where(
      or(
        and(
          eq(friendships.requesterId, viewerId),
          inArray(friendships.addresseeId, matchIds),
        ),
        and(
          eq(friendships.addresseeId, viewerId),
          inArray(friendships.requesterId, matchIds),
        ),
      ),
    )

  const byOtherId = new Map<string, Friendship>()
  for (const row of related) {
    const otherId =
      row.requesterId === viewerId ? row.addresseeId : row.requesterId
    byOtherId.set(otherId, row)
  }

  return matches.map((user) => {
    const friendship = byOtherId.get(user.id) ?? null
    const relation = relationFromFriendship(
      viewerId,
      friendship,
      user.id,
    ) as Exclude<FriendshipRelation, "self">
    return {
      ...user,
      relation,
      friendshipId: friendship?.id ?? null,
    }
  })
}
