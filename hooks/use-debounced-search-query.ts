"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useDebouncedCallback } from "use-debounce"

/** Local input is source of truth; URL updates are debounced for the server search. */
export function useDebouncedSearchQuery(defaultQuery = "", delay = 300) {
  const router = useRouter()
  const pathname = usePathname()
  const [value, setValue] = useState(defaultQuery)
  const lastPushed = useRef(defaultQuery.trim())

  useEffect(() => {
    const next = defaultQuery.trim()
    if (next === lastPushed.current) return
    lastPushed.current = next
    setValue(defaultQuery)
  }, [defaultQuery])

  const replaceUrl = useDebouncedCallback((nextValue: string) => {
    const next = nextValue.trim()
    if (next === lastPushed.current) return
    lastPushed.current = next
    if (next) {
      router.replace(`${pathname}?q=${encodeURIComponent(next)}`, {
        scroll: false,
      })
    } else {
      router.replace(pathname, { scroll: false })
    }
  }, delay)

  function onChange(next: string) {
    setValue(next)
    replaceUrl(next)
  }

  return { value, onChange }
}
