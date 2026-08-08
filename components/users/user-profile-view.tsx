import Link from "next/link"

import { BookCover } from "@/components/catalog/book-cover"
import { BookTile } from "@/components/catalog/book-tile"
import { FriendshipActions } from "@/components/friends/friendship-actions"
import { UserAvatar } from "@/components/profile/user-avatar"
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

function ProfileCurrentlyReading({
  entry,
  emptyLabel,
}: {
  entry: LibraryEntryTile | null
  emptyLabel: string
}) {
  if (!entry) {
    return (
      <section className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight">
          Currently reading
        </h2>
        <p className="text-muted-foreground text-sm">{emptyLabel}</p>
      </section>
    )
  }

  const { book } = entry
  const authorsLabel = book.authors.join(", ")

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">Currently reading</h2>
      <div className="flex gap-4 sm:gap-6">
        <Link
          href={`/books/${book.id}`}
          className="relative aspect-[2/3] w-28 shrink-0 overflow-hidden rounded-md bg-muted shadow-sm sm:w-32"
        >
          <BookCover
            coverImageId={book.coverImageId}
            title={book.title}
            size="L"
          />
        </Link>
        <div className="min-w-0 space-y-1 self-center">
          <h3 className="text-xl font-semibold tracking-tight text-balance">
            <Link
              href={`/books/${book.id}`}
              className="hover:underline underline-offset-4"
            >
              {book.title}
            </Link>
          </h3>
          {authorsLabel ? (
            <p className="text-muted-foreground text-sm">{authorsLabel}</p>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function ProfileTopBooks({ slots }: { slots: TopBookSlot[] }) {
  const ordered = [...slots].sort((a, b) => a.position - b.position)

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">Top 5</h2>
      {ordered.length === 0 ? (
        <p className="text-muted-foreground text-sm">No top books yet.</p>
      ) : (
        <ol className="flex flex-wrap gap-x-3 gap-y-5 sm:gap-x-4">
          {ordered.map((slot) => (
            <li key={slot.position} className="relative">
              <span className="bg-background/90 text-muted-foreground absolute top-1.5 left-1.5 z-10 rounded px-1 text-[10px] font-medium tabular-nums ring-1 ring-border">
                #{slot.position}
              </span>
              <BookTile book={slot.book} size="md" />
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

function ProfileGrid({
  title,
  entries,
  empty,
  tileSize = "md",
}: {
  title: string
  entries: LibraryEntryTile[]
  empty: string
  tileSize?: "sm" | "md"
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">
        {title}
        {entries.length > 0 ? (
          <span className="text-muted-foreground ml-2 text-sm font-normal tabular-nums">
            {entries.length}
          </span>
        ) : null}
      </h2>
      {entries.length === 0 ? (
        <p className="text-muted-foreground text-sm">{empty}</p>
      ) : (
        <div className="flex flex-wrap gap-x-3 gap-y-5 sm:gap-x-4 sm:gap-y-6">
          {entries.map((entry) => (
            <BookTile key={entry.id} book={entry.book} size={tileSize} />
          ))}
        </div>
      )}
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
  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <UserAvatar
            userId={user.id}
            username={user.username}
            imageUrl={user.image}
            size={80}
          />
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              @{user.username}
            </h1>
            <p className="text-muted-foreground text-sm">
              {mode === "friend"
                ? "You’re friends — here’s their library."
                : "Add them as a friend to see their full library."}
            </p>
          </div>
        </div>

        <FriendshipActions
          userId={user.id}
          username={user.username}
          relation={relation}
          friendshipId={friendshipId}
          size="default"
        />
      </div>

      <ProfileCurrentlyReading
        entry={lists.reading}
        emptyLabel={
          mode === "friend"
            ? "Not reading anything right now."
            : "Not reading anything right now."
        }
      />

      {mode === "friend" ? (
        <>
          <ProfileTopBooks slots={topBooks} />
          <ProfileGrid
            title="Read"
            entries={lists.read ?? []}
            empty="No finished books yet."
          />
          <ProfileGrid
            title="Interested"
            entries={lists.interested ?? []}
            empty="Nothing on their shortlist."
            tileSize="sm"
          />
        </>
      ) : null}
    </div>
  )
}
