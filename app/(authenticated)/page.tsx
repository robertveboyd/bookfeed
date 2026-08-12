import type { Metadata } from "next"
import { Suspense } from "react"

import { FeedFallback } from "@/components/feed/feed-fallback"
import { FeedList } from "@/components/feed/feed-list"
import { FriendsRail } from "@/components/feed/friends-rail"
import { listFriendsFeed } from "@/lib/activity/queries"
import { requireSession } from "@/lib/auth/util/session"
import { listFriendsWithReading } from "@/lib/friends/queries"

export const metadata: Metadata = {
  title: "Feed",
}

async function FeedContent() {
  const session = await requireSession()

  const [feed, friends] = await Promise.all([
    listFriendsFeed(session.user.id),
    listFriendsWithReading(session.user.id),
  ])

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Feed</h1>
        <p className="text-muted-foreground text-sm">
          What your friends are reading and reviewing.
        </p>
      </div>

      <FriendsRail friends={friends} variant="chips" />

      <div className="flex gap-10">
        <FriendsRail friends={friends} variant="rail" />

        <div className="min-w-0 flex-1">
          <FeedList
            initialItems={feed.items}
            initialCursor={feed.nextCursor}
            friendCount={friends.length}
          />
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<FeedFallback />}>
      <FeedContent />
    </Suspense>
  )
}
