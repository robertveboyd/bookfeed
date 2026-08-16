import { FriendsSearchResults } from "@/components/friends/friends-lists"
import { requireSession } from "@/lib/auth/util/session"
import { searchUsersByUsername } from "@/lib/friends/queries"

export async function FriendsSearchHits({ q }: { q: string }) {
  const session = await requireSession()
  const hits = await searchUsersByUsername(q, session.user.id)
  return <FriendsSearchResults hits={hits} />
}
