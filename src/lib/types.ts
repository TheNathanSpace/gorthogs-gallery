export type GalleryPhoto = {
  id: string
  miniatureId: string
  originalFilename: string
  mimeType: string
  width: number
  height: number
  sortOrder: number
  isCover: boolean
  createdAt: Date
  miniatureName: string
  miniatureSlug: string
  painterName: string
  sourceName: string | null
  sourceUrl: string | null
}
