import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Feed",
  }

export default function Page(){
    return (
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Feed</h1>
          <p className="text-muted-foreground">
            Activity from friends will appear here.
          </p>
        </div>
      )
}