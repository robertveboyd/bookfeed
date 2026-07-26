import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Library",
}

export default function Page(){
    return (
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Your library</h1>
          <p className="text-muted-foreground">
            Books you are interested in, reading, and have read.
          </p>
        </div>
      )
}