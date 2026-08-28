import { Suspense, type ReactNode } from "react"

import { FriendsDirectory } from "@/components/friends/friends-directory"
import { FriendsDirectoryFallback } from "@/components/friends/friends-directory-fallback"

export default function FriendsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Friends</h1>
        <p className="text-muted-foreground text-sm">
          See what your friends are reading, and find more people to follow.
        </p>
      </div>

      {children}

      <Suspense fallback={<FriendsDirectoryFallback />}>
        <FriendsDirectory />
      </Suspense>
    </div>
  )
}
