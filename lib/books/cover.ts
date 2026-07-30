export const COVER_SIZES = ["S", "M", "L"] as const

export type CoverSize = (typeof COVER_SIZES)[number]

const COVERS_BASE = "https://covers.openlibrary.org/b/isbn"

/**
 * Build an Open Library cover URL from a stored cover id (ISBN for now).
 * @see https://openlibrary.org/dev/docs/api/covers
 */
export function coverUrl(coverImageId: string, size: CoverSize = "L"): string {
  return `${COVERS_BASE}/${coverImageId}-${size}.jpg`
}
