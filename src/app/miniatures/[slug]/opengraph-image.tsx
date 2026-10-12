import { readFile } from "node:fs/promises"
import { ImageResponse } from "next/og"

import { SITE_TITLE } from "@/lib/config"
import { photoPath } from "@/lib/images"
import { getMiniatureBySlug } from "@/lib/miniatures"
import { coverOf } from "@/lib/urls"

export const runtime = "nodejs"
export const alt = SITE_TITLE
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function MiniatureOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const miniature = await getMiniatureBySlug(slug)
  const cover = miniature ? coverOf(miniature.photos) : undefined
  let imageSrc: string | undefined
  if (cover) {
    try {
      const bytes = await readFile(photoPath(cover.id, "display"))
      imageSrc = `data:image/webp;base64,${bytes.toString("base64")}`
    } catch {
      imageSrc = undefined
    }
  }

  const name = miniature?.name ?? SITE_TITLE
  const painter = miniature?.painterName ?? ""

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#14110e",
          color: "#f3e6c8",
        }}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt=""
            style={{ width: "58%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "58%",
              height: "100%",
              background: "linear-gradient(160deg, #2a2118, #1a2418)",
            }}
          />
        )}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: 48,
            gap: 18,
          }}
        >
          <div style={{ fontSize: 18, letterSpacing: 6, textTransform: "uppercase", color: "#d4b36a" }}>
            {SITE_TITLE}
          </div>
          <div style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.1 }}>{name}</div>
          {painter ? (
            <div style={{ fontSize: 24, color: "#c9b894" }}>Painted by {painter}</div>
          ) : null}
        </div>
      </div>
    ),
    size
  )
}
