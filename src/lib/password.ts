import { randomBytes, scrypt, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"

const scryptAsync = promisify(scrypt)

export const BOOTSTRAP_PASSWORD = "changeme"
export const MIN_PASSWORD_LENGTH = 10

export type PasswordIssue =
  | "passwordTooShort"
  | "passwordStillBootstrap"
  | "passwordMismatch"

export function passwordIssues(
  password: string,
  confirm?: string
): PasswordIssue[] {
  const issues: PasswordIssue[] = []
  if (password.length < MIN_PASSWORD_LENGTH) issues.push("passwordTooShort")
  if (password.toLowerCase() === BOOTSTRAP_PASSWORD) {
    issues.push("passwordStillBootstrap")
  }
  if (confirm !== undefined && password !== confirm) issues.push("passwordMismatch")
  return issues
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const key = (await scryptAsync(password, salt, 64)) as Buffer
  return `scrypt:${salt.toString("hex")}:${key.toString("hex")}`
}

export async function verifyPasswordHash(
  password: string,
  stored: string
): Promise<boolean> {
  const [scheme, saltHex, hashHex] = stored.split(":")
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false
  const salt = Buffer.from(saltHex, "hex")
  const expected = Buffer.from(hashHex, "hex")
  const key = (await scryptAsync(password, salt, 64)) as Buffer
  if (key.length !== expected.length) return false
  return timingSafeEqual(key, expected)
}

export function matchesBootstrap(password: string): boolean {
  const left = Buffer.from(password)
  const right = Buffer.from(BOOTSTRAP_PASSWORD)
  if (left.length !== right.length) {
    timingSafeEqual(left, left)
    return false
  }
  return timingSafeEqual(left, right)
}
