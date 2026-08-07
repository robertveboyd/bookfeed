import { eq } from "drizzle-orm"

import SiteHeader from "@/components/site-header"
import { requireSession } from "@/lib/auth/util/session"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
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

  const headerUser = user ?? {
    id: session.user.id,
    username: session.user.username,
    image: session.user.image ?? null,
  }

  return (
    <>
      <SiteHeader user={headerUser} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        {children}
      </main>
    </>
  )
}
