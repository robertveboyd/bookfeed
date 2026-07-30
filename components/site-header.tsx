"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { ThemeToggle } from "@/components/theme-toggle"

const links = [
  { href: "/", label: "Feed" },
  { href: "/books", label: "Catalog" },
  { href: "/library", label: "Library" },
  { href: "/profile", label: "Profile" },
]

export default function SiteHeader() {
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
          className="font-semibold tracking-tight text-foreground"
        >
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

          <SignOutButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
