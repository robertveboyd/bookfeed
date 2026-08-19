export function CatalogSearchResultsFallback() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading search results">
      <div className="bg-muted h-4 w-48 animate-pulse rounded" />
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {Array.from({ length: 16 }).map((_, index) => (
          <li key={index}>
            <div className="bg-muted aspect-[2/3] animate-pulse rounded-md" />
            <div className="bg-muted mt-2 h-3 w-20 animate-pulse rounded" />
            <div className="bg-muted mt-1.5 h-2.5 w-14 animate-pulse rounded" />
          </li>
        ))}
      </ul>
    </div>
  )
}
