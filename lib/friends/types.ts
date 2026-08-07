export const FRIENDSHIP_STATUSES = ["pending", "accepted"] as const
export type FriendshipStatus = (typeof FRIENDSHIP_STATUSES)[number]

export type Friendship = {
  id: string
  requesterId: string
  addresseeId: string
  status: FriendshipStatus
  createdAt: Date
  updatedAt: Date
}

/** Derived relationship of viewer → other user */
export type FriendshipRelation =
  | "self"
  | "none"
  | "outgoing_pending"
  | "incoming_pending"
  | "friends"

export type FriendUser = {
  id: string
  username: string
  image: string | null
}

export type FriendshipWithUser = {
  friendship: Friendship
  user: FriendUser
}

export type UserSearchHit = FriendUser & {
  relation: Exclude<FriendshipRelation, "self">
  friendshipId: string | null
}

export type FriendRailItem = FriendUser & {
  reading: {
    bookId: string
    title: string
    coverImageId: string
  } | null
}

export type FriendActionResult =
  | { ok: true }
  | {
      ok: false
      code: "unauthorized" | "not_found" | "invalid" | "conflict"
      message: string
    }
