import SiteHeader from "@/components/site-header"
import { requireSession } from "@/lib/auth/util/session"

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireSession()

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        {children}
      </main>
    </>
  )
}
