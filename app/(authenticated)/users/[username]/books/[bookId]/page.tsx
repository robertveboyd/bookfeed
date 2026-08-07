import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { BookCover } from "@/components/catalog/book-cover"
import { StarRatingDisplay } from "@/components/reviews/star-rating"
import { UserAvatar } from "@/components/profile/user-avatar"
import { requireSession } from "@/lib/auth/util/session"
import { getBookById } from "@/lib/books/queries"
import { getFriendshipRelation, getUserByUsername } from "@/lib/friends/queries"
import { getLibraryEntry } from "@/lib/library/queries"
import { getUserBookReview } from "@/lib/reviews/queries"
import type { LibraryStatus } from "@/lib/library/types"

type PageProps = {
  params: Promise<{ username: string; bookId: string }>
}

const STATUS_LABEL: Record<LibraryStatus, string> = {
  interested: "Interested",
  reading: "Currently reading",
  read: "Read",
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username, bookId } = await params
  const [user, book] = await Promise.all([
    getUserByUsername(username),
    getBookById(bookId),
  ])

  if (!user || !book) return { title: "Review" }

  return {
    title: `${book.title} · @${user.username}`,
  }
}

export default async function Page({ params }: PageProps) {
  const session = await requireSession()
  const { username, bookId } = await params

  const user = await getUserByUsername(username)
  if (!user) notFound()

  const { relation } = await getFriendshipRelation(session.user.id, user.id)
  if (relation !== "self" && relation !== "friends") {
    notFound()
  }

  const [book, review, entry] = await Promise.all([
    getBookById(bookId),
    getUserBookReview(user.id, bookId),
    getLibraryEntry(user.id, bookId),
  ])

  if (!book) notFound()

  const authorsLabel = book.authors.join(", ")
  const isOwn = relation === "self"

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <p>
        <Link
          href={`/users/${user.username}`}
          className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
        >
          ← Back to @{user.username}
        </Link>
      </p>

      <div className="flex items-center gap-3">
        <UserAvatar
          userId={user.id}
          username={user.username}
          imageUrl={user.image}
          size={40}
        />
        <div>
          <p className="font-medium">@{user.username}</p>
          <p className="text-muted-foreground text-sm">
            {isOwn ? "Your take" : "Friend’s take"}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <Link
          href={`/books/${book.id}`}
          className="relative mx-auto aspect-[2/3] w-36 shrink-0 overflow-hidden rounded-md bg-muted shadow-sm sm:mx-0"
        >
          <BookCover
            coverImageId={book.coverImageId}
            title={book.title}
            size="M"
          />
        </Link>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-balance">
              <Link
                href={`/books/${book.id}`}
                className="hover:underline underline-offset-4"
              >
                {book.title}
              </Link>
            </h1>
            {authorsLabel ? (
              <p className="text-muted-foreground text-sm">{authorsLabel}</p>
            ) : null}
            {entry ? (
              <p className="text-muted-foreground text-sm">
                Status:{" "}
                <span className="text-foreground font-medium">
                  {STATUS_LABEL[entry.status]}
                </span>
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">
                Not in their library.
              </p>
            )}
          </div>

          {review ? (
            <div className="space-y-3">
              <StarRatingDisplay rating={review.rating} size="md" />
              {review.body ? (
                <p className="text-sm leading-relaxed text-pretty whitespace-pre-wrap">
                  {review.body}
                </p>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Rated without a written review.
                </p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              {isOwn
                ? "You haven’t rated this book yet."
                : "They haven’t rated this book yet."}
            </p>
          )}

          {isOwn ? (
            <p>
              <Link
                href={`/books/${book.id}`}
                className="text-sm font-medium underline-offset-4 hover:underline"
              >
                Edit your rating on the book page →
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
