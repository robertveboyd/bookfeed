import { eq } from "drizzle-orm"

import SiteHeader from "@/components/site-header"
import { AuthenticatedMain } from "@/components/authenticated-main"
import { requireSession } from "@/lib/auth/util/session"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { countUnreadNotifications } from "@/lib/notifications/queries"

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireSession()

  const [user, unreadNotificationCount] = await Promise.all([
    db
      .select({
        id: users.id,
        username: users.username,
        image: users.image,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)
      .then((rows) => rows[0]),
    countUnreadNotifications(session.user.id),
  ])

  const headerUser = user ?? {
    id: session.user.id,
    username: session.user.username,
    image: session.user.image ?? null,
  }

  return (
    <>
      <SiteHeader
        user={headerUser}
        unreadNotificationCount={unreadNotificationCount}
      />
      <AuthenticatedMain>{children}</AuthenticatedMain>
    </>
  )
}
