"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  acceptFriendRequest,
  cancelFriendRequest,
  declineFriendRequest,
  sendFriendRequest,
  unfriend,
} from "@/lib/friends/actions"
import type { FriendshipRelation } from "@/lib/friends/types"

type FriendshipActionsProps = {
  userId: string
  username: string
  relation: Exclude<FriendshipRelation, "self">
  friendshipId: string | null
  size?: "default" | "sm"
  /** Stretch actions to container width (profile header on mobile). */
  fullWidth?: boolean
  align?: "end" | "center"
}

export function FriendshipActions({
  userId,
  username,
  relation,
  friendshipId,
  size = "sm",
  fullWidth = false,
  align = "end",
}: FriendshipActionsProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [confirmUnfriend, setConfirmUnfriend] = useState(false)

  function run(action: () => Promise<{ ok: boolean; message?: string }>) {
    setError(null)
    startTransition(async () => {
      const result = await action()
      if (!result.ok) {
        setError(result.message ?? "Something went wrong.")
        return
      }
      setConfirmUnfriend(false)
      router.refresh()
    })
  }

  const isCentered = align === "center"

  return (
    <div
      className={
        fullWidth
          ? "flex w-full flex-col items-stretch gap-1 sm:w-auto sm:items-end"
          : isCentered
            ? "flex flex-col items-center gap-1"
            : "flex flex-col items-end gap-1"
      }
    >
      <div
        className={
          fullWidth
            ? "flex flex-wrap gap-2 sm:justify-end [&_button]:min-h-10 sm:[&_button]:min-h-9 [&_button]:flex-1 sm:[&_button]:flex-none"
            : isCentered
              ? "flex flex-wrap justify-center gap-2"
              : "flex flex-wrap justify-end gap-2"
        }
      >
        {relation === "none" ? (
          <Button
            type="button"
            size={size}
            disabled={pending}
            onClick={() => run(() => sendFriendRequest({ userId }))}
          >
            Add friend
          </Button>
        ) : null}

        {relation === "outgoing_pending" && friendshipId ? (
          <Button
            type="button"
            size={size}
            variant="outline"
            disabled={pending}
            onClick={() =>
              run(() => cancelFriendRequest({ friendshipId }))
            }
          >
            Cancel request
          </Button>
        ) : null}

        {relation === "incoming_pending" && friendshipId ? (
          <>
            <Button
              type="button"
              size={size}
              disabled={pending}
              onClick={() =>
                run(() => acceptFriendRequest({ friendshipId }))
              }
            >
              Accept
            </Button>
            <Button
              type="button"
              size={size}
              variant="outline"
              disabled={pending}
              onClick={() =>
                run(() => declineFriendRequest({ friendshipId }))
              }
            >
              Decline
            </Button>
          </>
        ) : null}

        {relation === "friends" ? (
          <Button
            type="button"
            size={size}
            variant="outline"
            disabled={pending}
            onClick={() => setConfirmUnfriend(true)}
          >
            Unfriend
          </Button>
        ) : null}
      </div>

      {error ? <p className="text-destructive text-xs">{error}</p> : null}

      <Dialog
        open={confirmUnfriend}
        onOpenChange={(open) => {
          if (!open && !pending) setConfirmUnfriend(false)
        }}
      >
        <DialogContent showCloseButton={!pending}>
          <DialogHeader>
            <DialogTitle>Unfriend @{username}?</DialogTitle>
            <DialogDescription>
              You’ll need to send a new request to become friends again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => setConfirmUnfriend(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={pending}
              onClick={() => run(() => unfriend({ userId }))}
            >
              Unfriend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
