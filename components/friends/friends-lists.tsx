import Link from "next/link"
import type { ReactNode } from "react"

import { FriendshipActions } from "@/components/friends/friendship-actions"
import { UserAvatar } from "@/components/profile/user-avatar"
import type {
  FriendshipWithUser,
  UserSearchHit,
} from "@/lib/friends/types"

function UserRow({
  user,
  actions,
}: {
  user: { id: string; username: string; image: string | null }
  actions: ReactNode
}) {
  return (
    <li className="flex items-center justify-between gap-3 py-3">
      <Link
        href={`/users/${user.username}`}
        className="flex min-w-0 items-center gap-3 hover:opacity-90"
      >
        <UserAvatar
          userId={user.id}
          username={user.username}
          imageUrl={user.image}
          size={40}
        />
        <span className="truncate font-medium">@{user.username}</span>
      </Link>
      {actions}
    </li>
  )
}

export function FriendsSearchResults({ hits }: { hits: UserSearchHit[] }) {
  if (hits.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No users found. Try a different username prefix.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-border">
      {hits.map((hit) => (
        <UserRow
          key={hit.id}
          user={hit}
          actions={
            <FriendshipActions
              userId={hit.id}
              username={hit.username}
              relation={hit.relation}
              friendshipId={hit.friendshipId}
            />
          }
        />
      ))}
    </ul>
  )
}

export function FriendshipList({
  items,
  empty,
  mode,
}: {
  items: FriendshipWithUser[]
  empty: string
  mode: "incoming" | "outgoing" | "friends"
}) {
  if (items.length === 0) {
    return <p className="text-muted-foreground text-sm">{empty}</p>
  }

  return (
    <ul className="divide-y divide-border">
      {items.map(({ friendship, user }) => {
        const relation =
          mode === "friends"
            ? "friends"
            : mode === "incoming"
              ? "incoming_pending"
              : "outgoing_pending"

        return (
          <UserRow
            key={friendship.id}
            user={user}
            actions={
              <FriendshipActions
                userId={user.id}
                username={user.username}
                relation={relation}
                friendshipId={friendship.id}
              />
            }
          />
        )
      })}
    </ul>
  )
}
