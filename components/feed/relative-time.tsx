"use client"

import { useEffect, useState } from "react"

import { formatRelativeTime } from "@/lib/activity/format"

type RelativeTimeProps = {
  date: Date | string
  className?: string
}

/** Absolute label stable across server/client (avoids locale hydration mismatch). */
function formatAbsolute(date: Date): string {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function RelativeTime({ date, className }: RelativeTimeProps) {
  const parsed = new Date(date)
  const iso = parsed.toISOString()
  const absolute = formatAbsolute(parsed)
  const [label, setLabel] = useState(absolute)

  useEffect(() => {
    setLabel(formatRelativeTime(new Date(iso)))
  }, [iso])

  return (
    <time className={className} dateTime={iso} title={absolute}>
      {label}
    </time>
  )
}
