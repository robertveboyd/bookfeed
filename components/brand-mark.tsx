import { cn } from "@/lib/utils"

type BrandMarkProps = {
  className?: string
}

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      className={cn("size-7", className)}
      aria-hidden
    >
      <rect width="32" height="32" rx="8" className="fill-foreground" />
      <path
        className="fill-background"
        d="M7 8.2C7 7.2 8 6.6 9 6.9L15 9v14l-6-1.9C8 20.8 7 20.3 7 19.3V8.2Z"
      />
      <path
        className="fill-background"
        d="M25 8.2C25 7.2 24 6.6 23 6.9L17 9v14l6-1.9c1-.3 2-.8 2-1.8V8.2Z"
      />
    </svg>
  )
}
