import { peopleGridClass } from "@/components/friends/friends-lists"
import { SectionHeading } from "@/components/friends/section-heading"

function PersonCardFallback({ withAction = false }: { withAction?: boolean }) {
  return (
    <li className="border-border/70 bg-muted/20 flex flex-col items-center gap-3 rounded-xl border px-3 py-4">
      <div className="bg-muted size-14 animate-pulse rounded-full" />
      <div className="bg-muted h-4 w-20 animate-pulse rounded" />
      <div className="bg-muted h-3 w-24 animate-pulse rounded" />
      {withAction ? (
        <div className="bg-muted h-7 w-24 animate-pulse rounded-lg" />
      ) : null}
    </li>
  )
}

export function FriendsDirectoryFallback() {
  return (
    <div aria-busy="true" aria-label="Loading friends" className="space-y-4">
      <SectionHeading title="Your friends" />
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
        <PersonCardFallback key={i} withAction />
      ))}
    </ul>
  )
}
