"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { LogOutIcon, MenuIcon, UserIcon } from "lucide-react"

import { type HeaderUser } from "@/components/auth/user-menu"
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

type NavLink = { href: string; label: string }

type MobileNavProps = {
  user: HeaderUser
  links: NavLink[]
  isActive: (href: string) => boolean
}

export function MobileNav({ user, links, isActive }: MobileNavProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
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
        <SheetHeader className="border-b border-border">
          <SheetTitle>Menu</SheetTitle>
          <p className="text-muted-foreground text-sm">@{user.username}</p>
        </SheetHeader>

        <nav aria-label="Main" className="flex flex-col p-2">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={cn(
                "rounded-lg px-3 py-2.5 text-sm font-medium",
                isActive(href)
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <Separator />

        <div className="flex flex-col p-2">
          <Link
            href="/profile"
            aria-current={pathname === "/profile" ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium",
              pathname === "/profile"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            <UserIcon className="size-4" />
            Profile
          </Link>

          <div className="flex items-center justify-between gap-3 rounded-lg px-3 py-1.5">
            <span className="text-muted-foreground text-sm font-medium">
              Appearance
            </span>
            <ThemeToggle />
          </div>
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
  )
}
