import Image from "next/image"
import Link from "next/link"

import { ThemeToggle } from "@/components/theme-toggle"

type AuthShellProps = {
  title: string
  description: string
  children: React.ReactNode
  footer: React.ReactNode
}

export function AuthShell({
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="relative flex flex-1 flex-col lg:flex-row">
      <div className="absolute top-4 right-4 z-10 lg:top-6 lg:right-6">
        <ThemeToggle />
      </div>

      <div
        aria-hidden
        className="relative hidden min-h-0 overflow-hidden lg:block lg:w-1/2"
      >
        {/* Hero image */}
        <div className="auth-hero-drift absolute inset-[-8%]">
          <Image
            src="/bookfeed-hero.jpg"
            alt=""
            fill
            priority
            sizes="50vw"
            className="object-cover"
          />
        </div>

        {/* CSS placeholder — uncomment to preview without the photo
        <div className="auth-hero-drift absolute inset-[-8%] bg-[radial-gradient(ellipse_at_30%_20%,oklch(0.45_0.04_70),transparent_55%),linear-gradient(160deg,oklch(0.28_0.02_60),oklch(0.18_0.01_50))]" />
        <div className="absolute inset-0 opacity-[0.12] [background-image:repeating-linear-gradient(-12deg,transparent,transparent_12px,oklch(1_0_0/0.15)_12px,oklch(1_0_0/0.15)_13px)]" />
        */}
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12 lg:w-1/2 lg:px-10">
        <div className="animate-in fade-in slide-in-from-bottom-3 w-full max-w-md space-y-8 duration-500 ease-out fill-mode-both motion-reduce:animate-none">
          <div className="space-y-3">
            <p className="text-3xl font-semibold tracking-tight">
              <Link href="/sign-in" className="hover:opacity-80">
                Bookfeed
              </Link>
            </p>
            <div className="space-y-1">
              <h1 className="text-xl font-medium tracking-tight">{title}</h1>
              <p className="text-muted-foreground text-sm">{description}</p>
            </div>
          </div>

          {children}

          <div className="text-muted-foreground text-sm">{footer}</div>
        </div>
      </div>
    </div>
  )
}
