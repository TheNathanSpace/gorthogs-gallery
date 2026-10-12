import type { MetadataRoute } from "next"

import { listMiniatures } from "@/lib/miniatures"
import { publicBaseUrl } from "@/lib/site-url"
import { miniaturePath } from "@/lib/urls"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = publicBaseUrl() ?? "http://127.0.0.1:3847"
  const entries = await listMiniatures()
  return [
    {
      url: base,
      changeFrequency: "daily",
      priority: 1,
    },
    ...entries.map((entry) => ({
      url: `${base}${miniaturePath(entry.slug)}`,
      lastModified: entry.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ]
}
