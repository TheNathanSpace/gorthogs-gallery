import { NextResponse } from "next/server"

import { listGalleryPhotosPage } from "@/lib/miniatures"
import { parseSearchField, PHOTO_PAGE_SIZE } from "@/lib/search"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const q = url.searchParams.get("q")?.trim() || undefined
  const field = parseSearchField(url.searchParams.get("field"))
  const cursor = url.searchParams.get("cursor") || undefined
  const limitRaw = Number(url.searchParams.get("limit") ?? PHOTO_PAGE_SIZE)
  const limit = Number.isFinite(limitRaw) ? limitRaw : PHOTO_PAGE_SIZE

  const page = await listGalleryPhotosPage({ q, field, cursor, limit })
  return NextResponse.json({
    nextCursor: page.nextCursor,
    photos: page.photos.map((photo) => ({
      ...photo,
      createdAt: photo.createdAt.toISOString(),
    })),
  })
}
