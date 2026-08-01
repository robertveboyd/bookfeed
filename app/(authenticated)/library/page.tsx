import type { Metadata } from "next"

import { LibraryView } from "@/components/library/library-view"
import { auth } from "@/lib/auth"
import { listLibrary } from "@/lib/library/queries"

export const metadata: Metadata = {
  title: "Library",
}

export default async function Page() {
  const session = await auth()
  const userId = session!.user!.id

  const lists = await listLibrary(userId)

  return <LibraryView lists={lists} />
}
