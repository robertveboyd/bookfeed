"use server"

import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getPgError, PgCode } from "@/lib/db/errors"
import { friendships, FriendshipsUnique } from "@/lib/db/schema"
import {
  getFriendshipBetween,
  getUserById,
} from "@/lib/friends/queries"
import type { FriendActionResult } from "@/lib/friends/types"

const inputSchema = z.object({
  userId: z.uuid(),
})

function revalidateFriendPaths(username?: string) {
  revalidatePath("/friends")
  revalidatePath("/")
  if (username) revalidatePath(`/users/${username}`)
}

export async function sendFriendRequest(input: {
  userId: string
}): Promise<FriendActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, code: "unauthorized", message: "Sign in required." }
  }
  const viewerId = session.user.id

  const parsed = inputSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, code: "invalid", message: "Invalid input." }
  }
  const { userId: targetId } = parsed.data

  if (targetId === viewerId) {
    return {
      ok: false,
      code: "invalid",
      message: "You can’t send a friend request to yourself.",
    }
  }

  const target = await getUserById(targetId)
  if (!target) {
    return { ok: false, code: "not_found", message: "User not found." }
  }

  const existing = await getFriendshipBetween(viewerId, targetId)
  if (existing) {
    if (existing.status === "accepted") {
      return {
        ok: false,
        code: "conflict",
        message: "You’re already friends.",
      }
    }
    if (existing.requesterId === viewerId) {
      return {
        ok: false,
        code: "conflict",
        message: "Friend request already sent.",
      }
    }
    return {
      ok: false,
      code: "conflict",
      message: "This person already sent you a request. Accept it instead.",
    }
  }

  try {
    await db.insert(friendships).values({
      requesterId: viewerId,
      addresseeId: targetId,
      status: "pending",
    })
    revalidateFriendPaths(target.username)
    return { ok: true }
  } catch (error) {
    const pg = getPgError(error)
    if (
      pg.code === PgCode.UniqueViolation &&
      pg.constraint === FriendshipsUnique.pair
    ) {
      return {
        ok: false,
        code: "conflict",
        message: "Friend request already sent.",
      }
    }
    return {
      ok: false,
      code: "invalid",
      message: "Something went wrong. Please try again.",
    }
  }
}

export async function acceptFriendRequest(input: {
  friendshipId: string
}): Promise<FriendActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, code: "unauthorized", message: "Sign in required." }
  }
  const viewerId = session.user.id

  const parsed = z.object({ friendshipId: z.uuid() }).safeParse(input)
  if (!parsed.success) {
    return { ok: false, code: "invalid", message: "Invalid input." }
  }

  const [row] = await db
    .select({
      id: friendships.id,
      requesterId: friendships.requesterId,
      addresseeId: friendships.addresseeId,
      status: friendships.status,
    })
    .from(friendships)
    .where(eq(friendships.id, parsed.data.friendshipId))
    .limit(1)

  if (!row || row.status !== "pending" || row.addresseeId !== viewerId) {
    return {
      ok: false,
      code: "not_found",
      message: "Friend request not found.",
    }
  }

  const requester = await getUserById(row.requesterId)

  await db
    .update(friendships)
    .set({ status: "accepted", updatedAt: new Date() })
    .where(
      and(eq(friendships.id, row.id), eq(friendships.addresseeId, viewerId)),
    )

  revalidateFriendPaths(requester?.username)
  return { ok: true }
}

export async function cancelFriendRequest(input: {
  friendshipId: string
}): Promise<FriendActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, code: "unauthorized", message: "Sign in required." }
  }
  const viewerId = session.user.id

  const parsed = z.object({ friendshipId: z.uuid() }).safeParse(input)
  if (!parsed.success) {
    return { ok: false, code: "invalid", message: "Invalid input." }
  }

  const [row] = await db
    .select({
      id: friendships.id,
      addresseeId: friendships.addresseeId,
      status: friendships.status,
    })
    .from(friendships)
    .where(
      and(
        eq(friendships.id, parsed.data.friendshipId),
        eq(friendships.requesterId, viewerId),
        eq(friendships.status, "pending"),
      ),
    )
    .limit(1)

  if (!row) {
    return {
      ok: false,
      code: "not_found",
      message: "Friend request not found.",
    }
  }

  const addressee = await getUserById(row.addresseeId)
  await db.delete(friendships).where(eq(friendships.id, row.id))
  revalidateFriendPaths(addressee?.username)
  return { ok: true }
}

export async function declineFriendRequest(input: {
  friendshipId: string
}): Promise<FriendActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, code: "unauthorized", message: "Sign in required." }
  }
  const viewerId = session.user.id

  const parsed = z.object({ friendshipId: z.uuid() }).safeParse(input)
  if (!parsed.success) {
    return { ok: false, code: "invalid", message: "Invalid input." }
  }

  const [row] = await db
    .select({
      id: friendships.id,
      requesterId: friendships.requesterId,
      status: friendships.status,
    })
    .from(friendships)
    .where(
      and(
        eq(friendships.id, parsed.data.friendshipId),
        eq(friendships.addresseeId, viewerId),
        eq(friendships.status, "pending"),
      ),
    )
    .limit(1)

  if (!row) {
    return {
      ok: false,
      code: "not_found",
      message: "Friend request not found.",
    }
  }

  const requester = await getUserById(row.requesterId)
  await db.delete(friendships).where(eq(friendships.id, row.id))
  revalidateFriendPaths(requester?.username)
  return { ok: true }
}

export async function unfriend(input: {
  userId: string
}): Promise<FriendActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, code: "unauthorized", message: "Sign in required." }
  }
  const viewerId = session.user.id

  const parsed = inputSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, code: "invalid", message: "Invalid input." }
  }
  const { userId: otherId } = parsed.data

  const existing = await getFriendshipBetween(viewerId, otherId)
  if (!existing || existing.status !== "accepted") {
    return {
      ok: false,
      code: "not_found",
      message: "Friendship not found.",
    }
  }

  const other = await getUserById(otherId)
  await db.delete(friendships).where(eq(friendships.id, existing.id))
  revalidateFriendPaths(other?.username)
  return { ok: true }
}
