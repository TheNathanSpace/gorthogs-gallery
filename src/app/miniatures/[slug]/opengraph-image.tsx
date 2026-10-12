import { readFile } from "node:fs/promises"
import { ImageResponse } from "next/og"

import { SITE_TITLE } from "@/lib/config"
import { photoPath } from "@/lib/images"
import { getMiniatureBySlug } from "@/lib/miniatures"
import { coverOf } from "@/lib/urls"

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
  const painter = miniature?.painterName ? `Painted by ${miniature.painterName}` : ""

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          background: "#14110e",
          color: "#f3e6c8",
        }}
      >
        <div
          style={{
            width: "58%",
            height: "100%",
            display: "flex",
            background: "linear-gradient(160deg, #2a2118, #1a2418)",
          }}
        >
          {imageSrc ? (
            <img
              src={imageSrc}
              alt=""
              width={696}
              height={630}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : null}
        </div>
        <div
          style={{
            width: "42%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: 48,
          }}
        >
          <div style={{ display: "flex", fontSize: 18, letterSpacing: 6, color: "#d4b36a" }}>
            {SITE_TITLE}
          </div>
          <div style={{ display: "flex", fontSize: 48, fontWeight: 700, marginTop: 18 }}>
            {name}
          </div>
          <div style={{ display: "flex", fontSize: 24, color: "#c9b894", marginTop: 18 }}>
            {painter}
          </div>
        </div>
      </div>
    ),
    size
  )
}
