import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type EmptyStateProps = {
  title: string
  description: string
  action?: {
    href: string
    label: string
    variant?: "default" | "outline"
  }
  className?: string
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 rounded-xl border border-dashed border-border/80 px-4 py-6",
        className,
      )}
    >
      <div className="space-y-1">
        <p className="text-sm font-medium tracking-tight">{title}</p>
        <p className="text-muted-foreground text-sm text-pretty">{description}</p>
      </div>
      {action ? (
        <Link
          href={action.href}
          className={buttonVariants({
            variant: action.variant ?? "outline",
            size: "sm",
          })}
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  )
}
