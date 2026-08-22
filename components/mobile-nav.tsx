"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import {
  BookOpenIcon,
  LibraryIcon,
  LogOutIcon,
  MenuIcon,
  NewspaperIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react"

import { type HeaderUser } from "@/components/auth/user-menu"
import { NotificationsMenu } from "@/components/notifications/notifications-menu"
import { UserAvatar } from "@/components/profile/user-avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { signOutAction } from "@/lib/auth/actions/sign-out"
import { cn } from "@/lib/utils"

import type { LucideIcon } from "lucide-react"

type NavLink = { href: string; label: string }

const navIcons: Record<string, LucideIcon> = {
  "/": NewspaperIcon,
  "/books": BookOpenIcon,
  "/library": LibraryIcon,
  "/friends": UsersIcon,
}

type MobileNavProps = {
  user: HeaderUser
  links: NavLink[]
  isActive: (href: string) => boolean
  unreadNotificationCount: number
}

export function MobileNav({
  user,
  links,
  isActive,
  unreadNotificationCount,
}: MobileNavProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <div className="flex items-center gap-1 md:hidden">
      <NotificationsMenu initialUnreadCount={unreadNotificationCount} />
      <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 md:hidden"
            aria-label="Open menu"
          />
        }
      >
        <MenuIcon />
      </SheetTrigger>
      <SheetContent side="right" className="w-72 gap-0 p-0">
        <SheetHeader className="border-b border-border pr-12">
          <SheetTitle className="flex items-center gap-2.5">
            <UserAvatar
              userId={user.id}
              username={user.username}
              imageUrl={user.image}
              size={32}
            />
            <span className="truncate font-medium">@{user.username}</span>
          </SheetTitle>
        </SheetHeader>

        <nav aria-label="Main" className="flex flex-col p-2">
          {links.map(({ href, label }) => {
            const Icon = navIcons[href]
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium",
                  isActive(href)
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                {Icon ? <Icon className="size-4" /> : null}
                {label}
              </Link>
            )
          })}
        </nav>

        <Separator />

        <div className="flex flex-col p-2">
          <Link
            href="/settings"
            aria-current={pathname === "/settings" ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium",
              pathname === "/settings"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            <SettingsIcon className="size-4" />
            Settings
          </Link>

          <ThemeToggle layout="item" />
        </div>

        <Separator />

        <div className="p-2">
          <Button
            type="button"
            variant="ghost"
            disabled={pending}
            className="h-auto w-full justify-start gap-2.5 px-3 py-2.5 font-medium"
            onClick={() => {
              startTransition(async () => {
                await signOutAction()
              })
            }}
          >
            <LogOutIcon className="size-4" />
            {pending ? "Signing out…" : "Sign out"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
    </div>
  )
}
