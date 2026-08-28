import Link from "next/link"

import { BookTile } from "@/components/catalog/book-tile"
import { CurrentlyReadingCard } from "@/components/library/currently-reading-card"
import { TopBooksEditor } from "@/components/library/top-books-editor"
import { buttonVariants } from "@/components/ui/button"
import type { BookTile as BookTileData } from "@/lib/books/types"
import type { LibraryEntryTile, LibraryLists } from "@/lib/library/types"
import type { TopBookSlot } from "@/lib/users/top-books/types"

function CatalogCta({
  label = "Browse catalog",
  variant = "default" as const,
}: {
  label?: string
  variant?: "default" | "outline" | "secondary"
}) {
  return (
    <Link
      href="/books"
      className={buttonVariants({
        variant,
        size: "sm",
        className: "w-fit",
      })}
    >
      {label}
    </Link>
  )
}

function CurrentlyReading({ entry }: { entry: LibraryEntryTile | null }) {
  if (!entry) {
    return (
      <section className="relative overflow-hidden rounded-2xl border border-border/70 bg-linear-to-br from-foreground/[0.05] via-muted/60 to-background px-5 py-8 sm:px-8 sm:py-10">
        <div
          aria-hidden
          className="bg-foreground absolute inset-y-0 left-0 w-1"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 right-0 size-64 rounded-full bg-foreground/[0.04] blur-3xl"
        />
        <div className="relative max-w-lg space-y-3 pl-2 sm:pl-3">
          <p className="text-muted-foreground text-xs font-medium tracking-[0.14em] uppercase">
            Currently reading
          </p>
          <h2 className="text-xl font-semibold tracking-tight text-balance sm:text-2xl">
            Pick up something new
          </h2>
          <p className="text-muted-foreground text-sm text-pretty">
            You don&apos;t have a book in progress. Find a title and mark it as
            started reading.
          </p>
          <CatalogCta label="Find a book" />
        </div>
      </section>
    )
  }

  return <CurrentlyReadingCard entry={entry} />
}

function SectionHeading({
  title,
  count,
  description,
}: {
  title: string
  count: number
  description?: string
}) {
  return (
    <div className="space-y-1">
      <h2 className="text-lg font-semibold tracking-tight">
        {title}
        {count > 0 ? (
          <span className="text-muted-foreground ml-2 text-sm font-normal tabular-nums">
            {count}
          </span>
        ) : null}
      </h2>
      {description ? (
        <p className="text-muted-foreground text-sm">{description}</p>
      ) : null}
    </div>
  )
}

function LibraryGridSection({
  title,
  description,
  entries,
  tileSize = "md",
  showOwnRating = false,
}: {
  title: string
  description?: string
  entries: LibraryEntryTile[]
  tileSize?: "sm" | "md"
  showOwnRating?: boolean
}) {
  return (
    <section className="space-y-4">
      <SectionHeading
        title={title}
        count={entries.length}
        description={description}
      />
      <div className="flex flex-wrap gap-x-3 gap-y-5 sm:gap-x-4 sm:gap-y-6">
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className="animate-in fade-in-0 slide-in-from-bottom-1 fill-mode-both duration-300 motion-reduce:animate-none"
            style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
          >
            <BookTile
              book={entry.book}
              size={tileSize}
              showOwnRating={showOwnRating}
              ownRating={entry.rating}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

function LibraryStats({ readCount }: { readCount: number }) {
  if (readCount === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        What you&apos;re reading, what you&apos;ve finished, and what&apos;s
        next.
      </p>
    )
  }

  return (
    <p className="text-muted-foreground text-sm">
      <span className="text-foreground font-medium tabular-nums">
        {readCount}
      </span>{" "}
      {readCount === 1 ? "book read" : "books read"}
    </p>
  )
}

type LibraryViewProps = {
  lists: LibraryLists
  topBooks: TopBookSlot[]
}

export function LibraryView({ lists, topBooks }: LibraryViewProps) {
  const readBooks: BookTileData[] = lists.read.map((e) => e.book)

  return (
    <div className="space-y-12">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Your library</h1>
        <LibraryStats readCount={lists.read.length} />
      </div>

      <CurrentlyReading entry={lists.reading} />

      {readBooks.length > 0 ? (
        <TopBooksEditor initialSlots={topBooks} readBooks={readBooks} />
      ) : null}

      {lists.read.length > 0 ? (
        <LibraryGridSection
          title="Read"
          description="Books you've finished"
          entries={lists.read}
          showOwnRating
        />
      ) : null}

      {lists.interested.length > 0 ? (
        <LibraryGridSection
          title="Interested"
          description="Your shortlist for later"
          entries={lists.interested}
          tileSize="sm"
        />
      ) : null}
    </div>
  )
}
