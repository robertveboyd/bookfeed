import { Suspense } from "react"
import type { Metadata } from "next"

import { FriendsSearchHitsFallback } from "@/components/friends/friends-directory-fallback"
import { FriendsSearch } from "@/components/friends/friends-search"
import { FriendsSearchHits } from "@/components/friends/friends-search-hits"

export const metadata: Metadata = {
  title: "Friends",
}

type PageProps = {
  searchParams: Promise<{ q?: string }>
}

export default async function Page({ searchParams }: PageProps) {
  const { q } = await searchParams
  const query = q?.trim() ?? ""

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-medium tracking-tight">Find friends</h2>
      <FriendsSearch defaultQuery={query} />
      {query.length >= 2 ? (
        <Suspense fallback={<FriendsSearchHitsFallback />} key={query}>
          <FriendsSearchHits q={query} />
        </Suspense>
      ) : null}
    </section>
  )
}
