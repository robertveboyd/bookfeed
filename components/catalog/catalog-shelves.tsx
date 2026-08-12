import { BookShelf } from "@/components/catalog/book-shelf"
import { listShelves } from "@/lib/books/queries"
import { requireSession } from "@/lib/auth/util/session"
import { getLibraryStatusMap } from "@/lib/library/queries"

export async function CatalogShelves() {
  const session = await requireSession()
  const shelves = await listShelves()
  const bookIds = shelves.flatMap((shelf) => shelf.books.map((b) => b.id))
  const statusByBookId = await getLibraryStatusMap(session.user.id, bookIds)

  return (
    <div className="space-y-8">
      {shelves.map((shelf) => (
        <BookShelf
          key={shelf.genre}
          shelf={shelf}
          showStatusMenu
          statusByBookId={statusByBookId}
        />
      ))}
    </div>
  )
}
