export function SectionHeading({
  title,
  count,
}: {
  title: string
  count?: number
}) {
  return (
    <h2 className="text-lg font-medium tracking-tight">
      {title}
      {count && count > 0 ? (
        <span className="text-muted-foreground ml-2 text-sm font-normal tabular-nums">
          {count}
        </span>
      ) : null}
    </h2>
  )
}
