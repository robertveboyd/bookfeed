export default function Loading() {
  return (
    <div className="space-y-12" aria-busy="true">
      <div className="space-y-2">
        <div className="bg-muted h-8 w-40 animate-pulse rounded" />
        <div className="bg-muted h-4 w-80 max-w-full animate-pulse rounded" />
      </div>

      <div className="from-foreground/[0.06] via-muted/70 rounded-2xl border border-border/70 bg-linear-to-br to-background px-5 py-7 sm:px-8 sm:py-9">
        <div className="flex flex-col gap-7 pl-2 sm:flex-row sm:items-start sm:gap-10 sm:pl-3">
          <div className="bg-muted mx-auto aspect-[2/3] w-44 animate-pulse rounded-lg sm:mx-0 sm:w-48 md:w-56" />
          <div className="flex-1 space-y-3 text-center sm:pt-1 sm:text-left">
            <div className="bg-muted mx-auto h-3 w-32 animate-pulse rounded sm:mx-0" />
            <div className="bg-muted mx-auto h-10 w-72 max-w-full animate-pulse rounded sm:mx-0" />
            <div className="bg-muted mx-auto h-5 w-44 animate-pulse rounded sm:mx-0" />
            <div className="bg-muted mx-auto h-4 w-28 animate-pulse rounded sm:mx-0" />
            <div className="bg-muted h-20 w-full animate-pulse rounded" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="bg-muted h-6 w-20 animate-pulse rounded" />
          <div className="bg-muted h-4 w-40 animate-pulse rounded" />
        </div>
        <div className="flex flex-wrap gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-28 space-y-2 sm:w-32 md:w-36">
              <div className="bg-muted aspect-[2/3] animate-pulse rounded-md" />
              <div className="bg-muted h-3 w-full animate-pulse rounded" />
              <div className="bg-muted h-3 w-2/3 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
