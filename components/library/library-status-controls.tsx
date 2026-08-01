"use client"

import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { setLibraryStatus } from "@/lib/library/actions/set-status"
import type {
  LibraryStatus,
  ReadingConflict,
} from "@/lib/library/types"

const ACTIONS: {
  status: LibraryStatus
  label: string
}[] = [
  { status: "interested", label: "Interested" },
  { status: "reading", label: "Started reading" },
  { status: "read", label: "Finished" },
]

type LibraryStatusControlsProps = {
  bookId: string
  initialStatus: LibraryStatus | null
  /** Own library only; hide mutation UI when viewing a friend later */
  canEdit?: boolean
}

export function LibraryStatusControls({
  bookId,
  initialStatus,
  canEdit = true,
}: LibraryStatusControlsProps) {
  const [status, setStatus] = useState<LibraryStatus | null>(initialStatus)
  const [error, setError] = useState<string | null>(null)
  const [conflict, setConflict] = useState<ReadingConflict | null>(null)
  const [pending, startTransition] = useTransition()

  if (!canEdit) {
    if (!status) return null
    const label = ACTIONS.find((a) => a.status === status)?.label ?? status
    return (
      <p className="text-muted-foreground text-sm">
        Status: <span className="text-foreground font-medium">{label}</span>
      </p>
    )
  }

  function applyStatus(
    next: LibraryStatus,
    resolveReadingConflict?: "finish" | "demote",
  ) {
    setError(null)
    startTransition(async () => {
      const result = await setLibraryStatus({
        bookId,
        status: next,
        resolveReadingConflict,
      })

      if (result.ok) {
        setStatus(result.entry.status)
        setConflict(null)
        return
      }

      if (result.code === "conflict") {
        setConflict(result.conflict)
        return
      }

      setError(result.message)
      setConflict(null)
    })
  }

  function onSelect(next: LibraryStatus) {
    if (pending || next === status) return
    applyStatus(next)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {ACTIONS.map(({ status: actionStatus, label }) => {
          const active = status === actionStatus
          return (
            <Button
              key={actionStatus}
              type="button"
              size="sm"
              variant={active ? "default" : "outline"}
              disabled={pending}
              aria-pressed={active}
              onClick={() => onSelect(actionStatus)}
            >
              {label}
            </Button>
          )
        })}
      </div>

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      <Dialog
        open={conflict !== null}
        onOpenChange={(open) => {
          if (!open && !pending) setConflict(null)
        }}
      >
        <DialogContent showCloseButton={!pending}>
          <DialogHeader>
            <DialogTitle>Already reading another book</DialogTitle>
            <DialogDescription>
              {conflict
                ? `You're already reading “${conflict.title}”. Mark it finished, or move it to Interested?`
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => setConflict(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={pending}
              onClick={() => applyStatus("reading", "demote")}
            >
              Move to Interested
            </Button>
            <Button
              type="button"
              disabled={pending}
              onClick={() => applyStatus("reading", "finish")}
            >
              Mark finished
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
