import { get } from "@vercel/blob"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"

type RouteContext = {
  params: Promise<{ userId: string }>
}

/**
 * Streams a user's avatar from the private Blob store.
 * Publicly readable by user id so avatars can appear on profiles/feeds later.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { userId } = await context.params

  const [user] = await db
    .select({ image: users.image })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user?.image) {
    return new NextResponse("Not found", { status: 404 })
  }

  const result = await get(user.image, {
    access: "private",
    useCache: false,
  })

  if (!result || result.statusCode !== 200 || !result.stream) {
    return new NextResponse("Not found", { status: 404 })
  }

  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType ?? "application/octet-stream",
      "Cache-Control": "private, max-age=60",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
