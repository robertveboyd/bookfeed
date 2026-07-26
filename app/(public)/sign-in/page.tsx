import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Sign in",
}

export default function Page() {
  return (
    <div className="mx-auto max-w-sm space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Sign in to Bookfeed
        </h1>
        <p className="text-muted-foreground">
          Email and password sign-in is coming in a later phase.
        </p>
      </div>
      <p className="text-sm text-muted-foreground">
        Meanwhile, you can{" "}
        <Link href="/books" className="font-medium text-primary hover:underline">
          browse the catalog
        </Link>
        .
      </p>
    </div>
  )
}