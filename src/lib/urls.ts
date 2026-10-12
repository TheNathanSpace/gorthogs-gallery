import type { LibraryViewMode, SearchField } from "@/lib/search"
import type { Photo } from "@/lib/schema"

export function photoUrl(
  photoId: string,
  variant: "original" | "thumb" | "display" = "display"
): string {
  return `/media/${photoId}/${variant}`
}

export function miniaturePath(slug: string): string {
  return `/miniatures/${slug}`
}

export function libraryHref(opts?: {
  view?: LibraryViewMode
  q?: string
  field?: SearchField
  photo?: string
}): string {
  const params = new URLSearchParams()
  if (opts?.view && opts.view !== "photos") params.set("view", opts.view)
  if (opts?.field && opts.field !== "all") params.set("field", opts.field)
  if (opts?.q) params.set("q", opts.q)
  if (opts?.photo) params.set("photo", opts.photo)
  const qs = params.toString()
  return qs ? `/?${qs}` : "/"
}

export function coverOf<T extends Pick<Photo, "isCover" | "sortOrder">>(
  photos: T[]
): T | undefined {
  return (
    photos.find((photo) => photo.isCover) ??
    [...photos].sort((a, b) => a.sortOrder - b.sortOrder)[0]
  )
}
