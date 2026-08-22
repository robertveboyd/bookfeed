import {
  formatNotificationMessage,
  formatNotificationMessageSegments,
} from "@/lib/notifications/format"
import type { NotificationItem } from "@/lib/notifications/types"

type NotificationMessageProps = {
  item: NotificationItem
}

export function NotificationMessage({ item }: NotificationMessageProps) {
  const segments = formatNotificationMessageSegments(item)

  return (
    <span aria-label={formatNotificationMessage(item)}>
      {segments.map((segment, index) =>
        segment.emphasis ? (
          <span key={index} className="font-semibold text-foreground">
            {segment.text}
          </span>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </span>
  )
}
