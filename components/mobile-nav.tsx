"use client"

import Link from "next/link"
import { useEffect, useState, useTransition } from "react"
import { LogOutIcon, MenuIcon, SettingsIcon } from "lucide-react"

import { type HeaderUser } from "@/components/auth/user-menu"
import { HeaderIconButton } from "@/components/nav/header-icon-button"
import { HeaderUtilityCluster } from "@/components/nav/header-utility-cluster"
import { NavLinkItem } from "@/components/nav/nav-link-item"
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
import { NAV_LINKS, isNavActive } from "@/lib/nav/links"
import { cn } from "@/lib/utils"

type MobileNavProps = {
  user: HeaderUser
  pathname: string
  unreadNotificationCount: number
}

export function MobileNav({
  user,
  pathname,
  unreadNotificationCount,
}: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <div className="ml-auto flex items-center gap-2 md:hidden">
      <HeaderUtilityCluster>
        <NotificationsMenu initialUnreadCount={unreadNotificationCount} />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <HeaderIconButton aria-label="Open menu" className="md:hidden" />
            }
          >
            <MenuIcon className="size-4" />
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

            <nav aria-label="Main" className="flex flex-col gap-0.5 p-2">
              {NAV_LINKS.map((link) => (
                <NavLinkItem
                  key={link.href}
                  link={link}
                  active={isNavActive(pathname, link.href)}
                  layout="vertical"
                  onClick={() => setOpen(false)}
                />
              ))}
            </nav>

            <Separator />

            <div className="flex flex-col gap-0.5 p-2">
              <Link
                href="/settings"
                aria-current={pathname === "/settings" ? "page" : undefined}
                className={cn(
                  "inline-flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                  pathname === "/settings"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
                onClick={() => setOpen(false)}
              >
                <SettingsIcon className="size-4 shrink-0" aria-hidden />
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
      </HeaderUtilityCluster>
    </div>
  )
}
