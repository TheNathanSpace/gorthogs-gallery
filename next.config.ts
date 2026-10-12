import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
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
