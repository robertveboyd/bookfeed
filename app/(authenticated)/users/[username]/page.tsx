import { eq } from "drizzle-orm"
import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import { UserProfileView } from "@/components/users/user-profile-view"
import { authorsForBookIds } from "@/lib/books/queries"
import { isGenre } from "@/lib/books/types"
import { requireSession } from "@/lib/auth/util/session"
import { db } from "@/lib/db"
import { books } from "@/lib/db/schema"
import {
  getFriendshipRelation,
  getUserByUsername,
} from "@/lib/friends/queries"
import { getCurrentlyReading, listLibrary } from "@/lib/library/queries"
import type { LibraryEntryTile } from "@/lib/library/types"
import { listTopBooks } from "@/lib/users/top-books/queries"

type PageProps = {
  params: Promise<{ username: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params
  if (username.trim().toLowerCase() === "you") {
    return { title: "Settings" }
  }
  const user = await getUserByUsername(username)
  return {
    title: user ? `@${user.username}` : "User",
  }
}

async function getReadingTile(
  userId: string,
): Promise<LibraryEntryTile | null> {
  const entry = await getCurrentlyReading(userId)
  if (!entry) return null

  const [book] = await db
    .select({
      id: books.id,
      title: books.title,
      coverImageId: books.coverImageId,
      genre: books.genre,
      description: books.description,
      publishYear: books.publishYear,
    })
    .from(books)
    .where(eq(books.id, entry.bookId))
    .limit(1)

  if (!book) return null

  const authorMap = await authorsForBookIds([book.id])

  return {
    id: entry.id,
    bookId: entry.bookId,
    status: entry.status,
    updatedAt: entry.updatedAt,
    book: {
      id: book.id,
      title: book.title,
      coverImageId: book.coverImageId,
      genre: isGenre(book.genre) ? book.genre : null,
      authors: authorMap.get(book.id) ?? [],
      description: book.description,
      publishYear: book.publishYear,
    },
    rating: null,
  }
}

export default async function Page({ params }: PageProps) {
  const session = await requireSession()
  const { username } = await params

  // Product alias: /users/you always means "my profile".
  if (username.trim().toLowerCase() === "you") {
    redirect("/settings")
  }

  const user = await getUserByUsername(username)
  if (!user) notFound()

  if (user.id === session.user.id) {
    redirect("/settings")
  }

  const { relation, friendship } = await getFriendshipRelation(
    session.user.id,
    user.id,
  )

  if (relation === "self") {
    redirect("/settings")
  }

  const isFriend = relation === "friends"

  if (isFriend) {
    const [lists, topBooks] = await Promise.all([
      listLibrary(user.id),
      listTopBooks(user.id),
    ])

    return (
      <UserProfileView
        user={user}
        relation={relation}
        friendshipId={friendship?.id ?? null}
        mode="friend"
        lists={lists}
        topBooks={topBooks}
      />
    )
  }

  const reading = await getReadingTile(user.id)

  return (
    <UserProfileView
      user={user}
      relation={relation}
      friendshipId={friendship?.id ?? null}
      mode="limited"
      lists={{ reading }}
      topBooks={[]}
    />
  )
}
