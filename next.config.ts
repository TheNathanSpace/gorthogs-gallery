import type { NextConfig } from "next"

import { securityHeaders } from "./src/lib/security-headers"

const nextConfig: NextConfig = {
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  allowedDevOrigins: ["127.0.0.1"],
  serverExternalPackages: ["better-sqlite3", "sharp"],
  experimental: {
    serverActions: {
      bodySizeLimit: "32mb",
      allowedOrigins: process.env.SERVER_ACTION_ORIGINS
        ? process.env.SERVER_ACTION_ORIGINS.split(",")
            .map((origin) => origin.trim())
            .filter(Boolean)
        : undefined,
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ]
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
}

export default nextConfig
