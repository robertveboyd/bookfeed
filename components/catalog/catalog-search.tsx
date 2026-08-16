"use client"

import { SearchIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { useDebouncedSearchQuery } from "@/hooks/use-debounced-search-query"

type CatalogSearchProps = {
  defaultQuery?: string
}

export function CatalogSearch({ defaultQuery = "" }: CatalogSearchProps) {
  const { value, onChange } = useDebouncedSearchQuery(defaultQuery)

  return (
    <div className="relative max-w-xl">
      <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by title or author…"
        aria-label="Search books by title or author"
        className="pl-8"
        autoComplete="off"
      />
    </div>
  )
}
