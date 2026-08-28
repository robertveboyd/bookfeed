import Link from "next/link"

import { BookCover } from "@/components/catalog/book-cover"
import type { LibraryEntryTile } from "@/lib/library/types"

export function CurrentlyReadingCard({
  entry,
  label = "Currently reading",
}: {
  entry: LibraryEntryTile
  label?: string
}) {
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
              {label}
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
