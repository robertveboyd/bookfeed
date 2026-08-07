import { and, asc, eq, ilike, inArray, ne, or } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"

import { db } from "@/lib/db"
import { friendships, users } from "@/lib/db/schema"
import type {
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

export async function listFriends(
  userId: string,
): Promise<FriendshipWithUser[]> {
  const requester = alias(users, "friendship_requester")
  const addressee = alias(users, "friendship_addressee")

  const rows = await db
    .select({
      friendship: friendshipSelect,
      requesterId: requester.id,
      requesterUsername: requester.username,
      requesterImage: requester.image,
      addresseeId: addressee.id,
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
      const user: FriendUser =
        row.friendship.requesterId === userId
          ? {
              id: row.addresseeId,
              username: row.addresseeUsername,
              image: row.addresseeImage,
            }
          : {
              id: row.requesterId,
              username: row.requesterUsername,
              image: row.requesterImage,
            }
      return { friendship: row.friendship, user }
    })
    .sort((a, b) =>
      a.user.username.localeCompare(b.user.username, undefined, {
        sensitivity: "base",
      }),
    )
}

export async function listIncomingPending(
  userId: string,
): Promise<FriendshipWithUser[]> {
  const rows = await db
    .select({
      friendship: friendshipSelect,
      user: userSelect,
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

  return rows
}

export async function listOutgoingPending(
  userId: string,
): Promise<FriendshipWithUser[]> {
  const rows = await db
    .select({
      friendship: friendshipSelect,
      user: userSelect,
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

  return rows
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
