export const SEARCH_FIELDS = ["all", "name", "painter", "source", "notes"] as const
export type SearchField = (typeof SEARCH_FIELDS)[number]

export const LIBRARY_VIEWS = ["photos", "collection", "table"] as const
export type LibraryViewMode = (typeof LIBRARY_VIEWS)[number]

export const PHOTO_PAGE_SIZE = 24

export function parseSearchField(value?: string | null): SearchField {
  return SEARCH_FIELDS.includes(value as SearchField) ? (value as SearchField) : "all"
}

export function parseLibraryView(value?: string | null): LibraryViewMode {
  return LIBRARY_VIEWS.includes(value as LibraryViewMode)
    ? (value as LibraryViewMode)
    : "photos"
}

export function searchFieldLabel(field: SearchField): string {
  switch (field) {
    case "name":
      return "Name"
    case "painter":
      return "Painter"
    case "source":
      return "Source"
    case "notes":
      return "Notes"
    default:
      return "All fields"
  }
}

export function likeNeedle(q: string): string {
  return `%${q.replaceAll("%", "").replaceAll("_", "")}%`
}
