import {
  BookOpenIcon,
  LibraryIcon,
  NewspaperIcon,
  UsersIcon,
} from "lucide-react"

import type { LucideIcon } from "lucide-react"

export type NavLink = {
  href: string
  label: string
  Icon: LucideIcon
}

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Feed", Icon: NewspaperIcon },
  { href: "/books", label: "Catalog", Icon: BookOpenIcon },
  { href: "/library", label: "Library", Icon: LibraryIcon },
  { href: "/friends", label: "Friends", Icon: UsersIcon },
]

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}
