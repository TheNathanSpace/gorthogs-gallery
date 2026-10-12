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

export const LOCALE = read("LOCALE", "en")
export const PUBLIC_BASE_URL = read("PUBLIC_BASE_URL").replace(/\/$/, "")
export const AUTH_COOKIE_SECURE = readBool("AUTH_COOKIE_SECURE", false)

const WEAK_SECRETS = new Set([
  "",
  "change-me-to-a-long-random-string",
  "dev-only-insecure-secret-change-me",
])

const WEAK_PASSWORDS = new Set(["", "changeme"])

export type EnvMap = Record<string, string | undefined>

function envValue(env: EnvMap, name: string): string {
  const value = env[name]
  return value === undefined ? "" : value
}

function envBool(env: EnvMap, name: string, fallback = false): boolean {
  const value = envValue(env, name)
  if (value === "") return fallback
  return ["1", "true", "yes", "on"].includes(value.toLowerCase())
}

export function publicSiteIsHttps(env: EnvMap = process.env): boolean {
  const base = envValue(env, "PUBLIC_BASE_URL").replace(/\/$/, "")
  if (!base) return false
  try {
    return new URL(base).protocol === "https:"
  } catch {
    return false
  }
}

export function isNextBuildPhase(env: EnvMap = process.env): boolean {
  const phase = envValue(env, "NEXT_PHASE")
  return (
    phase === "phase-production-build" ||
    phase === "phase-development-build" ||
    phase === "phase-production-compile"
  )
}

export function productionConfigErrors(env: EnvMap = process.env): string[] {
  const errors: string[] = []
  const secret = envValue(env, "AUTH_SECRET")
  if (WEAK_SECRETS.has(secret) || secret.length < 24) {
    errors.push(
      "AUTH_SECRET is missing, too short, or still a placeholder. Set a long random value (openssl rand -base64 48)."
    )
  }

  const password = envValue(env, "ADMIN_PASSWORD")
  if (WEAK_PASSWORDS.has(password.toLowerCase())) {
    errors.push(
      "ADMIN_PASSWORD is still the default “changeme” (or empty). Set a real keeper password."
    )
  }

  if (publicSiteIsHttps(env) && !envBool(env, "AUTH_COOKIE_SECURE", false)) {
    errors.push(
      "PUBLIC_BASE_URL is HTTPS but AUTH_COOKIE_SECURE is not true. The session cookie would be sent without Secure."
    )
  }

  const base = envValue(env, "PUBLIC_BASE_URL").replace(/\/$/, "")
  if (base) {
    try {
      const url = new URL(base)
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        errors.push("PUBLIC_BASE_URL must start with http:// or https://.")
      }
    } catch {
      errors.push("PUBLIC_BASE_URL is not a valid URL.")
    }
  }

  return errors
}

export function assertProductionConfig(env: EnvMap = process.env): void {
  if (env.NODE_ENV !== "production") return
  if (isNextBuildPhase(env)) return
  const errors = productionConfigErrors(env)
  if (errors.length === 0) return
  throw new Error(`Reliquary refused to start:\n- ${errors.join("\n- ")}`)
}
