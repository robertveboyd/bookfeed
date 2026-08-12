import Link from "next/link"

import { BookCover } from "@/components/catalog/book-cover"
import { UserAvatar } from "@/components/profile/user-avatar"
import { EmptyState } from "@/components/ui/empty-state"
import { HorizontalScroller } from "@/components/ui/horizontal-scroller"
import type { FriendRailItem } from "@/lib/friends/types"

type FriendsRailProps = {
  friends: FriendRailItem[]
  /** horizontal chips (mobile) vs vertical rail (desktop) */
  variant: "rail" | "chips"
}

function FriendItem({
  friend,
  variant,
}: {
  friend: FriendRailItem
  variant: "rail" | "chips"
}) {
  const href = `/users/${friend.username}`

  if (variant === "chips") {
    return (
      <Link
        href={href}
        className="flex w-[4.5rem] shrink-0 flex-col items-center gap-1.5 snap-start touch-manipulation sm:w-20"
      >
        <div className="relative size-12 sm:size-[3rem]">
          <UserAvatar
            userId={friend.id}
            username={friend.username}
            imageUrl={friend.image}
            size={48}
          />
          {friend.reading ? (
            <span className="absolute -right-1 -bottom-1 block size-6 overflow-hidden rounded-sm bg-muted ring-2 ring-background shadow-sm">
              <span className="relative block size-full">
                <BookCover
                  coverImageId={friend.reading.coverImageId}
                  title={friend.reading.title}
                  size="S"
                />
              </span>
            </span>
          ) : null}
        </div>
        <span className="w-full truncate text-center text-[11px] leading-tight sm:text-xs">
          {friend.username}
        </span>
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-lg px-1 py-1.5 hover:bg-muted/60"
    >
      <div className="relative shrink-0">
        <UserAvatar
          userId={friend.id}
          username={friend.username}
          imageUrl={friend.image}
          size={36}
        />
        {friend.reading ? (
          <span className="absolute -right-1 -bottom-1 block size-5 overflow-hidden rounded-sm bg-muted ring-2 ring-background shadow-sm">
            <span className="relative block size-full">
              <BookCover
                coverImageId={friend.reading.coverImageId}
                title={friend.reading.title}
                size="S"
              />
            </span>
          </span>
        ) : null}
      </div>
      <span className="min-w-0 truncate text-sm font-medium">
        @{friend.username}
      </span>
    </Link>
  )
}

export function FriendsRail({ friends, variant }: FriendsRailProps) {
  if (variant === "chips") {
    return (
      <section className="space-y-3 lg:hidden">
        <div className="flex items-center justify-between gap-2 px-0">
          <h2 className="text-sm font-medium tracking-tight">Friends</h2>
          <Link
            href="/friends"
            className="text-muted-foreground hover:text-foreground min-h-9 inline-flex items-center text-xs underline-offset-4 hover:underline"
          >
            Find friends
          </Link>
        </div>
        {friends.length === 0 ? (
          <EmptyState
            title="No friends yet"
            description="Find people by username to fill your feed."
            action={{ href: "/friends", label: "Find friends" }}
          />
        ) : (
          <HorizontalScroller bleed aria-label="Friends">
            {friends.map((friend) => (
              <div key={friend.id} role="listitem">
                <FriendItem friend={friend} variant="chips" />
              </div>
            ))}
          </HorizontalScroller>
        )}
      </section>
    )
  }

  return (
    <aside className="hidden w-52 shrink-0 lg:block xl:w-56">
      <div className="sticky top-20 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-medium tracking-tight">Friends</h2>
          <Link
            href="/friends"
            className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline"
          >
            Find friends
          </Link>
        </div>
        {friends.length === 0 ? (
          <EmptyState
            title="No friends yet"
            description="Find people by username to fill your feed."
            action={{ href: "/friends", label: "Find friends" }}
          />
        ) : (
          <ul className="space-y-0.5">
            {friends.map((friend) => (
              <li key={friend.id}>
                <FriendItem friend={friend} variant="rail" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}
