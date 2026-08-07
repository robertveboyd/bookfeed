"use client"

import { StarIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type StarRatingInputProps = {
  value: number
  onChange: (rating: number) => void
  disabled?: boolean
  size?: "sm" | "md"
}

export function StarRatingInput({
  value,
  onChange,
  disabled = false,
  size = "md",
}: StarRatingInputProps) {
  const iconClass = size === "sm" ? "size-4" : "size-5"

  return (
    <div
      className="flex items-center gap-0.5"
      role="radiogroup"
      aria-label="Rating"
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const active = n <= value
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
            disabled={disabled}
            className={cn(
              "rounded p-0.5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
              active
                ? "text-foreground"
                : "text-muted-foreground/40 hover:text-muted-foreground",
            )}
            onClick={() => onChange(n)}
          >
            <StarIcon
              className={cn(iconClass, active && "fill-current")}
              aria-hidden
            />
          </button>
        )
      })}
    </div>
  )
}

type StarRatingDisplayProps = {
  rating: number
  size?: "sm" | "md"
  className?: string
}

export function StarRatingDisplay({
  rating,
  size = "sm",
  className,
}: StarRatingDisplayProps) {
  const iconClass = size === "sm" ? "size-3.5" : "size-4"

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const active = n <= rating
        return (
          <StarIcon
            key={n}
            className={cn(
              iconClass,
              active
                ? "fill-current text-foreground"
                : "text-muted-foreground/35",
            )}
            aria-hidden
          />
        )
      })}
    </div>
  )
}
