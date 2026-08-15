"use server"

import { z } from "zod"

import { auth } from "@/lib/auth"
import { getFriendshipRelation } from "@/lib/friends/queries"
import { getUserHoverPreview } from "@/lib/users/preview/queries"
import type { LoadUserHoverPreviewResult } from "@/lib/users/preview/types"

const inputSchema = z.object({
  userId: z.uuid(),
})

export async function loadUserHoverPreview(input: {
  userId: string
}): Promise<LoadUserHoverPreviewResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, code: "unauthorized", message: "Sign in required." }
  }

  const parsed = inputSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, code: "invalid", message: "Invalid user." }
  }

  const { relation } = await getFriendshipRelation(
    session.user.id,
    parsed.data.userId,
  )
  if (relation !== "self" && relation !== "friends") {
    return {
      ok: false,
      code: "forbidden",
      message: "Only friends’ libraries can be previewed.",
    }
  }

  const preview = await getUserHoverPreview(parsed.data.userId)
  if (!preview) {
    return { ok: false, code: "not_found", message: "User not found." }
  }

  return { ok: true, preview }
}
