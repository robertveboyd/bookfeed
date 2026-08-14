import Link from "next/link"
import type { ReactNode } from "react"

import { BookCover } from "@/components/catalog/book-cover"
import { RelativeTime } from "@/components/feed/relative-time"
import { UserAvatar } from "@/components/profile/user-avatar"
import { StarRatingDisplay } from "@/components/reviews/star-rating"
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

export function ActivityPost({ item, footer, className }: ActivityPostProps) {
  const { actor, book, type } = item
  const profileHref = `/users/${actor.username}`
  const bookHref = `/books/${book.id}`
  const takeHref = `/users/${actor.username}/books/${book.id}`

  return (
    <div className={cn("flex gap-3", className)}>
      <Link
        href={profileHref}
        className="shrink-0 self-start touch-manipulation"
      >
        <UserAvatar
          userId={actor.id}
          username={actor.username}
          imageUrl={actor.image}
          size={40}
        />
      </Link>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <p className="min-w-0 text-sm leading-relaxed text-pretty">
            <Link
              href={profileHref}
              className="font-medium hover:underline underline-offset-4"
            >
              @{actor.username}
            </Link>{" "}
            {type === "started_reading" ? (
              <>
                started reading{" "}
                <Link
                  href={bookHref}
                  className="font-medium hover:underline underline-offset-4"
                >
                  {book.title}
                </Link>
              </>
            ) : null}
            {type === "finished_reading" ? (
              <>
                finished{" "}
                <Link
                  href={bookHref}
                  className="font-medium hover:underline underline-offset-4"
                >
                  {book.title}
                </Link>
              </>
            ) : null}
            {type === "rated" ? (
              <>
                rated{" "}
                <Link
                  href={takeHref}
                  className="font-medium hover:underline underline-offset-4"
                >
                  {book.title}
                </Link>
                {item.rating != null ? (
                  <span className="text-muted-foreground">
                    {" "}
                    · {item.rating}★
                  </span>
                ) : null}
              </>
            ) : null}
            {type === "reviewed" ? (
              <>
                reviewed{" "}
                <Link
                  href={takeHref}
                  className="font-medium hover:underline underline-offset-4"
                >
                  {book.title}
                </Link>
              </>
            ) : null}
          </p>
          <RelativeTime
            date={item.createdAt}
            className="text-muted-foreground mt-0.5 shrink-0 text-[11px] sm:text-xs"
          />
        </div>

        {type === "rated" && item.rating != null ? (
          <StarRatingDisplay rating={item.rating} />
        ) : null}

        {type === "reviewed" ? (
          <div className="space-y-2">
            {item.rating != null ? (
              <StarRatingDisplay rating={item.rating} />
            ) : null}
            {item.reviewBody ? (
              <p className="text-muted-foreground text-sm leading-relaxed">
                {excerptText(item.reviewBody, REVIEW_EXCERPT_MAX)}
              </p>
            ) : null}
            <Link
              href={takeHref}
              className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline"
            >
              View full take →
            </Link>
          </div>
        ) : null}

        <Link
          href={type === "rated" || type === "reviewed" ? takeHref : bookHref}
          className="relative mt-1 block aspect-[2/3] w-16 overflow-hidden rounded-md bg-muted shadow-sm sm:w-20"
        >
          <BookCover
            coverImageId={book.coverImageId}
            title={book.title}
            size="M"
          />
        </Link>

        {footer}
      </div>
    </div>
  )
}
