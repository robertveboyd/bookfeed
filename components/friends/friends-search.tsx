"use client"

import { SearchIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDebouncedCallback } from "use-debounce"

import { Input } from "@/components/ui/input"

type FriendsSearchProps = {
  defaultQuery?: string
}

export function FriendsSearch({ defaultQuery = "" }: FriendsSearchProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [value, setValue] = useState(defaultQuery)

  useEffect(() => {
    setValue(defaultQuery)
  }, [defaultQuery])

  const debouncedReplace = useDebouncedCallback((nextValue: string) => {
    const next = nextValue.trim()
    const current = defaultQuery.trim()
    if (next === current) return

    if (next) {
      router.replace(`${pathname}?q=${encodeURIComponent(next)}`)
    } else {
      router.replace(pathname)
    }
  }, 300)

  return (
    <div className="relative max-w-xl">
      <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
      <Input
        type="search"
        value={value}
        onChange={(e) => {
          const next = e.target.value
          setValue(next)
          debouncedReplace(next)
        }}
        placeholder="Search by username…"
        aria-label="Search users by username"
        className="pl-8"
        autoComplete="off"
      />
    </div>
  )
}
