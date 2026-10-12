import { createHash } from "node:crypto"

import { logWarn } from "@/lib/log"

const RANGE_URL = "https://api.pwnedpasswords.com/range/"
const TIMEOUT_MS = 3000

function pwnedPasswordsEnabled(): boolean {
  const value = process.env.PWNED_PASSWORDS
  if (value === undefined || value === "") return true
  return ["1", "true", "yes", "on"].includes(value.toLowerCase())
}

export function sha1Hex(value: string): string {
  return createHash("sha1").update(value, "utf8").digest("hex").toUpperCase()
}

export function rangeContainsSuffix(body: string, suffix: string): boolean {
  const needle = suffix.toUpperCase()
  for (const line of body.split(/\r?\n/)) {
    if (!line) continue
    const [hashSuffix, count] = line.split(":")
    if (!hashSuffix || count === "0") continue
    if (hashSuffix.toUpperCase() === needle) return true
  }
  return false
}

export async function isBreachedPassword(password: string): Promise<boolean> {
  if (!pwnedPasswordsEnabled()) return false
  const digest = sha1Hex(password)
  const prefix = digest.slice(0, 5)
  const suffix = digest.slice(5)
  try {
    const response = await fetch(`${RANGE_URL}${prefix}`, {
      headers: {
        "User-Agent": "Reliquary/0.1 (painted miniature vault)",
        "Add-Padding": "true",
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    })
    if (!response.ok) {
      logWarn("pwned-passwords unavailable", { status: response.status })
      return false
    }
    const body = await response.text()
    return rangeContainsSuffix(body, suffix)
  } catch (error) {
    logWarn("pwned-passwords unavailable", {
      reason: error instanceof Error ? error.name : "error",
    })
    return false
  }
}
