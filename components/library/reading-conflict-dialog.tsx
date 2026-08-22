"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ReadingConflict } from "@/lib/library/types"

type ReadingConflictDialogProps = {
  conflict: ReadingConflict | null
  pending: boolean
  onOpenChange: (open: boolean) => void
  onCancel: () => void
  onDemote: () => void
  onFinish: () => void
}

export function ReadingConflictDialog({
  conflict,
  pending,
  onOpenChange,
  onCancel,
  onDemote,
  onFinish,
}: ReadingConflictDialogProps) {
  return (
    <Dialog
      open={conflict !== null}
      onOpenChange={(open) => {
        if (!open && !pending) onOpenChange(false)
      }}
    >
      <DialogContent showCloseButton={!pending}>
        <DialogHeader>
          <DialogTitle>Already reading another book</DialogTitle>
          <DialogDescription>
            {conflict
              ? `You're already reading “${conflict.title}”. Mark it finished, or move it to Interested?`
              : null}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={onDemote}
          >
            Move to Interested
          </Button>
          <Button type="button" disabled={pending} onClick={onFinish}>
            Mark finished
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
