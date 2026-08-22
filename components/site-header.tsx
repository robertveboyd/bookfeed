"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { UserMenu, type HeaderUser } from "@/components/auth/user-menu"
import { BrandMark } from "@/components/brand-mark"
import { DesktopNav } from "@/components/nav/desktop-nav"
import { HeaderUtilityCluster } from "@/components/nav/header-utility-cluster"
import { MobileNav } from "@/components/mobile-nav"
import { NotificationsMenu } from "@/components/notifications/notifications-menu"
import { ThemeToggle } from "@/components/theme-toggle"

export default function SiteHeader({
  user,
  unreadNotificationCount,
}: {
  user: HeaderUser
  unreadNotificationCount: number
}) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
        <Link
          href="/"
          className="inline-flex shrink-0 items-center gap-2 font-semibold tracking-tight text-foreground"
        >
          <BrandMark />
          <span className="hidden sm:inline">Bookfeed</span>
        </Link>

        <DesktopNav pathname={pathname} />

        <div className="hidden items-center gap-2 md:ml-auto md:flex">
          <HeaderUtilityCluster>
            <ThemeToggle />
            <NotificationsMenu initialUnreadCount={unreadNotificationCount} />
          </HeaderUtilityCluster>
          <UserMenu user={user} />
        </div>

        <MobileNav
          user={user}
          pathname={pathname}
          unreadNotificationCount={unreadNotificationCount}
        />
      </div>
    </header>
  )
}
