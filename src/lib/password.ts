import { randomBytes, scrypt, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"

import {
  BOOTSTRAP_PASSWORD,
  passwordIssues,
  type PasswordIssue,
} from "@/lib/password-policy"
import { isBreachedPassword } from "@/lib/pwned-passwords"

const scryptAsync = promisify(scrypt)

export {
  BOOTSTRAP_PASSWORD,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  passwordIssues,
  type PasswordIssue,
} from "@/lib/password-policy"

export async function evaluatePassword(
  password: string,
  confirm?: string
): Promise<PasswordIssue[]> {
  const issues = passwordIssues(password, confirm)
  if (issues.length > 0) return issues
  if (await isBreachedPassword(password)) return ["passwordPwned"]
  return []
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
