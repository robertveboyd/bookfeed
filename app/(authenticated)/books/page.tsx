import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Catalog",
}

export default function Page(){
    return (
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Catalog</h1>
          <p className="text-muted-foreground">
            Search and browse books. Available to everyone.
          </p>
        </div>
      )
}