import { StarIcon } from "lucide-react"
import Link from "next/link"

import { BookCover } from "@/components/catalog/book-cover"
import { BookTileStatusMenu } from "@/components/catalog/book-tile-status-menu"
import type { BookTile as BookTileData } from "@/lib/books/types"
import type { LibraryStatus } from "@/lib/library/types"
import { cn } from "@/lib/utils"

const tileSizeClass = {
  sm: "w-24 sm:w-28",
  md: "w-28 sm:w-32 md:w-36",
} as const

type BookTileProps = {
  book: BookTileData
  size?: keyof typeof tileSizeClass
  className?: string
  /** When set with showStatusMenu, seeds the catalog status control */
  libraryStatus?: LibraryStatus | null
  showStatusMenu?: boolean
}

export function BookTile({
  book,
  size = "md",
  className,
  libraryStatus = null,
  showStatusMenu = false,
}: BookTileProps) {
  const authorsLabel = book.authors.join(", ")
  const href = `/books/${book.id}`

  return (
    <div
      className={cn(
        "group/tile shrink-0 snap-start",
        tileSizeClass[size],
        className,
      )}
    >
      <div className="relative aspect-[2/3]">
        <div className="absolute inset-0 overflow-hidden rounded-md bg-muted shadow-sm transition duration-200 group-hover/tile:scale-[1.03] group-hover/tile:shadow-md motion-reduce:transition-none motion-reduce:group-hover/tile:scale-100">
          <Link
            href={href}
            className="absolute inset-0 block"
            aria-label={book.title}
          >
            <BookCover coverImageId={book.coverImageId} title={book.title} />
          </Link>
        </div>

        {showStatusMenu ? (
          <div className="absolute top-1.5 right-1.5 z-10">
            <BookTileStatusMenu
              bookId={book.id}
              initialStatus={libraryStatus}
            />
          </div>
        ) : null}
      </div>

      <div className="mt-2 space-y-0.5">
        <p className="line-clamp-2 text-sm leading-snug font-medium tracking-tight">
          <Link href={href} className="hover:underline underline-offset-2">
            {book.title}
          </Link>
        </p>
        {authorsLabel ? (
          <p className="text-muted-foreground line-clamp-1 text-xs">
            {authorsLabel}
          </p>
        ) : null}
        {book.rating && book.rating.count > 0 ? (
          <p
            className="flex items-center gap-1 text-xs tabular-nums"
            aria-label={`${book.rating.average.toFixed(1)} out of 5 from ${book.rating.count} ${book.rating.count === 1 ? "rating" : "ratings"}`}
          >
            <StarIcon className="size-3 fill-current" aria-hidden />
            <span>{book.rating.average.toFixed(1)}</span>
            <span className="text-muted-foreground">({book.rating.count})</span>
          </p>
        ) : null}
      </div>
    </div>
  )
}
