"use client"

import Link from "next/link"
import {
  useState,
  useTransition,
  type ReactNode,
} from "react"

import { BookCover } from "@/components/catalog/book-cover"
import { UserAvatar } from "@/components/profile/user-avatar"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { loadUserHoverPreview } from "@/lib/users/preview/actions"
import type { UserHoverPreview } from "@/lib/users/preview/types"
import { cn } from "@/lib/utils"

const previewCache = new Map<string, UserHoverPreview>()

type FriendHoverCardProps = {
  user: { id: string; username: string; image: string | null }
  className?: string
  children: ReactNode
}

function booksReadLabel(count: number) {
  return count === 1 ? "1 book read" : `${count} books read`
}

function PreviewBody({
  user,
  preview,
  pending,
}: {
  user: FriendHoverCardProps["user"]
  preview: UserHoverPreview | null
  pending: boolean
}) {
  const username = preview?.username ?? user.username
  const image = preview?.image ?? user.image
  const profileHref = `/users/${username}`

  return (
    <div className="space-y-3">
      <Link
        href={profileHref}
        className="flex items-center gap-3 hover:opacity-90"
      >
        <UserAvatar
          userId={user.id}
          username={username}
          imageUrl={image}
          size={56}
        />
        <div className="min-w-0">
          <p className="truncate font-medium">@{username}</p>
          {preview ? (
            <p className="text-muted-foreground text-xs tabular-nums">
              {booksReadLabel(preview.booksRead)}
            </p>
          ) : pending ? (
            <p className="bg-muted mt-1 h-3 w-20 animate-pulse rounded" />
          ) : null}
        </div>
      </Link>

      {preview?.reading ? (
        <Link
          href={`/books/${preview.reading.bookId}`}
          className="flex gap-2.5 rounded-md hover:bg-muted/60 -mx-1 px-1 py-1"
        >
          <span className="relative block aspect-[2/3] w-9 shrink-0 overflow-hidden rounded-sm bg-muted shadow-sm">
            <BookCover
              coverImageId={preview.reading.coverImageId}
              title={preview.reading.title}
              size="S"
            />
          </span>
          <span className="min-w-0 self-center">
            <span className="text-muted-foreground block text-[11px]">
              Currently reading
            </span>
            <span className="line-clamp-2 text-sm font-medium leading-snug">
              {preview.reading.title}
            </span>
          </span>
        </Link>
      ) : pending && !preview ? (
        <div className="flex gap-2.5 py-1">
          <div className="bg-muted aspect-[2/3] w-9 shrink-0 animate-pulse rounded-sm" />
          <div className="min-w-0 flex-1 space-y-1.5 self-center">
            <div className="bg-muted h-2.5 w-24 animate-pulse rounded" />
            <div className="bg-muted h-3 w-36 animate-pulse rounded" />
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function FriendHoverCard({
  user,
  className,
  children,
}: FriendHoverCardProps) {
  const [preview, setPreview] = useState<UserHoverPreview | null>(
    () => previewCache.get(user.id) ?? null,
  )
  const [pending, startTransition] = useTransition()

  function onOpenChange(open: boolean) {
    if (!open) return
    const cached = previewCache.get(user.id)
    if (cached) {
      setPreview(cached)
      return
    }
    startTransition(async () => {
      const result = await loadUserHoverPreview({ userId: user.id })
      if (!result.ok) return
      previewCache.set(user.id, result.preview)
      setPreview(result.preview)
    })
  }

  return (
    <HoverCard onOpenChange={onOpenChange}>
      <HoverCardTrigger
        delay={400}
        closeDelay={200}
        render={
          <Link
            href={`/users/${user.username}`}
            className={cn("touch-manipulation", className)}
          />
        }
      >
        {children}
      </HoverCardTrigger>
      <HoverCardContent
        align="start"
        sideOffset={8}
        className="w-72 p-3"
      >
        <PreviewBody user={user} preview={preview} pending={pending} />
      </HoverCardContent>
    </HoverCard>
  )
}
