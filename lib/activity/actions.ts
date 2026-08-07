"use server"

import { auth } from "@/lib/auth"
import { listFriendsFeed } from "@/lib/activity/queries"
import type { FeedActivityItem } from "@/lib/activity/types"

export type LoadMoreFeedResult =
  | { ok: true; items: FeedActivityItem[]; nextCursor: string | null }
  | { ok: false; message: string }

export async function loadMoreFeed(input: {
  cursor: string
}): Promise<LoadMoreFeedResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, message: "Sign in required." }
  }

  if (!input.cursor) {
    return { ok: false, message: "Invalid cursor." }
  }

  const page = await listFriendsFeed(session.user.id, {
    cursor: input.cursor,
  })
  return { ok: true, items: page.items, nextCursor: page.nextCursor }
}
