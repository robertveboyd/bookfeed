function PersonCardFallback({ actionClassName = "w-24" }: { actionClassName?: string }) {
  return (
    <li className="flex flex-col items-center gap-3 rounded-xl border border-border/80 px-3 py-4">
      <div className="bg-muted size-14 animate-pulse rounded-full" />
      <div className="bg-muted h-4 w-20 animate-pulse rounded" />
      <div
        className={`bg-muted h-7 animate-pulse rounded-lg ${actionClassName}`}
      />
    </li>
  )
}

const peopleGridClass =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"

export function FriendsDirectoryFallback() {
  return (
    <div aria-busy="true" aria-label="Loading friends" className="space-y-4">
      <h2 className="text-lg font-medium tracking-tight">Your friends</h2>
      <ul className={peopleGridClass} aria-hidden>
        {Array.from({ length: 12 }).map((_, i) => (
          <PersonCardFallback key={i} />
        ))}
      </ul>
    </div>
  )
}

export function FriendsSearchHitsFallback() {
  return (
    <ul
      className={peopleGridClass}
      aria-busy="true"
      aria-label="Loading search results"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <PersonCardFallback key={i} />
      ))}
    </ul>
  )
}
