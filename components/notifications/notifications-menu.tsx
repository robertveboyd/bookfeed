"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { BellIcon } from "lucide-react"

import { RelativeTime } from "@/components/feed/relative-time"
import { HeaderIconButton } from "@/components/nav/header-icon-button"
import { UserAvatar } from "@/components/profile/user-avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  loadNotifications,
  markAllNotificationsReadAction,
} from "@/lib/notifications/actions"
import {
  formatNotificationMessage,
  formatUnreadBadge,
  notificationHref,
} from "@/lib/notifications/format"
import type { NotificationItem } from "@/lib/notifications/types"
import { cn } from "@/lib/utils"

type NotificationsMenuProps = {
  initialUnreadCount: number
}

export function NotificationsMenu({
  initialUnreadCount,
}: NotificationsMenuProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [, startTransition] = useTransition()
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)
  const badge = formatUnreadBadge(unreadCount)

  useEffect(() => {
    setUnreadCount(initialUnreadCount)
  }, [initialUnreadCount])

  useEffect(() => {
    if (!open) return

    setUnreadCount(0)
    let cancelled = false
    setLoading(true)

    void Promise.all([loadNotifications(), markAllNotificationsReadAction()]).then(
      ([result]) => {
        if (cancelled) return
        if (result.ok) {
          const readAt = new Date()
          setItems(
            result.items.map((row) => ({ ...row, readAt: row.readAt ?? readAt })),
          )
        }
        setLoading(false)
      },
    )

    return () => {
      cancelled = true
    }
  }, [open])

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setLoading(false)
    }
  }

  function onSelectNotification(item: NotificationItem) {
    setOpen(false)
    startTransition(() => {
      router.push(notificationHref(item))
    })
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger
        render={
          <HeaderIconButton
            aria-label={
              unreadCount > 0
                ? `Notifications, ${unreadCount} unread`
                : "Notifications"
            }
            className="relative"
          />
        }
      >
        <BellIcon className="size-4" />
        {badge ? (
          <span className="absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-4 text-white">
            {badge}
          </span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="px-3 py-2">
          <p className="text-sm font-semibold">Notifications</p>
        </div>
        <DropdownMenuSeparator className="m-0" />
        {loading ? (
          <div className="text-muted-foreground px-3 py-6 text-center text-sm">
            Loading…
          </div>
        ) : items.length === 0 ? (
          <div className="text-muted-foreground px-3 py-6 text-center text-sm">
            No notifications yet.
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto p-1">
            {items.map((item) => (
              <DropdownMenuItem
                key={item.id}
                className={cn(
                  "h-auto cursor-pointer items-start gap-2.5 rounded-md px-2 py-2.5",
                  !item.readAt && "bg-muted/50",
                )}
                onClick={() => onSelectNotification(item)}
              >
                <UserAvatar
                  userId={item.latestActor.id}
                  username={item.latestActor.username}
                  imageUrl={item.latestActor.image}
                  size={32}
                  className="mt-0.5 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">
                    {formatNotificationMessage(item)}
                  </p>
                  <RelativeTime
                    date={item.updatedAt}
                    className="text-muted-foreground mt-1 block text-xs"
                  />
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
