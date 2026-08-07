import { db } from "@/lib/db"
import { activities } from "@/lib/db/schema"
import type { RecordActivityInput } from "@/lib/activity/types"

export async function recordActivity(
  input: RecordActivityInput,
): Promise<void> {
  await db.insert(activities).values({
    actorId: input.actorId,
    type: input.type,
    bookId: input.bookId,
    reviewId: input.reviewId ?? null,
    rating: input.rating ?? null,
  })
}
