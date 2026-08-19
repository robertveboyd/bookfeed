"use client"

import { MoonIcon, SunIcon, SunMoon } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ThemeToggleProps = {
  layout?: "icon" | "item"
  className?: string
}

export function ThemeToggle({
  layout = "icon",
  className,
}: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  function toggle() {
    if (!mounted) return
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  const isDark = mounted && resolvedTheme === "dark"
  const label = isDark ? "Switch to light mode" : "Switch to dark mode"

  if (layout === "item") {
    return (
      <button
        type="button"
        disabled={!mounted}
        aria-label={label}
        onClick={toggle}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground disabled:opacity-50",
          className,
        )}
      >
        <span className="flex items-center gap-2.5">
          <SunMoon className="size-4" />
          Appearance
        </span>
        {isDark ? (
          <SunIcon className="size-4" />
        ) : (
          <MoonIcon className="size-4" />
        )}
      </button>
    )
  }

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Toggle theme"
        disabled
        className={cn("size-8", className)}
      />
    )
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      onClick={toggle}
      className={cn("size-8", className)}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </Button>
  )
}
