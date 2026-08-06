import Image from "next/image"

import { avatarSrc } from "@/lib/users/avatar-url"
import { cn } from "@/lib/utils"

type UserAvatarProps = {
  userId: string
  username: string
  imageUrl?: string | null
  size?: number
  className?: string
}

export function UserAvatar({
  userId,
  username,
  imageUrl,
  size = 96,
  className,
}: UserAvatarProps) {
  const letter = (username.trim().charAt(0) || "?").toUpperCase()
  const src = avatarSrc(userId, imageUrl)

  if (src) {
    return (
      <Image
        src={src}
        alt={`${username}'s profile picture`}
        width={size}
        height={size}
        unoptimized
        className={cn(
          "rounded-full object-cover ring-1 ring-border",
          className,
        )}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <div
      role="img"
      aria-label={`${username}'s avatar`}
      className={cn(
        "flex items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground ring-1 ring-border",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
    >
      {letter}
    </div>
  )
}
