import { cn } from "@/lib/utils"

export function HeaderUtilityCluster({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg border border-border bg-muted/30 p-0.5",
        className,
      )}
    >
      {children}
    </div>
  )
}
