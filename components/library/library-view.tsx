import Link from "next/link"

import { BookCover } from "@/components/catalog/book-cover"
import { BookTile } from "@/components/catalog/book-tile"
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

  const { book } = entry
  const authorsLabel = book.authors.join(", ")
  const meta = [book.genre, book.publishYear].filter(Boolean).join(" · ")

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/70 bg-linear-to-br from-foreground/[0.06] via-muted/70 to-background px-5 py-7 sm:px-8 sm:py-9">
      <div
        aria-hidden
        className="bg-foreground absolute inset-y-0 left-0 w-1"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-10 size-72 rounded-full bg-foreground/[0.05] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-28 left-1/3 size-56 rounded-full bg-foreground/[0.03] blur-3xl"
      />

      <div className="relative flex flex-col gap-7 pl-2 sm:flex-row sm:items-start sm:gap-10 sm:pl-3">
        <Link
          href={`/books/${book.id}`}
          className="group/cover relative mx-auto aspect-[2/3] w-44 shrink-0 overflow-hidden rounded-lg bg-muted shadow-[0_18px_40px_-12px_rgba(0,0,0,0.45)] ring-1 ring-foreground/10 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] hover:ring-foreground/20 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:mx-0 sm:w-48 md:w-56 dark:shadow-[0_18px_40px_-12px_rgba(0,0,0,0.75)]"
        >
          <BookCover
            coverImageId={book.coverImageId}
            title={book.title}
            size="L"
            className="transition duration-300 group-hover/cover:scale-[1.04] motion-reduce:group-hover/cover:scale-100"
          />
        </Link>

        <div className="flex min-w-0 flex-1 flex-col gap-4 text-center sm:pt-1 sm:text-left">
          <div className="space-y-3">
            <p className="text-muted-foreground text-xs font-medium tracking-[0.14em] uppercase">
              Currently reading
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              <Link
                href={`/books/${book.id}`}
                className="transition-colors hover:underline hover:underline-offset-4"
              >
                {book.title}
              </Link>
            </h2>
            {authorsLabel ? (
              <p className="text-foreground/80 text-base sm:text-lg">
                {authorsLabel}
              </p>
            ) : null}
            {meta ? (
              <p className="text-muted-foreground text-sm">{meta}</p>
            ) : null}
          </div>

          {book.description ? (
            <p className="text-muted-foreground line-clamp-4 text-sm leading-relaxed text-pretty sm:line-clamp-5 sm:text-[0.95rem] sm:leading-7">
              {book.description}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
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
}: {
  title: string
  description?: string
  entries: LibraryEntryTile[]
  tileSize?: "sm" | "md"
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
            <BookTile book={entry.book} size={tileSize} />
          </div>
        ))}
      </div>
    </section>
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
        <p className="text-muted-foreground text-sm">
          What you&apos;re reading, what you&apos;ve finished, and what&apos;s
          next.
        </p>
      </div>

      <CurrentlyReading entry={lists.reading} />

      <TopBooksEditor initialSlots={topBooks} readBooks={readBooks} />

      {lists.read.length > 0 ? (
        <LibraryGridSection
          title="Read"
          description="Books you've finished"
          entries={lists.read}
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
