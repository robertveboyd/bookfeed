import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type HorizontalScrollerProps = {
  children: ReactNode
  className?: string
  /** Bleed to the page edge on mobile (matches main px-4). */
  bleed?: boolean
  "aria-label"?: string
}

/**
 * Touch-friendly horizontal row: snap scrolling, hidden scrollbar,
 * optional edge bleed under the page padding.
 */
export function HorizontalScroller({
  children,
  className,
  bleed = false,
  "aria-label": ariaLabel,
}: HorizontalScrollerProps) {
  return (
    <div
      role="list"
      aria-label={ariaLabel}
      className={cn(
        "flex gap-3 overflow-x-auto overscroll-x-contain scroll-smooth pb-1",
        "snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        bleed && "-mx-4 scroll-px-4 px-4 sm:mx-0 sm:scroll-px-0 sm:px-0",
        className,
      )}
    >
      {children}
    </div>
  )
}
