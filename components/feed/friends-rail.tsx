import Link from "next/link"

import { BookCover } from "@/components/catalog/book-cover"
import { UserAvatar } from "@/components/profile/user-avatar"
import { buttonVariants } from "@/components/ui/button"
import { HorizontalScroller } from "@/components/ui/horizontal-scroller"
import { FriendHoverCard } from "@/components/users/friend-hover-card"
import type { FriendRailItem } from "@/lib/friends/types"
import { cn } from "@/lib/utils"

type FriendsRailProps = {
  friends: FriendRailItem[]
  /** horizontal chips (mobile) vs vertical rail (desktop) */
  variant: "rail" | "chips"
}

function FriendItem({ friend }: { friend: FriendRailItem }) {
  return (
    <FriendHoverCard
      user={friend}
      className="flex w-full min-w-0 flex-col items-center gap-1.5"
    >
      <div className="relative size-12">
        <UserAvatar
          userId={friend.id}
          username={friend.username}
          imageUrl={friend.image}
          size={48}
        />
        {friend.reading ? (
          <span className="absolute -right-1 -bottom-1 block aspect-[2/3] w-5 overflow-hidden rounded-sm bg-muted ring-2 ring-background shadow-sm">
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
    </FriendHoverCard>
  )
}

function FriendsEmpty({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl border border-dashed border-border/80 px-4 py-6",
        className,
      )}
    >
      <Link
        href="/friends"
        className={buttonVariants({ variant: "default", size: "lg" })}
      >
        Find friends
      </Link>
    </div>
  )
}

export function FriendsRail({ friends, variant }: FriendsRailProps) {
  if (variant === "chips") {
    return (
      <section className="lg:hidden">
        {friends.length === 0 ? (
          <FriendsEmpty className="min-h-28" />
        ) : (
          <HorizontalScroller bleed aria-label="Friends">
            {friends.map((friend) => (
              <div
                key={friend.id}
                role="listitem"
                className="w-[4.5rem] shrink-0 snap-start sm:w-20"
              >
                <FriendItem friend={friend} />
              </div>
            ))}
          </HorizontalScroller>
        )}
      </section>
    )
  }

  return (
    <aside className="hidden w-52 shrink-0 lg:block lg:sticky lg:top-0 lg:self-start xl:w-64">
      {friends.length === 0 ? (
        <FriendsEmpty className="min-h-28" />
      ) : (
        <div className="scrollbar-hidden max-h-[calc(100dvh-3.5rem-2rem)] overflow-y-auto overscroll-y-contain">
          <ul className="grid grid-cols-2 gap-x-2 gap-y-4 xl:grid-cols-3">
            {friends.map((friend) => (
              <li key={friend.id} className="min-w-0">
                <FriendItem friend={friend} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  )
}
