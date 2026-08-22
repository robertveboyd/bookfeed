"use client"

import { ChevronDownIcon } from "lucide-react"

import { ReadingConflictDialog } from "@/components/library/reading-conflict-dialog"
import { useLibraryStatus } from "@/components/library/use-library-status"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LIBRARY_STATUS_OPTIONS } from "@/lib/library/status-options"
import type { LibraryStatus } from "@/lib/library/types"
import { cn } from "@/lib/utils"

type BookTileStatusMenuProps = {
  bookId: string
  initialStatus: LibraryStatus | null
}

export function BookTileStatusMenu({
  bookId,
  initialStatus,
}: BookTileStatusMenuProps) {
  const {
    status,
    error,
    conflict,
    conflictPending,
    setConflict,
    applyStatus,
    onSelect,
  } = useLibraryStatus({ bookId, initialStatus })

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              size="icon-xs"
              variant="secondary"
              aria-label="Update library status"
              className={cn(
                "bg-background/90 pointer-events-auto size-6 shadow-sm backdrop-blur-sm",
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
          className="w-max min-w-0"
        >
          {LIBRARY_STATUS_OPTIONS.map(
            ({ status: optionStatus, menuLabel, Icon }) => {
              const active = status === optionStatus
              return (
                <DropdownMenuItem
                  key={optionStatus}
                  aria-checked={active}
                  className={cn(
                    "cursor-pointer gap-2",
                    active &&
                      "bg-foreground font-medium text-background focus:bg-foreground focus:text-background [&_svg]:opacity-100",
                  )}
                  onClick={() => onSelect(optionStatus)}
                >
                  <Icon
                    className={cn(
                      "size-4 shrink-0",
                      active ? "opacity-100" : "opacity-70",
                    )}
                  />
                  <span>{menuLabel}</span>
                </DropdownMenuItem>
              )
            },
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {error ? (
        <p className="bg-background/95 text-destructive absolute top-full right-0 z-20 mt-1 max-w-40 rounded-md p-1.5 text-[10px] leading-snug shadow-sm ring-1 ring-border">
          {error}
        </p>
      ) : null}

      <ReadingConflictDialog
        conflict={conflict}
        pending={conflictPending}
        onOpenChange={() => setConflict(null)}
        onCancel={() => setConflict(null)}
        onDemote={() => applyStatus("reading", "demote")}
        onFinish={() => applyStatus("reading", "finish")}
      />
    </>
  )
}
