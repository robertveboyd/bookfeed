import type { ReactNode } from "react"

import { FriendshipActions } from "@/components/friends/friendship-actions"
import { UserAvatarWithReadingBadge } from "@/components/profile/user-avatar-with-reading-badge"
import { EmptyState } from "@/components/ui/empty-state"
import { FriendHoverCard } from "@/components/users/friend-hover-card"
import type {
  CurrentlyReadingBook,
  FriendshipWithUser,
  UserSearchHit,
} from "@/lib/friends/types"
import { cn } from "@/lib/utils"

const peopleGridClass =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"

function PersonCard({
  user,
  actions,
  reading,
  showHoverPreview = false,
}: {
  user: { id: string; username: string; image: string | null }
  actions: ReactNode
  reading?: CurrentlyReadingBook | null
  showHoverPreview?: boolean
}) {
  const profileLinkClass =
    "flex w-full min-w-0 flex-col items-center gap-2 hover:opacity-90"

  const profileContent = (
    <>
      <UserAvatarWithReadingBadge
        userId={user.id}
        username={user.username}
        imageUrl={user.image}
        size={56}
        reading={reading}
      />
      <span className="w-full truncate text-center text-sm font-medium">
        @{user.username}
      </span>
    </>
  )

  return (
    <li className="flex flex-col items-center gap-3 rounded-xl border border-border/80 px-3 py-4">
      <FriendHoverCard
        user={user}
        enabled={showHoverPreview}
        className={profileLinkClass}
      >
        {profileContent}
      </FriendHoverCard>
      {actions}
    </li>
  )
}

export function FriendsSearchResults({ hits }: { hits: UserSearchHit[] }) {
  if (hits.length === 0) {
    return (
      <EmptyState
        title="No users found"
        description="Try a different username prefix (at least 2 characters)."
      />
    )
  }

  return (
    <ul className={peopleGridClass}>
      {hits.map((hit) => (
        <PersonCard
          key={hit.id}
          user={hit}
          showHoverPreview={hit.relation === "friends"}
          actions={
            <FriendshipActions
              userId={hit.id}
              username={hit.username}
              relation={hit.relation}
              friendshipId={hit.friendshipId}
              align="center"
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
  fillEmpty = false,
  readingByUserId,
}: {
  items: FriendshipWithUser[]
  empty: {
    title: string
    description: string
    action?: { href: string; label: string }
  }
  mode: "incoming" | "outgoing" | "friends"
  fillEmpty?: boolean
  readingByUserId?: Map<string, CurrentlyReadingBook>
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        className={cn(
          fillEmpty &&
            "min-h-0 flex-1 items-center justify-center text-center",
        )}
        title={empty.title}
        description={empty.description}
        action={empty.action}
      />
    )
  }

  return (
    <ul className={peopleGridClass}>
      {items.map(({ friendship, user }) => {
        const relation =
          mode === "friends"
            ? "friends"
            : mode === "incoming"
              ? "incoming_pending"
              : "outgoing_pending"

        return (
          <PersonCard
            key={friendship.id}
            user={user}
            reading={readingByUserId?.get(user.id)}
            showHoverPreview={mode === "friends"}
            actions={
              <FriendshipActions
                userId={user.id}
                username={user.username}
                relation={relation}
                friendshipId={friendship.id}
                align="center"
              />
            }
          />
        )
      })}
    </ul>
  )
}
