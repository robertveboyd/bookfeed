export function CatalogShelvesFallback() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading shelves">
      {Array.from({ length: 4 }).map((_, shelfIndex) => (
        <div key={shelfIndex} className="space-y-3">
          <div className="bg-muted h-6 w-40 animate-pulse rounded-md" />
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 6 }).map((__, tileIndex) => (
              <div key={tileIndex} className="w-28 shrink-0 sm:w-32 md:w-36">
                <div className="bg-muted aspect-[2/3] animate-pulse rounded-md" />
                <div className="bg-muted mt-2 h-3 w-20 animate-pulse rounded" />
                <div className="bg-muted mt-1.5 h-2.5 w-14 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
