"use client"

import { useCallback, useEffect, useRef, type RefObject } from "react"

/** Prefetch next page when the sentinel is within this distance of the scroll bottom. */
export const INFINITE_SCROLL_PREFETCH_PX = 200

type UseInfiniteScrollOptions = {
  scrollRootRef: RefObject<HTMLElement | null>
  sentinelRef: RefObject<HTMLElement | null>
  hasMore: boolean
  isLoading: boolean
  onLoadMore: () => void
  /** Re-run the fill check after items append (short first page). */
  itemCount: number
  prefetchPx?: number
  /** Set once the scroll root element is mounted. */
  scrollRootReady?: boolean
}

function isSentinelNearScrollBottom(
  root: HTMLElement | null,
  sentinel: HTMLElement,
  prefetchPx: number,
) {
  const sentinelRect = sentinel.getBoundingClientRect()

  if (root) {
    const rootRect = root.getBoundingClientRect()
    return sentinelRect.top <= rootRect.bottom + prefetchPx
  }

  return sentinelRect.top <= window.innerHeight + prefetchPx
}

export function useInfiniteScroll({
  scrollRootRef,
  sentinelRef,
  hasMore,
  isLoading,
  onLoadMore,
  itemCount,
  prefetchPx = INFINITE_SCROLL_PREFETCH_PX,
  scrollRootReady = true,
}: UseInfiniteScrollOptions) {
  const onLoadMoreRef = useRef(onLoadMore)
  onLoadMoreRef.current = onLoadMore

  const tryLoadMore = useCallback(() => {
    if (!hasMore || isLoading) return

    const sentinel = sentinelRef.current
    if (!sentinel) return

    if (
      isSentinelNearScrollBottom(
        scrollRootRef.current,
        sentinel,
        prefetchPx,
      )
    ) {
      onLoadMoreRef.current()
    }
  }, [hasMore, isLoading, prefetchPx, scrollRootRef, sentinelRef])

  useEffect(() => {
    if (!hasMore || !scrollRootReady) return

    const root = scrollRootRef.current
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const rootMargin = `0px 0px ${prefetchPx}px 0px`
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onLoadMoreRef.current()
        }
      },
      { root, rootMargin, threshold: 0 },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, prefetchPx, scrollRootReady, scrollRootRef, sentinelRef])

  useEffect(() => {
    if (!hasMore || isLoading) return

    const frame = requestAnimationFrame(() => {
      tryLoadMore()
    })

    return () => cancelAnimationFrame(frame)
  }, [hasMore, isLoading, itemCount, tryLoadMore])
}
