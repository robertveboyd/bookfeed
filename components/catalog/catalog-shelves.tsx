import { BookShelf } from "@/components/catalog/book-shelf"
import { listShelves } from "@/lib/books/queries"

export async function CatalogShelves() {
  const shelves = await listShelves()

  return (
    <div className="space-y-8">
      {shelves.map((shelf) => (
        <BookShelf key={shelf.genre} shelf={shelf} />
      ))}
    </div>
  )
}
