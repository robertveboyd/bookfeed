"use client"

import Link from "next/link"

import type { NavLink } from "@/lib/nav/links"
import { cn } from "@/lib/utils"

type NavLinkItemProps = {
  link: NavLink
  active: boolean
  layout?: "horizontal" | "vertical"
  iconOnly?: boolean
  onClick?: () => void
}

export function NavLinkItem({
  link,
  active,
  layout = "horizontal",
  iconOnly = false,
  onClick,
}: NavLinkItemProps) {
  const { href, label, Icon } = link
  const showIconOnly = layout === "horizontal" && iconOnly

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      title={showIconOnly ? label : undefined}
      className={cn(
        "inline-flex items-center font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        showIconOnly
          ? "size-8 shrink-0 justify-center rounded-md focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          : layout === "horizontal"
            ? "gap-1.5 rounded-md px-2.5 py-1.5 text-sm focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            : "w-full gap-2.5 rounded-lg px-3 py-2.5 text-sm focus-visible:ring-offset-2",
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      {showIconOnly ? null : <span>{label}</span>}
    </Link>
  )
}
