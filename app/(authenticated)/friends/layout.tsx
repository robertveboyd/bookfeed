import { Suspense, type ReactNode } from "react"

import { FriendsDirectory } from "@/components/friends/friends-directory"
import { FriendsDirectoryFallback } from "@/components/friends/friends-directory-fallback"

export default function FriendsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Friends</h1>
        <p className="text-muted-foreground text-sm">
          Find people by username and manage friend requests.
        </p>
      </div>

      {children}

      <Suspense fallback={<FriendsDirectoryFallback />}>
        <FriendsDirectory />
      </Suspense>
    </div>
  )
}
