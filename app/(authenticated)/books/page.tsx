import { Suspense } from "react"
import type { Metadata } from "next"

import { CatalogSearch } from "@/components/catalog/catalog-search"
import { CatalogSearchResults } from "@/components/catalog/catalog-search-results"
import { CatalogSearchResultsFallback } from "@/components/catalog/catalog-search-results-fallback"
import { CatalogShelves } from "@/components/catalog/catalog-shelves"
import { CatalogShelvesFallback } from "@/components/catalog/catalog-shelves-fallback"

export const metadata: Metadata = {
  title: "Catalog",
}

type PageProps = {
  searchParams: Promise<{ q?: string | string[] }>
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  const qParam = params.q
  const q = (Array.isArray(qParam) ? qParam[0] : qParam)?.trim() ?? ""

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Catalog</h1>
          <p className="text-muted-foreground">Search and browse books.</p>
        </div>
        <CatalogSearch defaultQuery={q} />
      </div>

      {q ? (
        <Suspense fallback={<CatalogSearchResultsFallback />} key={q}>
          <CatalogSearchResults q={q} />
        </Suspense>
      ) : (
        <Suspense fallback={<CatalogShelvesFallback />}>
          <CatalogShelves />
        </Suspense>
      )}
    </div>
  )
}
