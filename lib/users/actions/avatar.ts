"use server"

import { del, put } from "@vercel/blob"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"

const MAX_BYTES = 2 * 1024 * 1024
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
])

export type AvatarActionResult =
  | { ok: true; imageUrl: string | null }
  | { ok: false; message: string }

function extensionFor(type: string): string {
  switch (type) {
    case "image/png":
      return ".png"
    case "image/webp":
      return ".webp"
    case "image/gif":
      return ".gif"
    default:
      return ".jpg"
  }
}

async function requireUserId(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id ?? null
}

function revalidateAvatarPaths(username?: string | null) {
  revalidatePath("/settings")
  // Header avatar in authenticated layout.
  revalidatePath("/", "layout")
  // Feed / friends rail avatars.
  revalidatePath("/")
  revalidatePath("/friends")
  if (username) revalidatePath(`/users/${username}`)
}

export async function uploadAvatar(
  formData: FormData,
): Promise<AvatarActionResult> {
  const userId = await requireUserId()
  if (!userId) {
    return { ok: false, message: "Sign in required." }
  }

  const file = formData.get("avatar")
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Choose an image to upload." }
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return { ok: false, message: "Use a JPEG, PNG, WebP, or GIF image." }
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, message: "Image must be 2MB or smaller." }
  }

  const [existing] = await db
    .select({ image: users.image, username: users.username })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  const pathname = `avatars/${userId}${extensionFor(file.type)}`
  const blob = await put(pathname, file, {
    access: "private",
    addRandomSuffix: true,
    contentType: file.type,
  })

  await db
    .update(users)
    .set({ image: blob.url, updatedAt: new Date() })
    .where(eq(users.id, userId))

  if (existing?.image && existing.image !== blob.url) {
    try {
      await del(existing.image)
    } catch {
      // Old blob may already be gone; ignore.
    }
  }

  revalidateAvatarPaths(existing?.username)
  return { ok: true, imageUrl: blob.url }
}

export async function removeAvatar(): Promise<AvatarActionResult> {
  const userId = await requireUserId()
  if (!userId) {
    return { ok: false, message: "Sign in required." }
  }

  const [existing] = await db
    .select({ image: users.image, username: users.username })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  await db
    .update(users)
    .set({ image: null, updatedAt: new Date() })
    .where(eq(users.id, userId))

  if (existing?.image) {
    try {
      await del(existing.image)
    } catch {
      // ignore
    }
  }

  revalidateAvatarPaths(existing?.username)
  return { ok: true, imageUrl: null }
}
