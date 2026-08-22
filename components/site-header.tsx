"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { UserMenu, type HeaderUser } from "@/components/auth/user-menu"
import { BrandMark } from "@/components/brand-mark"
import { MobileNav } from "@/components/mobile-nav"
import { NotificationsMenu } from "@/components/notifications/notifications-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

const links = [
  { href: "/", label: "Feed" },
  { href: "/books", label: "Catalog" },
  { href: "/library", label: "Library" },
  { href: "/friends", label: "Friends" },
]

export default function SiteHeader({
  user,
  unreadNotificationCount,
}: {
  user: HeaderUser
  unreadNotificationCount: number
}) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === "/") return pathname === "/"
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-semibold tracking-tight text-foreground"
        >
          <BrandMark />
          Bookfeed
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <NavigationMenu aria-label="Main">
            <NavigationMenuList>
              {links.map(({ href, label }) => (
                <NavigationMenuItem key={href}>
                  <NavigationMenuLink
                    render={<Link href={href} />}
                    className={navigationMenuTriggerStyle()}
                    active={isActive(href)}
                    aria-current={isActive(href) ? "page" : undefined}
                  >
                    {label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <ThemeToggle />
          <NotificationsMenu initialUnreadCount={unreadNotificationCount} />
          <UserMenu user={user} />
        </div>

        <MobileNav
          user={user}
          links={links}
          isActive={isActive}
          unreadNotificationCount={unreadNotificationCount}
        />
      </div>
    </header>
  )
}
