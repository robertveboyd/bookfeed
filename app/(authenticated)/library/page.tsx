import type { Metadata } from "next"

import { LibraryView } from "@/components/library/library-view"
import { requireSession } from "@/lib/auth/util/session"
import { listLibrary } from "@/lib/library/queries"
import { listTopBooks } from "@/lib/users/top-books/queries"

export const metadata: Metadata = {
  title: "Library",
}

export default async function Page() {
  const session = await requireSession()
  const [lists, topBooks] = await Promise.all([
    listLibrary(session.user.id),
    listTopBooks(session.user.id),
  ])

  return <LibraryView lists={lists} topBooks={topBooks} />
}
