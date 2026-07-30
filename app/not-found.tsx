import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Page not found",
}

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-16 text-center">
      <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
        404
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        Page not found
      </h1>
      <p className="text-muted-foreground mt-2 text-sm text-pretty">
        That page doesn’t exist or the book couldn’t be found.
      </p>
    </main>
  )
}
