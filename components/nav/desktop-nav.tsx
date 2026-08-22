"use client"

import { NavLinkItem } from "@/components/nav/nav-link-item"
import { NAV_LINKS, isNavActive } from "@/lib/nav/links"

type DesktopNavProps = {
  pathname: string
}

export function DesktopNav({ pathname }: DesktopNavProps) {
  return (
    <nav aria-label="Main" className="hidden flex-1 items-center justify-center md:flex">
      <div className="flex items-center gap-1">
        {NAV_LINKS.map((link) => (
          <NavLinkItem
            key={link.href}
            link={link}
            active={isNavActive(pathname, link.href)}
            layout="horizontal"
          />
        ))}
      </div>
    </nav>
  )
}
