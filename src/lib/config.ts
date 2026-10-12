import path from "node:path"

function read(name: string, fallback?: string): string {
  const value = process.env[name]
  if (value !== undefined && value !== "") return value
  if (fallback !== undefined) return fallback
  return ""
}

function readBool(name: string, fallback: boolean): boolean {
  const value = process.env[name]
  if (value === undefined || value === "") return fallback
  return ["1", "true", "yes", "on"].includes(value.toLowerCase())
}

export const SITE_TITLE = read("SITE_TITLE", "The Reliquary")
export const SITE_TAGLINE = read(
  "SITE_TAGLINE",
  "A vault of painted miniatures"
)

export const ADMIN_USERNAME = read("ADMIN_USERNAME", "admin")
export const ADMIN_PASSWORD = read("ADMIN_PASSWORD", "changeme")

export const DATA_DIR = path.resolve(read("DATA_DIR", "./data"))
export const DB_PATH = path.join(DATA_DIR, "reliquary.sqlite")
export const MEDIA_DIR = path.join(DATA_DIR, "media")

export const SEED_DEMO = readBool("SEED_DEMO", true)

export const MAX_UPLOAD_BYTES = Number(read("MAX_UPLOAD_BYTES", String(20 * 1024 * 1024)))
export const DISPLAY_MAX_EDGE = Number(read("DISPLAY_MAX_EDGE", "2400"))
export const THUMB_MAX_EDGE = Number(read("THUMB_MAX_EDGE", "640"))

