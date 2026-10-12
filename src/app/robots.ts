import type { MetadataRoute } from "next"

import { publicBaseUrl } from "@/lib/site-url"

export default function robots(): MetadataRoute.Robots {
  const base = publicBaseUrl()
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/login", "/api/"],
    },
    sitemap: base ? `${base}/sitemap.xml` : undefined,
  }
}
