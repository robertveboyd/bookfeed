"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { notifications } from "@/lib/db/schema"
import {
  countUnreadNotifications,
  getNotificationForRecipient,
  listNotifications,
  markAllNotificationsRead,
} from "@/lib/notifications/queries"
import type {
  LoadNotificationsResult,
  NotificationActionResult,
} from "@/lib/notifications/types"

function revalidateNotificationPaths() {
  revalidatePath("/", "layout")
}

export async function loadNotifications(): Promise<LoadNotificationsResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, code: "unauthorized", message: "Sign in required." }
  }

  const recipientId = session.user.id
  const [items, unreadCount] = await Promise.all([
    listNotifications(recipientId),
    countUnreadNotifications(recipientId),
  ])

  return { ok: true, items, unreadCount }
}

export async function markNotificationRead(input: {
  notificationId: string
}): Promise<NotificationActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, code: "unauthorized", message: "Sign in required." }
  }

  const parsed = z.object({ notificationId: z.uuid() }).safeParse(input)
  if (!parsed.success) {
    return { ok: false, code: "invalid", message: "Invalid notification." }
  }

  const row = await getNotificationForRecipient(
    session.user.id,
    parsed.data.notificationId,
  )
  if (!row) {
    return { ok: false, code: "not_found", message: "Notification not found." }
  }

  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(eq(notifications.id, row.id))

  revalidateNotificationPaths()
  return { ok: true }
}

export async function markAllNotificationsReadAction(): Promise<NotificationActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, code: "unauthorized", message: "Sign in required." }
  }

  await markAllNotificationsRead(session.user.id)
  revalidateNotificationPaths()
  return { ok: true }
}
