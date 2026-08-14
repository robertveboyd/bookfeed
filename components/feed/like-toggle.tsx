"use client"

import { ThumbsUpIcon } from "lucide-react"
import { useEffect, useState, useTransition } from "react"

import { cn } from "@/lib/utils"

type LikeToggleProps = {
  liked: boolean
  likeCount: number
  disabled?: boolean
  compact?: boolean
  onToggle: () => Promise<{ ok: true; liked: boolean; likeCount: number } | { ok: false; message: string }>
  onChange?: (next: { liked: boolean; likeCount: number }) => void
}

function likesLabel(count: number, liked: boolean) {
  const noun = count === 1 ? "like" : "likes"
  return liked ? `Unlike. ${count} ${noun}` : `Like. ${count} ${noun}`
}

export function LikeToggle({
  liked: likedProp,
  likeCount,
  disabled = false,
  compact = false,
  onToggle,
  onChange,
}: LikeToggleProps) {
  const [liked, setLiked] = useState(likedProp)
  const [likes, setLikes] = useState(likeCount)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    setLiked(likedProp)
    setLikes(likeCount)
  }, [likedProp, likeCount])

  function onClick() {
    if (pending || disabled) return

    const previous = { liked, likes }
    const nextLiked = !liked
    const nextCount = Math.max(0, likes + (nextLiked ? 1 : -1))
    setLiked(nextLiked)
    setLikes(nextCount)
    setError(null)
    onChange?.({ liked: nextLiked, likeCount: nextCount })

    startTransition(async () => {
      const result = await onToggle()
      if (!result.ok) {
        setLiked(previous.liked)
        setLikes(previous.likes)
        onChange?.({
          liked: previous.liked,
          likeCount: previous.likes,
        })
        setError(result.message)
        return
      }
      setLiked(result.liked)
      setLikes(result.likeCount)
      onChange?.({ liked: result.liked, likeCount: result.likeCount })
    })
  }

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-pressed={liked}
        aria-busy={pending}
        aria-label={likesLabel(likes, liked)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md text-sm touch-manipulation",
          "hover:bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring",
          compact
            ? "min-h-9 px-1.5"
            : "min-h-10 px-2.5 sm:min-h-9 sm:px-2",
          liked
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <ThumbsUpIcon
          className={cn("size-4", liked && "fill-current")}
          aria-hidden
        />
        <span className="tabular-nums text-xs font-medium" aria-hidden>
          {likes}
        </span>
      </button>
      {error ? (
        <p className="text-destructive px-1.5 pt-0.5 text-xs" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
