import { BookmarkIcon, BookOpenIcon, CheckIcon } from "lucide-react"

import type { LibraryStatus } from "@/lib/library/types"

import type { LucideIcon } from "lucide-react"

export type LibraryStatusOption = {
  status: LibraryStatus
  /** Compact label for segmented control */
  label: string
  /** Full label for menus and read-only display */
  menuLabel: string
  Icon: LucideIcon
}

export const LIBRARY_STATUS_OPTIONS: LibraryStatusOption[] = [
  {
    status: "interested",
    label: "Interested",
    menuLabel: "Interested",
    Icon: BookmarkIcon,
  },
  {
    status: "reading",
    label: "Reading",
    menuLabel: "Reading",
    Icon: BookOpenIcon,
  },
  {
    status: "read",
    label: "Finished",
    menuLabel: "Finished",
    Icon: CheckIcon,
  },
]

export function libraryStatusOption(
  status: LibraryStatus,
): LibraryStatusOption {
  const option = LIBRARY_STATUS_OPTIONS.find((row) => row.status === status)
  if (!option) {
    throw new Error(`Unknown library status: ${status}`)
  }
  return option
}
