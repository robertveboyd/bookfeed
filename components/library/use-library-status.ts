"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import {
  clearLibraryStatus,
  setLibraryStatus,
} from "@/lib/library/actions/set-status"
import type { LibraryStatus, ReadingConflict } from "@/lib/library/types"

type UseLibraryStatusOptions = {
  bookId: string
  initialStatus: LibraryStatus | null
  onStatusChange?: (status: LibraryStatus | null) => void
}

export function useLibraryStatus({
  bookId,
  initialStatus,
  onStatusChange,
}: UseLibraryStatusOptions) {
  const router = useRouter()
  const [status, setStatus] = useState<LibraryStatus | null>(initialStatus)
  const [error, setError] = useState<string | null>(null)
  const [conflict, setConflict] = useState<ReadingConflict | null>(null)
  const [conflictPending, setConflictPending] = useState(false)
  const statusRef = useRef(initialStatus)
  const mutationRef = useRef(0)

  useEffect(() => {
    statusRef.current = initialStatus
    setStatus(initialStatus)
  }, [initialStatus])

  function commitStatus(next: LibraryStatus | null) {
    statusRef.current = next
    setStatus(next)
    onStatusChange?.(next)
  }

  function isLatestMutation(mutationId: number) {
    return mutationId === mutationRef.current
  }

  function applyStatus(
    next: LibraryStatus,
    resolveReadingConflict?: "finish" | "demote",
  ) {
    setError(null)
    const mutationId = ++mutationRef.current
    const previous = statusRef.current

    if (!resolveReadingConflict) {
      commitStatus(next)
    }

    void (async () => {
      if (resolveReadingConflict) {
        setConflictPending(true)
      }

      const result = await setLibraryStatus({
        bookId,
        status: next,
        resolveReadingConflict,
      })

      if (resolveReadingConflict) {
        setConflictPending(false)
      }

      if (!isLatestMutation(mutationId)) return

      if (result.ok) {
        commitStatus(result.entry.status)
        setConflict(null)
        if (resolveReadingConflict) {
          router.refresh()
        }
        return
      }

      if (result.code === "conflict") {
        commitStatus(previous)
        setConflict(result.conflict)
        return
      }

      commitStatus(previous)
      setError(result.message)
      setConflict(null)
    })()
  }

  function clearStatus() {
    setError(null)
    const mutationId = ++mutationRef.current
    const previous = statusRef.current
    commitStatus(null)

    void (async () => {
      const result = await clearLibraryStatus({ bookId })

      if (!isLatestMutation(mutationId)) return

      if (result.ok) {
        setConflict(null)
        return
      }

      commitStatus(previous)
      setError(result.message)
    })()
  }

  function onSelect(next: LibraryStatus) {
    if (next === statusRef.current) {
      clearStatus()
      return
    }
    applyStatus(next)
  }

  return {
    status,
    error,
    conflict,
    conflictPending,
    setConflict,
    applyStatus,
    clearStatus,
    onSelect,
  }
}
