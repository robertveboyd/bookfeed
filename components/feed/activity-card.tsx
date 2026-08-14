import { ActivityEngagement } from "@/components/feed/activity-engagement"
import { ActivityPost } from "@/components/feed/activity-post"
import type { FeedActivityItem } from "@/lib/activity/types"

type ActivityCardProps = {
  item: FeedActivityItem
  commentsOpen?: boolean
  onLikeChange?: (next: { liked: boolean; likeCount: number }) => void
  onOpenComments?: () => void
}

export function ActivityCard({
  item,
  commentsOpen,
  onLikeChange,
  onOpenComments,
}: ActivityCardProps) {
  return (
    <article className="border-b border-border py-4 last:border-b-0">
      <ActivityPost
        item={item}
        footer={
          <ActivityEngagement
            activityId={item.id}
            likeCount={item.likeCount}
            commentCount={item.commentCount}
            viewerHasLiked={item.viewerHasLiked}
            commentsOpen={commentsOpen}
            onLikeChange={onLikeChange}
            onOpenComments={onOpenComments}
          />
        }
      />
    </article>
  )
}
