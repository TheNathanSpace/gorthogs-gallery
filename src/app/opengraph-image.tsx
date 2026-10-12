import { ImageResponse } from "next/og"

import { SITE_TAGLINE, SITE_TITLE } from "@/lib/config"

export const alt = SITE_TITLE
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(160deg, #2a2118 0%, #14110e 55%, #1a2418 100%)",
          color: "#f3e6c8",
        }}
      >
        <div style={{ fontSize: 22, letterSpacing: 8, textTransform: "uppercase", color: "#d4b36a" }}>
          Painted host
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.05 }}>{SITE_TITLE}</div>
          <div style={{ fontSize: 28, color: "#c9b894" }}>{SITE_TAGLINE}</div>
        </div>
      </div>
    ),
    size
  )
}
