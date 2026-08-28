"use client"

import { Sparkles } from "lucide-react"

import { BrandMark } from "@/components/brand-mark"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type ClosedBetaDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Built for the closed-beta launch, when "Create one" on the sign-in page opened
 * this instead of linking to /register. Registration is open now, so nothing
 * renders it — kept here in case we gate signups again.
 */
export function ClosedBetaDialog({ open, onOpenChange }: ClosedBetaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="gap-0 overflow-hidden p-0 sm:max-w-md"
      >
        <div className="relative overflow-hidden border-b bg-muted/35 px-6 pt-8 pb-7 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,oklch(0.75_0.04_70/0.22),transparent_62%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,oklch(0.45_0.03_70/0.28),transparent_62%)]"
          />
          <div className="relative mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-background shadow-sm ring-1 ring-foreground/10">
            <BrandMark className="size-8" />
          </div>
          <span className="relative inline-flex items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase ring-1 ring-border/80 backdrop-blur-sm">
            <Sparkles className="size-3" aria-hidden />
            Closed beta
          </span>
        </div>

        <div className="space-y-5 px-6 py-5">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-lg tracking-tight">
              We&apos;re not quite open yet
            </DialogTitle>
            <DialogDescription className="text-pretty leading-relaxed">
              Bookfeed is in a closed beta with a select group of testers.
              We&apos;ll be launching to the public shortly — thank you for your
              interest!
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="-mx-6 -mb-5 border-t-0 bg-transparent px-6 pb-5">
            <Button
              type="button"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              Got it
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
