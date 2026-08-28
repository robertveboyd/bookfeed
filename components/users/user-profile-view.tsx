import { BookTile } from "@/components/catalog/book-tile"
import { FriendshipActions } from "@/components/friends/friendship-actions"
import { CurrentlyReadingCard } from "@/components/library/currently-reading-card"
import { UserAvatar } from "@/components/profile/user-avatar"
import { EmptyState } from "@/components/ui/empty-state"
import { HorizontalScroller } from "@/components/ui/horizontal-scroller"
import type { FriendUser, FriendshipRelation } from "@/lib/friends/types"
import type { LibraryEntryTile, LibraryLists } from "@/lib/library/types"
import type { TopBookSlot } from "@/lib/users/top-books/types"

type UserProfileViewProps = {
  user: FriendUser
  relation: Exclude<FriendshipRelation, "self">
  friendshipId: string | null
  /** Friends see full library; non-friends only currently reading. */
  mode: "friend" | "limited"
  lists: Pick<LibraryLists, "reading"> &
    Partial<Pick<LibraryLists, "read" | "interested">>
  topBooks: TopBookSlot[]
}

function ProfileTopBooks({ slots }: { slots: TopBookSlot[] }) {
  const ordered = [...slots].sort((a, b) => a.position - b.position)

  return (
    <section className="space-y-3 sm:space-y-4">
      <h2 className="text-base font-semibold tracking-tight sm:text-lg">Top 5</h2>
      {/* Mobile: swipeable row */}
      <div className="sm:hidden">
        <HorizontalScroller bleed aria-label="Top 5 books">
          {ordered.map((slot) => (
            <div key={slot.position} role="listitem" className="relative shrink-0">
              <span className="bg-background/90 text-muted-foreground absolute top-1.5 left-1.5 z-10 rounded px-1 text-[10px] font-medium tabular-nums ring-1 ring-border">
                #{slot.position}
              </span>
              <BookTile book={slot.book} size="sm" />
            </div>
          ))}
        </HorizontalScroller>
      </div>
      {/* Desktop: wrap */}
      <ol className="hidden flex-wrap gap-x-3 gap-y-5 sm:flex sm:gap-x-4">
        {ordered.map((slot) => (
          <li key={slot.position} className="relative">
            <span className="bg-background/90 text-muted-foreground absolute top-1.5 left-1.5 z-10 rounded px-1 text-[10px] font-medium tabular-nums ring-1 ring-border">
              #{slot.position}
            </span>
            <BookTile book={slot.book} size="md" />
          </li>
        ))}
      </ol>
    </section>
  )
}

function ProfileGrid({
  title,
  entries,
  tileSize = "md",
}: {
  title: string
  entries: LibraryEntryTile[]
  tileSize?: "sm" | "md"
}) {
  return (
    <section className="space-y-3 sm:space-y-4">
      <h2 className="text-base font-semibold tracking-tight sm:text-lg">
        {title}
        <span className="text-muted-foreground ml-2 text-sm font-normal tabular-nums">
          {entries.length}
        </span>
      </h2>
      <div className="sm:hidden">
        <HorizontalScroller bleed aria-label={title}>
          {entries.map((entry) => (
            <div key={entry.id} role="listitem" className="shrink-0">
              <BookTile book={entry.book} size="sm" />
            </div>
          ))}
        </HorizontalScroller>
      </div>
      <div className="hidden flex-wrap gap-x-3 gap-y-5 sm:flex sm:gap-x-4 sm:gap-y-6">
        {entries.map((entry) => (
          <BookTile key={entry.id} book={entry.book} size={tileSize} />
        ))}
      </div>
    </section>
  )
}

export function UserProfileView({
  user,
  relation,
  friendshipId,
  mode,
  lists,
  topBooks,
}: UserProfileViewProps) {
  const read = lists.read ?? []
  const interested = lists.interested ?? []
  const hasReading = lists.reading != null
  const hasTopBooks = topBooks.length > 0
  const hasLibraryActivity =
    hasReading || read.length > 0 || interested.length > 0

  const showEmptyLibrary =
    mode === "friend"
      ? !hasLibraryActivity && !hasTopBooks
      : !hasReading

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <UserAvatar
            userId={user.id}
            username={user.username}
            imageUrl={user.image}
            size={64}
          />
          <div className="min-w-0 space-y-1">
            <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
              @{user.username}
            </h1>
            <p className="text-muted-foreground text-sm text-pretty">
              {mode === "friend"
                ? "You’re friends — here’s their library."
                : "Add them as a friend to see their full library."}
            </p>
          </div>
        </div>

        <div className="w-full sm:w-auto sm:shrink-0">
          <FriendshipActions
            userId={user.id}
            username={user.username}
            relation={relation}
            friendshipId={friendshipId}
            size="default"
            fullWidth
          />
        </div>
      </div>

      {showEmptyLibrary ? (
        <EmptyState
          className="min-h-48 flex-1 items-center justify-center text-center sm:min-h-64"
          title={
            mode === "friend"
              ? `@${user.username} has no activity yet`
              : `@${user.username} isn’t reading anything right now`
          }
          description={
            mode === "friend"
              ? "When they start tracking books, their library will show up here."
              : "Add them as a friend to see their full library."
          }
        />
      ) : (
        <>
          {hasReading ? (
            <CurrentlyReadingCard entry={lists.reading!} />
          ) : null}

          {mode === "friend" ? (
            <>
              {hasTopBooks ? <ProfileTopBooks slots={topBooks} /> : null}
              {read.length > 0 ? (
                <ProfileGrid title="Read" entries={read} />
              ) : null}
              {interested.length > 0 ? (
                <ProfileGrid
                  title="Interested"
                  entries={interested}
                  tileSize="sm"
                />
              ) : null}
            </>
          ) : null}
        </>
      )}
    </div>
  )
}
