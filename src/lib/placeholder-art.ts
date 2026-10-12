type PlaceholderSpec = {
  title: string
  subtitle: string
  width: number
  height: number
  hue: number
  silhouette: "knight" | "dragon" | "mage" | "generic"
}

function silhouettePath(kind: PlaceholderSpec["silhouette"]): string {
  switch (kind) {
    case "knight":
      return "M180 40 l18 22 -8 10 14 8 -6 26 22 18 -12 42 -28 8 v36 l-20 48 -18-48 v-36 l-28-8 -12-42 22-18 -6-26 14-8 -8-10 z"
    case "dragon":
      return "M40 120 c40-50 90-40 110-10 18-28 48-38 78-20 8 4 40-18 54-6 -20 22-18 40 6 62 20 18 16 48-8 54 -30 8-58-10-70-28 -8 22-28 48-62 52 -40 4-70-24-80-54 -8-22 4-40 20-48z"
    case "mage":
      return "M160 28 l36 18 -10 14 8 70 -34 12 -12 78 -22 0 -12-78 -34-12 8-70 -10-14 z M126 210 h68 l-8 70 h-52z"
    default:
      return "M150 50 h40 v40 h40 v40 h-40 v80 h-40 v-80 h-40 v-40 h40z"
  }
}

export function placeholderSvg(spec: PlaceholderSpec): Buffer {
  const { title, subtitle, width, height, hue, silhouette } = spec
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <radialGradient id="glow" cx="50%" cy="42%" r="55%">
      <stop offset="0%" stop-color="hsl(${hue}, 42%, 38%)" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="hsl(${hue + 20}, 28%, 8%)" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="table" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="hsl(28, 22%, 16%)"/>
      <stop offset="100%" stop-color="hsl(24, 30%, 8%)"/>
    </linearGradient>
    <pattern id="grain" width="80" height="80" patternUnits="userSpaceOnUse">
      <circle cx="8" cy="12" r="0.8" fill="#fff" opacity="0.07"/>
      <circle cx="40" cy="30" r="0.6" fill="#fff" opacity="0.05"/>
      <circle cx="64" cy="52" r="0.7" fill="#000" opacity="0.12"/>
      <circle cx="22" cy="68" r="0.5" fill="#fff" opacity="0.04"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#table)"/>
  <rect width="100%" height="100%" fill="url(#glow)"/>
  <rect width="100%" height="100%" fill="url(#grain)"/>
  <ellipse cx="${width / 2}" cy="${height * 0.78}" rx="${width * 0.22}" ry="${height * 0.06}" fill="#1a120c" opacity="0.7"/>
  <g transform="translate(${width / 2 - 160} ${height / 2 - 170}) scale(${Math.min(width, height) / 420})">
    <path d="${silhouettePath(silhouette)}" fill="hsl(${hue}, 35%, 72%)" opacity="0.92"/>
    <path d="${silhouettePath(silhouette)}" fill="none" stroke="hsl(${hue + 30}, 55%, 82%)" stroke-width="3" opacity="0.4"/>
  </g>
  <rect x="24" y="24" width="${width - 48}" height="${height - 48}" fill="none" stroke="hsl(${hue + 25}, 50%, 70%)" stroke-opacity="0.35" stroke-width="2"/>
  <text x="50%" y="${height - 64}" text-anchor="middle" font-family="Georgia, serif" font-size="${Math.max(22, Math.round(width / 22))}" fill="#f4e6c3">${escapeXml(title)}</text>
  <text x="50%" y="${height - 34}" text-anchor="middle" font-family="Georgia, serif" font-size="${Math.max(14, Math.round(width / 36))}" fill="#c9b48a">${escapeXml(subtitle)}</text>
  <text x="50%" y="52" text-anchor="middle" font-family="Georgia, serif" font-size="14" letter-spacing="4" fill="#e6d2a3" opacity="0.7">PLACEHOLDER PHOTO</text>
</svg>`
  return Buffer.from(svg)
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}
