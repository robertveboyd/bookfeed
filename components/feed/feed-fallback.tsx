export function FeedFallback() {
  return (
    <div
      className="flex flex-col gap-6"
      aria-busy="true"
      aria-label="Loading feed"
    >
      <section className="shrink-0 lg:hidden">
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

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
        <aside className="hidden w-52 shrink-0 lg:block lg:sticky lg:top-0 lg:self-start xl:w-64">
          <div className="scrollbar-hidden max-h-[calc(100dvh-3.5rem-2rem)] overflow-y-auto overscroll-y-contain">
            <ul className="grid grid-cols-2 gap-x-2 gap-y-4 xl:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <li
                  key={i}
                  className="flex min-w-0 flex-col items-center gap-1.5"
                >
                  <div className="bg-muted size-12 animate-pulse rounded-full" />
                  <div className="bg-muted h-3 w-full max-w-12 animate-pulse rounded" />
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="min-h-0 min-w-0 flex-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-stretch gap-3 border-b border-border py-5 first:pt-0 last:border-b-0 sm:gap-4"
            >
              <div className="bg-muted aspect-[2/3] w-[4.5rem] shrink-0 animate-pulse rounded-md sm:w-24" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="bg-muted size-7 shrink-0 animate-pulse rounded-full" />
                  <div className="bg-muted h-4 w-40 max-w-full animate-pulse rounded" />
                  <div className="bg-muted ml-auto h-3 w-10 shrink-0 animate-pulse rounded" />
                </div>
                <div className="bg-muted h-5 w-48 max-w-full animate-pulse rounded" />
                <div className="bg-muted h-3 w-28 max-w-full animate-pulse rounded" />
                <div className="mt-auto flex gap-3 pt-1">
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
