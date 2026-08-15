export type UserHoverPreview = {
  id: string
  username: string
  image: string | null
  booksRead: number
  reading: {
    bookId: string
    title: string
    coverImageId: string
  } | null
}

export type LoadUserHoverPreviewResult =
  | { ok: true; preview: UserHoverPreview }
  | {
      ok: false
      code: "unauthorized" | "not_found" | "forbidden" | "invalid"
      message: string
    }
