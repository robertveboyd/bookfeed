"use client"

import Image from "next/image"
import { useState } from "react"

import { coverUrl, type CoverSize } from "@/lib/books/cover"
import { cn } from "@/lib/utils"

type BookCoverProps = {
  coverImageId: string
  title: string
  size?: CoverSize
  className?: string
}

function coverInitials(title: string): string {
  const words = title
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
  if (words.length === 0) return "?"
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase()
  return `${words[0]![0] ?? ""}${words[1]![0] ?? ""}`.toUpperCase()
}

export function BookCover({
  coverImageId,
  title,
  size = "M",
  className,
}: BookCoverProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        role="img"
        aria-label={title}
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-muted px-2 text-center",
          className,
        )}
      >
        <span className="text-lg font-semibold tracking-wide text-muted-foreground/80">
          {coverInitials(title)}
        </span>
      </div>
    )
  }

  return (
    <Image
      src={coverUrl(coverImageId, size)}
      alt={`Cover of ${title}`}
      fill
      sizes="(max-width: 640px) 28vw, 160px"
      className={cn("object-cover", className)}
      onError={() => setFailed(true)}
    />
  )
}
