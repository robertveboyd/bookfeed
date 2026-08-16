import { FriendshipList } from "@/components/friends/friends-lists"
import { requireSession } from "@/lib/auth/util/session"
import {
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

  return (
    <>
      <section className="space-y-4">
        <h2 className="text-lg font-medium tracking-tight">Your friends</h2>
        <FriendshipList
          items={friends}
          mode="friends"
          empty={{
            title: "No friends yet",
            description:
              "Search for a username above to send your first friend request.",
          }}
        />
      </section>

      {incoming.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-lg font-medium tracking-tight">
            Incoming requests
          </h2>
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

      {outgoing.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-lg font-medium tracking-tight">
            Sent requests
          </h2>
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
    </>
  )
}
