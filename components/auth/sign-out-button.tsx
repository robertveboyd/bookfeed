"use client"

import { Button } from "@/components/ui/button"
import { signOutAction } from "@/lib/auth/actions/sign-out"

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <Button type="submit" variant="outline" size="lg">
        Sign out
      </Button>
    </form>
  )
}