import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { setReturnTo } from "./return-to"

export async function requireSession() {
  const session = await auth()
  if (session?.user) return

  const pathname = (await headers()).get("x-pathname")
  await setReturnTo(pathname) // no-ops / clears if "/" or invalid
  redirect("/sign-in")
}

export async function requireGuest() {
  const session = await auth()
  if (session?.user) redirect("/")
}