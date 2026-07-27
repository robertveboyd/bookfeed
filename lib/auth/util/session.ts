import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { signInHref } from "@/lib/auth/util/callback-url"

export async function requireSession() {
  const session = await auth()

  // Has a user → OK, stay on the protected page
  if (session?.user) return
  
  // No user → bounce to sign-in (with callback when we know the path)
  const pathname = (await headers()).get("x-pathname")
  redirect(signInHref(pathname))
}

export async function requireGuest() {
    const session = await auth()
    if (session?.user) redirect("/")
  }