import { requireGuest } from "@/lib/auth/util/session"

export default async function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    await requireGuest()
    return children
}