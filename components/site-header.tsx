"use client"

import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { isSignedIn } from "@/lib/auth-placeholder"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation";

const signedInLinks = [
  { href: "/", label: "Feed" },
  { href: "/books", label: "Catalog" },
  { href: "/library", label: "Library" },
  { href: "/profile", label: "Profile" },
]

const guestLinks = [{ href: "/books", label: "Catalog" }]

export default function SiteHeader() {
  const pathname = usePathname()  

  function isActive(href: string) {
    if (href === "/") return pathname === "/"
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const links = isSignedIn ? signedInLinks : guestLinks

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
        <Link
          href={isSignedIn ? "/" : "/sign-in"}
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

          {!isSignedIn && (
            <Link
              href="/sign-in"
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}