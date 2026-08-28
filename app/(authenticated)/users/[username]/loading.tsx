export default function Loading() {
  return (
    <div
      className="space-y-8 sm:space-y-10"
      aria-busy="true"
      aria-label="Loading profile"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="bg-muted size-16 animate-pulse rounded-full" />
          <div className="space-y-2">
            <div className="bg-muted h-7 w-36 animate-pulse rounded sm:h-8 sm:w-40" />
            <div className="bg-muted h-4 w-52 max-w-full animate-pulse rounded" />
          </div>
        </div>
        <div className="bg-muted h-10 w-full animate-pulse rounded-lg sm:h-8 sm:w-28" />
      </div>

      <section className="space-y-3 sm:space-y-4">
        <div className="bg-muted h-5 w-36 animate-pulse rounded sm:h-6 sm:w-40" />
        <div className="flex gap-3 sm:gap-6">
          <div className="bg-muted aspect-[2/3] w-24 animate-pulse rounded-md sm:w-32" />
          <div className="space-y-2 self-center">
            <div className="bg-muted h-5 w-40 max-w-full animate-pulse rounded sm:h-6 sm:w-48" />
            <div className="bg-muted h-4 w-28 animate-pulse rounded" />
          </div>
        </div>
      </section>

      <section className="space-y-3 sm:space-y-4">
        <div className="bg-muted h-5 w-14 animate-pulse rounded sm:h-6" />
        <div className="-mx-4 flex gap-3 overflow-hidden px-4 sm:mx-0 sm:flex-wrap sm:gap-4 sm:overflow-visible sm:px-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-24 shrink-0 space-y-2 sm:w-28 md:w-32">
              <div className="bg-muted aspect-[2/3] animate-pulse rounded-md" />
              <div className="bg-muted h-3 w-full animate-pulse rounded" />
              <div className="bg-muted h-3 w-2/3 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3 sm:space-y-4">
        <div className="bg-muted h-5 w-14 animate-pulse rounded sm:h-6" />
        <div className="-mx-4 flex gap-3 overflow-hidden px-4 sm:mx-0 sm:flex-wrap sm:gap-4 sm:overflow-visible sm:px-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-24 shrink-0 space-y-2 sm:w-28 md:w-36">
              <div className="bg-muted aspect-[2/3] animate-pulse rounded-md" />
              <div className="bg-muted h-3 w-full animate-pulse rounded" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
