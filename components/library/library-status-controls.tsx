"use client"

import { ReadingConflictDialog } from "@/components/library/reading-conflict-dialog"
import { useLibraryStatus } from "@/components/library/use-library-status"
import {
  LIBRARY_STATUS_OPTIONS,
  libraryStatusOption,
} from "@/lib/library/status-options"
import type { LibraryStatus } from "@/lib/library/types"
import { cn } from "@/lib/utils"

type LibraryStatusControlsProps = {
  bookId: string
  initialStatus: LibraryStatus | null
  /** Own library only; hide mutation UI when viewing a friend later */
  canEdit?: boolean
  onStatusChange?: (status: LibraryStatus | null) => void
}

export function LibraryStatusControls({
  bookId,
  initialStatus,
  canEdit = true,
  onStatusChange,
}: LibraryStatusControlsProps) {
  const {
    status,
    error,
    conflict,
    conflictPending,
    setConflict,
    applyStatus,
    onSelect,
  } = useLibraryStatus({ bookId, initialStatus, onStatusChange })

  if (!canEdit) {
    if (!status) return null
    const option = libraryStatusOption(status)
    return (
      <p className="text-muted-foreground text-sm">
        Status:{" "}
        <span className="text-foreground font-medium">{option.menuLabel}</span>
      </p>
    )
  }

  return (
    <section className="space-y-2">
      <div
        role="radiogroup"
        aria-label="Library status"
        className="grid w-full grid-cols-3 gap-2"
      >
        {LIBRARY_STATUS_OPTIONS.map(({ status: optionStatus, label, Icon }) => {
          const active = status === optionStatus
          return (
            <button
              key={optionStatus}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={
                active
                  ? `${label}, selected. Activate to remove from library`
                  : label
              }
              onClick={() => onSelect(optionStatus)}
              className={cn(
                "relative flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border px-1.5 py-2.5 text-sm transition-all duration-200 outline-none sm:flex-row sm:gap-1.5 sm:py-2",
                "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2",
                active
                  ? "border-foreground bg-foreground font-semibold text-background shadow-md"
                  : "border-border bg-background font-medium text-muted-foreground shadow-sm hover:border-foreground/35 hover:bg-muted/50 hover:text-foreground",
              )}
            >
              <Icon className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate text-xs sm:text-sm">{label}</span>
            </button>
          )
        })}
      </div>

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      <ReadingConflictDialog
        conflict={conflict}
        pending={conflictPending}
        onOpenChange={() => setConflict(null)}
        onCancel={() => setConflict(null)}
        onDemote={() => applyStatus("reading", "demote")}
        onFinish={() => applyStatus("reading", "finish")}
      />
    </section>
  )
}
