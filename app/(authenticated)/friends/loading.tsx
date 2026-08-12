export default function Loading() {
  return (
    <div
      className="mx-auto max-w-2xl space-y-10"
      aria-busy="true"
      aria-label="Loading friends"
    >
      <div className="space-y-2">
        <div className="bg-muted h-8 w-28 animate-pulse rounded" />
        <div className="bg-muted h-4 w-72 max-w-full animate-pulse rounded" />
      </div>

      <section className="space-y-4">
        <div className="bg-muted h-6 w-28 animate-pulse rounded" />
        <div className="bg-muted h-8 w-full max-w-xl animate-pulse rounded-lg" />
      </section>

      {["Incoming", "Sent", "Friends"].map((section) => (
        <section key={section} className="space-y-4">
          <div className="bg-muted h-6 w-40 animate-pulse rounded" />
          <ul className="divide-y divide-border">
            {Array.from({ length: 3 }).map((_, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="bg-muted size-10 animate-pulse rounded-full" />
                  <div className="bg-muted h-4 w-28 animate-pulse rounded" />
                </div>
                <div className="bg-muted h-7 w-24 animate-pulse rounded-lg" />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
