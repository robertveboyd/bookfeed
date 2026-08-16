"use client"

import { SearchIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { useDebouncedSearchQuery } from "@/hooks/use-debounced-search-query"

type FriendsSearchProps = {
  defaultQuery?: string
}

export function FriendsSearch({ defaultQuery = "" }: FriendsSearchProps) {
  const { value, onChange } = useDebouncedSearchQuery(defaultQuery)
  const trimmed = value.trim()

  return (
    <div className="space-y-2">
      <div className="relative max-w-xl">
        <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search by username…"
          aria-label="Search users by username"
          className="pl-8"
          autoComplete="off"
        />
      </div>
      {trimmed.length > 0 && trimmed.length < 2 ? (
        <p className="text-muted-foreground text-sm">
          Type at least 2 characters to search.
        </p>
      ) : null}
    </div>
  )
}
