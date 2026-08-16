export function FriendsUserRowFallback({
  actionClassName = "w-24",
}: {
  actionClassName?: string
}) {
  return (
    <li className="flex items-center justify-between gap-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="bg-muted size-10 animate-pulse rounded-full" />
        <div className="bg-muted h-4 w-28 animate-pulse rounded" />
      </div>
      <div
        className={`bg-muted h-7 animate-pulse rounded-lg ${actionClassName}`}
      />
    </li>
  )
}

function ListSectionFallback({
  title,
  rows,
  actionClassName,
}: {
  title: string
  rows: number
  actionClassName?: string
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-medium tracking-tight">{title}</h2>
      <ul className="divide-y divide-border" aria-hidden>
        {Array.from({ length: rows }).map((_, i) => (
          <FriendsUserRowFallback key={i} actionClassName={actionClassName} />
        ))}
      </ul>
    </section>
  )
}

export function FriendsDirectoryFallback() {
  return (
    <div aria-busy="true" aria-label="Loading friends" className="space-y-10">
      <ListSectionFallback title="Your friends" rows={5} />
      <ListSectionFallback
        title="Incoming requests"
        rows={2}
        actionClassName="w-36"
      />
      <ListSectionFallback title="Sent requests" rows={2} />
    </div>
  )
}

export function FriendsSearchHitsFallback() {
  return (
    <ul
      className="divide-y divide-border"
      aria-busy="true"
      aria-label="Loading search results"
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <FriendsUserRowFallback key={i} />
      ))}
    </ul>
  )
}
