import { requireSession } from "@/lib/auth/util/session";

export default async function Layout({
    children
} : {
    children: React.ReactNode
}) {
    await requireSession();
    return children;
}