import { requireGuest } from "@/lib/auth/util/session"

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireGuest()

  return (
    <main className="flex min-h-full flex-1 flex-col">{children}</main>
  )
}