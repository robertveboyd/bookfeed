import type { Metadata } from "next"

import { LibraryView } from "@/components/library/library-view"
import { requireSession } from "@/lib/auth/util/session"
import { listLibrary } from "@/lib/library/queries"

export const metadata: Metadata = {
  title: "Library",
}

export default async function Page() {
  const session = await requireSession()
  const lists = await listLibrary(session.user.id)

  return <LibraryView lists={lists} />
}
