"use client"

import { useEffect, useRef, useState, useTransition } from "react"

import { UserAvatar } from "@/components/profile/user-avatar"
import { Button } from "@/components/ui/button"
import {
  removeAvatar,
  uploadAvatar,
} from "@/lib/users/actions/avatar"

type AvatarSettingsProps = {
  userId: string
  username: string
  imageUrl: string | null
}

export function AvatarSettings({
  userId,
  username,
  imageUrl,
}: AvatarSettingsProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [storedUrl, setStoredUrl] = useState<string | null>(imageUrl)
  const [message, setMessage] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    setStoredUrl(imageUrl)
  }, [imageUrl])

  function onFileChange(fileList: FileList | null) {
    const file = fileList?.[0]
    if (!file) return

    const body = new FormData()
    body.set("avatar", file)

    startTransition(async () => {
      setMessage(null)
      const result = await uploadAvatar(body)
      if (!result.ok) {
        setMessage(result.message)
        if (inputRef.current) inputRef.current.value = ""
        return
      }
      setStoredUrl(result.imageUrl)
      setMessage("Profile picture updated.")
      if (inputRef.current) inputRef.current.value = ""
    })
  }

  function onRemove() {
    startTransition(async () => {
      setMessage(null)
      const result = await removeAvatar()
      if (!result.ok) {
        setMessage(result.message)
        return
      }
      setStoredUrl(null)
      setMessage("Profile picture removed.")
    })
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <UserAvatar
        userId={userId}
        username={username}
        imageUrl={storedUrl}
        size={96}
      />

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={(e) => onFileChange(e.target.files)}
            disabled={pending}
          />
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
          >
            {pending ? "Working…" : "Upload photo"}
          </Button>
          {storedUrl ? (
            <Button
              type="button"
              variant="ghost"
              disabled={pending}
              onClick={onRemove}
            >
              Remove
            </Button>
          ) : null}
        </div>
        <p className="text-muted-foreground text-sm">
          JPEG, PNG, WebP, or GIF · max 2MB · one photo at a time
        </p>
        {message ? (
          <p className="text-sm text-foreground" role="status">
            {message}
          </p>
        ) : null}
      </div>
    </div>
  )
}
