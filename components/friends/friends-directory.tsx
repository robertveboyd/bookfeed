import { FriendshipList } from "@/components/friends/friends-lists"
import { SectionHeading } from "@/components/friends/section-heading"
import { requireSession } from "@/lib/auth/util/session"
import {
  getCurrentlyReadingByUserIds,
  listFriends,
  listIncomingPending,
  listOutgoingPending,
} from "@/lib/friends/queries"

export async function FriendsDirectory() {
  const session = await requireSession()
  const [incoming, outgoing, friends] = await Promise.all([
    listIncomingPending(session.user.id),
    listOutgoingPending(session.user.id),
    listFriends(session.user.id),
  ])
  const readingByUserId = await getCurrentlyReadingByUserIds(
    friends.map((friend) => friend.user.id),
  )

  const directoryEmpty =
    friends.length === 0 && incoming.length === 0 && outgoing.length === 0

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-10">
      {/* Requests are the only actionable section, so they lead. */}
      {incoming.length > 0 ? (
        <section className="border-border/70 bg-muted/30 space-y-4 rounded-xl border p-4 sm:p-5">
          <SectionHeading title="Incoming requests" count={incoming.length} />
          <FriendshipList
            items={incoming}
            mode="incoming"
            empty={{
              title: "No incoming requests",
              description:
                "When someone sends you a friend request, it will show up here.",
            }}
          />
        </section>
      ) : null}

      <section
        className={
          directoryEmpty
            ? "flex min-h-0 flex-1 flex-col gap-4"
            : "space-y-4"
        }
      >
        <SectionHeading title="Your friends" count={friends.length} />
        <FriendshipList
          items={friends}
          mode="friends"
          fillEmpty={directoryEmpty}
          readingByUserId={readingByUserId}
          empty={{
            title: "No friends yet",
            description:
              "Search for a username above to send your first friend request.",
          }}
        />
      </section>

      {outgoing.length > 0 ? (
        <section className="space-y-4">
          <SectionHeading title="Sent requests" count={outgoing.length} />
          <FriendshipList
            items={outgoing}
            mode="outgoing"
            empty={{
              title: "No sent requests",
              description:
                "Friend requests you send will appear here until they’re accepted.",
            }}
          />
        </section>
      ) : null}
    </div>
  )
}
