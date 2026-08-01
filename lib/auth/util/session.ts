import { headers } from "next/headers"
import { redirect } from "next/navigation"
import type { Session } from "next-auth"

import { auth } from "@/lib/auth"
import { setReturnTo } from "./return-to"

export type AuthenticatedSession = Session & {
  user: NonNullable<Session["user"]> & {
    id: string
    username: string
  }
}

export async function requireSession(): Promise<AuthenticatedSession> {
  const session = await auth()
  if (session?.user?.id) {
    return session as AuthenticatedSession
  }

  const pathname = (await headers()).get("x-pathname")
  await setReturnTo(pathname) // no-ops / clears if "/" or invalid
  redirect("/sign-in")
}

export async function requireGuest() {
  const session = await auth()
  if (session?.user) redirect("/")
}
