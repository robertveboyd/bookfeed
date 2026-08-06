import localCoverIds from "./local-covers.json"

export const COVER_SIZES = ["S", "M", "L"] as const

export type CoverSize = (typeof COVER_SIZES)[number]

const COVERS_HOST = "https://covers.openlibrary.org/b"

const LOCAL_COVER_IDS = new Set(localCoverIds as string[])

/**
 * True when `coverImageId` looks like an ISBN,
 * not an Open Library numeric cover id.
 */
function isIsbnCoverId(coverImageId: string): boolean {
  const id = coverImageId.replace(/[-\s]/g, "")
  if (/^\d{13}$/.test(id)) return true
  if (/^\d{9}[\dXx]$/.test(id)) return true
  return false
}

/**
 * Build a cover URL for a stored cover id.
 * Prefers locally hosted seed covers in /public/covers when present in
 * local-covers.json; otherwise falls back to Open Library.
 *
 * `default=false` makes missing remote covers 404 instead of OL's 1×1 GIF.
 *
 * @see https://openlibrary.org/dev/docs/api/covers
 */
export function coverUrl(coverImageId: string, size: CoverSize = "L"): string {
  if (LOCAL_COVER_IDS.has(coverImageId)) {
    return `/covers/${coverImageId}-${size}.jpg`
  }

  const kind = isIsbnCoverId(coverImageId) ? "isbn" : "id"
  return `${COVERS_HOST}/${kind}/${coverImageId}-${size}.jpg?default=false`
}

/** Whether this cover id is served from /public/covers */
export function hasLocalCover(coverImageId: string): boolean {
  return LOCAL_COVER_IDS.has(coverImageId)
}
