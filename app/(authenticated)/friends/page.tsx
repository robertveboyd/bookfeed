import type { Metadata } from "next"

import {
  FriendshipList,
  FriendsSearchResults,
} from "@/components/friends/friends-lists"
import { FriendsSearch } from "@/components/friends/friends-search"
import { requireSession } from "@/lib/auth/util/session"
import {
  listFriends,
  listIncomingPending,
  listOutgoingPending,
  searchUsersByUsername,
} from "@/lib/friends/queries"

export const metadata: Metadata = {
  title: "Friends",
}

type PageProps = {
  searchParams: Promise<{ q?: string }>
}

export default async function Page({ searchParams }: PageProps) {
  const session = await requireSession()
  const { q } = await searchParams
  const query = q?.trim() ?? ""

  const [incoming, outgoing, friends, hits] = await Promise.all([
    listIncomingPending(session.user.id),
    listOutgoingPending(session.user.id),
    listFriends(session.user.id),
    query.length >= 2
      ? searchUsersByUsername(query, session.user.id)
      : Promise.resolve(null),
  ])

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Friends</h1>
        <p className="text-muted-foreground text-sm">
          Find people by username and manage friend requests.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-medium tracking-tight">Find friends</h2>
        <FriendsSearch defaultQuery={query} />
        {query.length > 0 && query.length < 2 ? (
          <p className="text-muted-foreground text-sm">
            Type at least 2 characters to search.
          </p>
        ) : null}
        {hits ? <FriendsSearchResults hits={hits} /> : null}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium tracking-tight">
          Incoming requests
        </h2>
        <FriendshipList
          items={incoming}
          mode="incoming"
          empty={{
            title: "No incoming requests",
            description: "When someone sends you a friend request, it will show up here.",
          }}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium tracking-tight">
          Sent requests
        </h2>
        <FriendshipList
          items={outgoing}
          mode="outgoing"
          empty={{
            title: "No sent requests",
            description: "Friend requests you send will appear here until they’re accepted.",
          }}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium tracking-tight">Your friends</h2>
        <FriendshipList
          items={friends}
          mode="friends"
          empty={{
            title: "No friends yet",
            description: "Search for a username above to send your first friend request.",
          }}
        />
      </section>
    </div>
  )
}
