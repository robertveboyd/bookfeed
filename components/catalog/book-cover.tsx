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
        className={cn("absolute inset-0 bg-red-600", className)}
      />
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
