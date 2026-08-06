import type { Metadata } from "next"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"

import { AvatarSettings } from "@/components/profile/avatar-settings"
import { requireSession } from "@/lib/auth/util/session"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"

export const metadata: Metadata = {
  title: "Profile",
}

export default async function Page() {
  const session = await requireSession()

  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
      image: users.image,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  if (!user) notFound()

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">@{user.username}</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-medium tracking-tight">Profile picture</h2>
        <AvatarSettings
          userId={user.id}
          username={user.username}
          imageUrl={user.image}
        />
      </section>
    </div>
  )
}
