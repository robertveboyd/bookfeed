import { BookCover } from "@/components/catalog/book-cover"
import { UserAvatar } from "@/components/profile/user-avatar"
import type { CurrentlyReadingBook } from "@/lib/friends/types"
import { cn } from "@/lib/utils"

type UserAvatarWithReadingBadgeProps = {
  userId: string
  username: string
  imageUrl?: string | null
  size?: number
  reading?: CurrentlyReadingBook | null
  className?: string
}

export function UserAvatarWithReadingBadge({
  userId,
  username,
  imageUrl,
  size = 48,
  reading,
  className,
}: UserAvatarWithReadingBadgeProps) {
  const badgeWidthClass = size >= 56 ? "w-6" : "w-5"

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <UserAvatar
        userId={userId}
        username={username}
        imageUrl={imageUrl}
        size={size}
      />
      {reading ? (
        <span
          className={cn(
            "absolute -right-1 -bottom-1 block aspect-[2/3] overflow-hidden rounded-sm bg-muted ring-2 ring-background shadow-sm",
            badgeWidthClass,
          )}
        >
          <span className="relative block size-full">
            <BookCover
              coverImageId={reading.coverImageId}
              title={reading.title}
              size="S"
            />
          </span>
        </span>
      ) : null}
    </div>
  )
}
