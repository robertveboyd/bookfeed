import Link from "next/link"
import type { ReactNode } from "react"

import { BookCover } from "@/components/catalog/book-cover"
import { RelativeTime } from "@/components/feed/relative-time"
import { UserAvatar } from "@/components/profile/user-avatar"
import { StarRatingDisplay } from "@/components/reviews/star-rating"
import { FriendHoverCard } from "@/components/users/friend-hover-card"
import { excerptText } from "@/lib/activity/format"
import {
  REVIEW_EXCERPT_MAX,
  type FeedActivityItem,
} from "@/lib/activity/types"
import { cn } from "@/lib/utils"

type ActivityPostProps = {
  item: FeedActivityItem
  footer?: ReactNode
  className?: string
}

function activityVerb(type: FeedActivityItem["type"]) {
  switch (type) {
    case "started_reading":
      return "started reading"
    case "finished_reading":
      return "finished"
    case "rated":
      return "rated"
    case "reviewed":
      return "reviewed"
  }
}

export function ActivityPost({ item, footer, className }: ActivityPostProps) {
  const { actor, book, type } = item
  const bookHref = `/books/${book.id}`
  const takeHref = `/users/${actor.username}/books/${book.id}`
  const mediaHref = type === "rated" || type === "reviewed" ? takeHref : bookHref
  const authorsLabel = book.authors.join(", ")

  return (
    <div className={cn("flex items-stretch gap-3 sm:gap-4", className)}>
      <Link
        href={mediaHref}
        className="relative aspect-[2/3] w-[4.5rem] shrink-0 overflow-hidden rounded-md bg-muted shadow-sm ring-1 ring-foreground/10 sm:w-24"
      >
        <BookCover
          coverImageId={book.coverImageId}
          title={book.title}
          size="M"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <FriendHoverCard
            user={actor}
            className="shrink-0"
          >
            <UserAvatar
              userId={actor.id}
              username={actor.username}
              imageUrl={actor.image}
              size={28}
            />
          </FriendHoverCard>
          <p className="min-w-0 flex-1 truncate text-sm">
            <FriendHoverCard
              user={actor}
              className="font-medium hover:underline underline-offset-4"
            >
              @{actor.username}
            </FriendHoverCard>{" "}
            <span className="text-muted-foreground">{activityVerb(type)}</span>
          </p>
          <RelativeTime
            date={item.createdAt}
            className="text-muted-foreground shrink-0 text-[11px] sm:text-xs"
          />
        </div>

        <div className="min-w-0 space-y-1">
          <h3 className="text-base font-semibold tracking-tight text-balance">
            <Link
              href={mediaHref}
              className="hover:underline underline-offset-4"
            >
              {book.title}
            </Link>
          </h3>
          {authorsLabel ? (
            <p className="text-muted-foreground truncate text-sm">
              {authorsLabel}
            </p>
          ) : null}
          {(type === "rated" || type === "reviewed") && item.rating != null ? (
            <StarRatingDisplay rating={item.rating} />
          ) : null}
        </div>

        {type === "reviewed" && item.reviewBody ? (
          <p className="text-muted-foreground text-sm leading-relaxed">
            {excerptText(item.reviewBody, REVIEW_EXCERPT_MAX)}
          </p>
        ) : null}

        {footer ? <div className="mt-auto pt-1">{footer}</div> : null}
      </div>
    </div>
  )
}
