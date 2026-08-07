"use client"

import Link from "next/link"
import { useTransition } from "react"
import { LogOut, User } from "lucide-react"

import { UserAvatar } from "@/components/profile/user-avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOutAction } from "@/lib/auth/actions/sign-out"

export type HeaderUser = {
  id: string
  username: string
  image: string | null
}

export function UserMenu({ user }: { user: HeaderUser }) {
  const [pending, startTransition] = useTransition()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        aria-label="Account menu"
      >
        <UserAvatar
          userId={user.id}
          username={user.username}
          imageUrl={user.image}
          size={32}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuItem render={<Link href="/profile" />} className="gap-2.5">
          <User />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2.5"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              await signOutAction()
            })
          }}
        >
          <LogOut />
          {pending ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
