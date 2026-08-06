/**
 * App-facing avatar URL. Private Blob objects are proxied through this route.
 */
export function avatarSrc(
  userId: string,
  imageUrl: string | null | undefined,
): string | null {
  if (!imageUrl) return null
  // Cache-bust when the underlying blob URL changes (new upload).
  const version = encodeURIComponent(imageUrl.slice(-24))
  return `/api/avatars/${userId}?v=${version}`
}
