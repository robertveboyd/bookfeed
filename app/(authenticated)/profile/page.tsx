import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Profile",
}

export default function Page(){
    return (
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Currently reading, favorites, and reading history.
          </p>
        </div>
      )
}