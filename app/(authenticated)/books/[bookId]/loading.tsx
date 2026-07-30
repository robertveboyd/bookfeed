export default function Loading() {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-8" aria-busy="true">
        <div className="bg-muted h-4 w-32 animate-pulse rounded" />
        <div className="flex flex-col gap-8 sm:flex-row">
          <div className="bg-muted mx-auto aspect-[2/3] w-48 animate-pulse rounded-md sm:mx-0 sm:w-56 md:w-64" />
          <div className="flex-1 space-y-3">
            <div className="bg-muted h-8 w-3/4 animate-pulse rounded" />
            <div className="bg-muted h-4 w-1/2 animate-pulse rounded" />
            <div className="bg-muted h-4 w-1/3 animate-pulse rounded" />
            <div className="bg-muted mt-6 h-24 w-full animate-pulse rounded" />
          </div>
        </div>
      </div>
    )
  }