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

export const peopleGridClass =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"

function PersonCard({
  user,
  actions,
  cornerAction,
  reading,
  showReadingLine = false,
  showHoverPreview = false,
}: {
  user: { id: string; username: string; image: string | null }
  actions?: ReactNode
  /** Quiet action pinned to the card corner, revealed on hover */
  cornerAction?: ReactNode
  reading?: CurrentlyReadingBook | null
  showReadingLine?: boolean
  showHoverPreview?: boolean
}) {
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
      {showReadingLine ? (
        <span className="text-muted-foreground line-clamp-1 min-h-4 w-full text-center text-xs">
          {reading?.title ?? ""}
        </span>
      ) : null}
    </>
  )

  return (
    <li className="group/person border-border/70 bg-muted/20 hover:border-border hover:bg-muted/40 relative flex flex-col items-center gap-3 rounded-xl border px-3 py-4 transition-colors">
      {cornerAction ? (
        <div className="absolute top-1.5 right-1.5 z-10">{cornerAction}</div>
      ) : null}
      <FriendHoverCard
        user={user}
        enabled={showHoverPreview}
        className="flex w-full min-w-0 flex-col items-center gap-1.5 rounded-lg outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
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

        const friendshipActions = (
          <FriendshipActions
            userId={user.id}
            username={user.username}
            relation={relation}
            friendshipId={friendship.id}
            align="center"
            compact={mode === "friends"}
          />
        )

        return (
          <PersonCard
            key={friendship.id}
            user={user}
            reading={readingByUserId?.get(user.id)}
            showReadingLine={mode === "friends"}
            showHoverPreview={mode === "friends"}
            // Unfriend is a rare, destructive action — keep it out of the way.
            cornerAction={mode === "friends" ? friendshipActions : undefined}
            actions={mode === "friends" ? undefined : friendshipActions}
          />
        )
      })}
    </ul>
  )
}
