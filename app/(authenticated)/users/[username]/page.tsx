import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import { FriendshipActions } from "@/components/friends/friendship-actions"
import { UserAvatar } from "@/components/profile/user-avatar"
import { requireSession } from "@/lib/auth/util/session"
import {
  getFriendshipRelation,
  getUserByUsername,
} from "@/lib/friends/queries"

type PageProps = {
  params: Promise<{ username: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params
  const user = await getUserByUsername(username)
  return {
    title: user ? `@${user.username}` : "User",
  }
}

export default async function Page({ params }: PageProps) {
  const session = await requireSession()
  const { username } = await params

  const user = await getUserByUsername(username)
  if (!user) notFound()

  if (user.id === session.user.id) {
    redirect("/profile")
  }

  const { relation, friendship } = await getFriendshipRelation(
    session.user.id,
    user.id,
  )

  if (relation === "self") {
    redirect("/profile")
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <UserAvatar
            userId={user.id}
            username={user.username}
            imageUrl={user.image}
            size={80}
          />
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              @{user.username}
            </h1>
            <p className="text-muted-foreground text-sm">
              {relation === "friends"
                ? "You’re friends. Library coming soon."
                : "Add them as a friend to see more."}
            </p>
          </div>
        </div>

        <FriendshipActions
          userId={user.id}
          username={user.username}
          relation={relation}
          friendshipId={friendship?.id ?? null}
          size="default"
        />
      </div>
    </div>
  )
}
