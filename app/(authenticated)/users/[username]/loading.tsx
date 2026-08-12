export default function Loading() {
  return (
    <div
      className="mx-auto max-w-4xl space-y-10"
      aria-busy="true"
      aria-label="Loading profile"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-muted size-20 animate-pulse rounded-full" />
          <div className="space-y-2">
            <div className="bg-muted h-8 w-40 animate-pulse rounded" />
            <div className="bg-muted h-4 w-56 max-w-full animate-pulse rounded" />
          </div>
        </div>
        <div className="bg-muted h-8 w-28 animate-pulse rounded-lg" />
      </div>

      <section className="space-y-4">
        <div className="bg-muted h-6 w-40 animate-pulse rounded" />
        <div className="flex gap-4 sm:gap-6">
          <div className="bg-muted aspect-[2/3] w-28 animate-pulse rounded-md sm:w-32" />
          <div className="space-y-2 self-center">
            <div className="bg-muted h-6 w-48 max-w-full animate-pulse rounded" />
            <div className="bg-muted h-4 w-32 animate-pulse rounded" />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="bg-muted h-6 w-16 animate-pulse rounded" />
        <div className="flex flex-wrap gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-28 space-y-2 sm:w-32">
              <div className="bg-muted aspect-[2/3] animate-pulse rounded-md" />
              <div className="bg-muted h-3 w-full animate-pulse rounded" />
              <div className="bg-muted h-3 w-2/3 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="bg-muted h-6 w-16 animate-pulse rounded" />
        <div className="flex flex-wrap gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-28 space-y-2 sm:w-32 md:w-36">
              <div className="bg-muted aspect-[2/3] animate-pulse rounded-md" />
              <div className="bg-muted h-3 w-full animate-pulse rounded" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
