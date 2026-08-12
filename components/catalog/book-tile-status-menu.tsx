"use client"

import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  clearLibraryStatus,
  setLibraryStatus,
} from "@/lib/library/actions/set-status"
import type { LibraryStatus, ReadingConflict } from "@/lib/library/types"
import { cn } from "@/lib/utils"

const STATUS_OPTIONS: {
  status: LibraryStatus
  label: string
}[] = [
  { status: "interested", label: "Interested" },
  { status: "reading", label: "Started reading" },
  { status: "read", label: "Finished" },
]

type BookTileStatusMenuProps = {
  bookId: string
  initialStatus: LibraryStatus | null
}

export function BookTileStatusMenu({
  bookId,
  initialStatus,
}: BookTileStatusMenuProps) {
  const router = useRouter()
  const [status, setStatus] = useState<LibraryStatus | null>(initialStatus)
  const [error, setError] = useState<string | null>(null)
  const [conflict, setConflict] = useState<ReadingConflict | null>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    setStatus(initialStatus)
  }, [initialStatus])

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
        // Conflict resolution also changes another book's status — refresh shelves.
        if (resolveReadingConflict) {
          router.refresh()
        }
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

  function clearStatus() {
    setError(null)
    startTransition(async () => {
      const result = await clearLibraryStatus({ bookId })
      if (result.ok) {
        setStatus(null)
        setConflict(null)
        return
      }
      setError(result.message)
    })
  }

  function onSelect(next: LibraryStatus) {
    if (pending) return
    if (next === status) {
      clearStatus()
      return
    }
    applyStatus(next)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              size="icon-xs"
              variant="secondary"
              disabled={pending}
              aria-label="Update library status"
              className={cn(
                "bg-background/90 pointer-events-auto size-6 shadow-sm backdrop-blur-sm",
                // Touch: always visible. Hover devices: only on tile hover / open / focus.
                "opacity-100 [@media(hover:hover)]:opacity-0",
                "[@media(hover:hover)]:group-hover/tile:opacity-100",
                "[@media(hover:hover)]:focus-visible:opacity-100",
                "data-popup-open:opacity-100",
              )}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            />
          }
        >
          <ChevronDownIcon className="size-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          side="bottom"
          sideOffset={4}
          className="w-auto min-w-40"
        >
          {STATUS_OPTIONS.map(({ status: optionStatus, label }) => {
            const active = status === optionStatus
            return (
              <DropdownMenuItem
                key={optionStatus}
                disabled={pending}
                className="gap-2"
                onClick={() => onSelect(optionStatus)}
              >
                <CheckIcon
                  className={cn(
                    "size-4",
                    active ? "opacity-100" : "opacity-0",
                  )}
                />
                {label}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {error ? (
        <p className="bg-background/95 text-destructive absolute top-full right-0 z-20 mt-1 max-w-40 rounded-md p-1.5 text-[10px] leading-snug shadow-sm ring-1 ring-border">
          {error}
        </p>
      ) : null}

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
    </>
  )
}
