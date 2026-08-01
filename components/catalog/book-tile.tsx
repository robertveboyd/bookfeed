import Link from "next/link"

import { BookCover } from "@/components/catalog/book-cover"
import type { BookTile as BookTileData } from "@/lib/books/types"
import { cn } from "@/lib/utils"

const tileSizeClass = {
  sm: "w-24 sm:w-28",
  md: "w-28 sm:w-32 md:w-36",
} as const

type BookTileProps = {
  book: BookTileData
  size?: keyof typeof tileSizeClass
  className?: string
}

export function BookTile({ book, size = "md", className }: BookTileProps) {
  const authorsLabel = book.authors.join(", ")

  return (
    <Link
      href={`/books/${book.id}`}
      className={cn(
        "group/tile shrink-0 snap-start",
        tileSizeClass[size],
        className,
      )}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-muted shadow-sm transition duration-200 group-hover/tile:scale-[1.03] group-hover/tile:shadow-md motion-reduce:transition-none motion-reduce:group-hover/tile:scale-100">
        <BookCover coverImageId={book.coverImageId} title={book.title} />
      </div>
      <div className="mt-2 space-y-0.5">
        <p className="line-clamp-2 text-sm leading-snug font-medium tracking-tight">
          {book.title}
        </p>
        {authorsLabel ? (
          <p className="text-muted-foreground line-clamp-1 text-xs">
            {authorsLabel}
          </p>
        ) : null}
      </div>
    </Link>
  )
}
