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

type PageProps = {
  searchParams: Promise<{ activity?: string; comments?: string }>
}

async function FeedContent({
  deepLinkActivityId,
  openComments,
}: {
  deepLinkActivityId: string | null
  openComments: boolean
}) {
  const session = await requireSession()

  const [feed, friends] = await Promise.all([
    listFriendsFeed(session.user.id),
    listFriendsWithReading(session.user.id),
  ])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 lg:overflow-hidden">
      <FriendsRail friends={friends} variant="chips" />

      <div className="flex min-h-0 flex-1 flex-col gap-8 lg:flex-row lg:gap-10">
        <FriendsRail friends={friends} variant="rail" />

        <div className="scrollbar-hidden flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-y-contain">
          <FeedList
            initialItems={feed.items}
            initialCursor={feed.nextCursor}
            friendCount={friends.length}
            deepLinkActivityId={deepLinkActivityId}
            deepLinkOpenComments={openComments}
          />
        </div>
      </div>
    </div>
  )
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  const deepLinkActivityId =
    typeof params.activity === "string" && params.activity.length > 0
      ? params.activity
      : null
  const openComments = params.comments === "1"

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Suspense fallback={<FeedFallback />}>
        <FeedContent
          deepLinkActivityId={deepLinkActivityId}
          openComments={openComments}
        />
      </Suspense>
    </div>
  )
}
