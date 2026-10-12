import { NextResponse } from "next/server"

import { ensureDb } from "@/lib/db"
import { readPhotoFile } from "@/lib/images"
import { getPhotoById } from "@/lib/miniatures"

const VARIANTS = new Set(["original", "thumb", "display"])

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; variant: string }> }
) {
  const { id, variant } = await context.params
  if (!VARIANTS.has(variant)) {
    return NextResponse.json({ error: "Unknown variant" }, { status: 404 })
  }

  await ensureDb()
  const photo = await getPhotoById(id)
  if (!photo) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  try {
    const body = await readPhotoFile(
      id,
      variant as "original" | "thumb" | "display"
    )
    const contentType =
      variant === "original" ? photo.mimeType : "image/webp"
    return new NextResponse(Uint8Array.from(body), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Disposition":
          variant === "original"
            ? `inline; filename="${encodeURIComponent(photo.originalFilename)}"`
            : "inline",
      },
    })
  } catch {
    return NextResponse.json({ error: "File missing" }, { status: 404 })
  }
}
