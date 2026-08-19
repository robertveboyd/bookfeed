"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { BrandMark } from "@/components/brand-mark"
import { UserMenu, type HeaderUser } from "@/components/auth/user-menu"
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

export default function SiteHeader({ user }: { user: HeaderUser }) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === "/") return pathname === "/"
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-semibold tracking-tight text-foreground"
        >
          <BrandMark />
          Bookfeed
        </Link>

        <div className="flex items-center gap-3">
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

          <UserMenu user={user} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
