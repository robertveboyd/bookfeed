export function FeedFallback() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading feed">
      <div className="space-y-2">
        <div className="bg-muted h-8 w-24 animate-pulse rounded" />
        <div className="bg-muted h-4 w-64 max-w-full animate-pulse rounded" />
      </div>

      <section className="space-y-3 lg:hidden">
        <div className="flex items-center justify-between gap-2">
          <div className="bg-muted h-4 w-16 animate-pulse rounded" />
          <div className="bg-muted h-3 w-20 animate-pulse rounded" />
        </div>
        <div className="-mx-4 flex gap-3 overflow-hidden px-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex w-[4.5rem] shrink-0 flex-col items-center gap-1.5"
            >
              <div className="bg-muted size-12 animate-pulse rounded-full" />
              <div className="bg-muted h-3 w-12 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </section>

      <div className="flex gap-10">
        <aside className="hidden w-52 shrink-0 space-y-3 lg:block xl:w-56">
          <div className="flex items-center justify-between gap-2">
            <div className="bg-muted h-4 w-16 animate-pulse rounded" />
            <div className="bg-muted h-3 w-20 animate-pulse rounded" />
          </div>
          <ul className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="flex items-center gap-2.5 px-1 py-1.5">
                <div className="bg-muted size-9 animate-pulse rounded-full" />
                <div className="bg-muted h-4 w-24 animate-pulse rounded" />
              </li>
            ))}
          </ul>
        </aside>

        <div className="min-w-0 flex-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex gap-3 border-b border-border py-4 last:border-b-0"
            >
              <div className="bg-muted size-10 shrink-0 animate-pulse rounded-full" />
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="bg-muted h-4 w-56 max-w-full animate-pulse rounded" />
                    <div className="bg-muted h-3 w-40 max-w-full animate-pulse rounded" />
                  </div>
                  <div className="bg-muted h-3 w-10 shrink-0 animate-pulse rounded" />
                </div>
                <div className="bg-muted aspect-[2/3] w-16 animate-pulse rounded-md sm:w-20" />
                <div className="flex gap-3 pt-1">
                  <div className="bg-muted h-5 w-12 animate-pulse rounded" />
                  <div className="bg-muted h-5 w-12 animate-pulse rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
