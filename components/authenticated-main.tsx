"use client"

import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

export function AuthenticatedMain({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isFeed = pathname === "/"

  return (
    <main
      className={cn(
        "flex w-full flex-1 flex-col min-h-0 overflow-y-auto py-8",
        isFeed && "scrollbar-visible",
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col min-h-0 px-4">
        {children}
      </div>
    </main>
  )
}
