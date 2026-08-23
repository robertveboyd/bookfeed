"use client"

import { FeedList } from "@/components/feed/feed-list"
import { FriendsRail } from "@/components/feed/friends-rail"
import type { FeedActivityItem } from "@/lib/activity/types"
import type { FriendRailItem } from "@/lib/friends/types"

type FeedBodyProps = {
  friends: FriendRailItem[]
  initialItems: FeedActivityItem[]
  initialCursor: string | null
  deepLinkActivityId: string | null
  deepLinkOpenComments: boolean
}

export function FeedBody({
  friends,
  initialItems,
  initialCursor,
  deepLinkActivityId,
  deepLinkOpenComments,
}: FeedBodyProps) {
  return (
    <div className="flex flex-col gap-6">
      <FriendsRail friends={friends} variant="chips" />

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
        <FriendsRail friends={friends} variant="rail" />

        <FeedList
          initialItems={initialItems}
          initialCursor={initialCursor}
          friendCount={friends.length}
          deepLinkActivityId={deepLinkActivityId}
          deepLinkOpenComments={deepLinkOpenComments}
        />
      </div>
    </div>
  )
}
