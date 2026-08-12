import { BookTile } from "@/components/catalog/book-tile"
import { searchBooks } from "@/lib/books/queries"
import { requireSession } from "@/lib/auth/util/session"
import { getLibraryStatusMap } from "@/lib/library/queries"

type CatalogSearchResultsProps = {
  q: string
}

export async function CatalogSearchResults({ q }: CatalogSearchResultsProps) {
  const session = await requireSession()
  const { items, total } = await searchBooks({ q })

  if (total === 0) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium tracking-tight">No results</p>
        <p className="text-muted-foreground text-sm">
          No books match &ldquo;{q}&rdquo;. Try another title or author.
        </p>
      </div>
    )
  }

  const statusByBookId = await getLibraryStatusMap(
    session.user.id,
    items.map((b) => b.id),
  )

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        {total} result{total === 1 ? "" : "s"} for &ldquo;{q}&rdquo;
      </p>

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {items.map((book) => (
          <li key={book.id}>
            <BookTile
              book={book}
              className="w-full"
              showStatusMenu
              libraryStatus={statusByBookId[book.id] ?? null}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
