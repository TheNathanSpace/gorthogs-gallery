import { ADMIN_USERNAME, SITE_TITLE } from "@/lib/config"
import { COMMON_PASSWORDS_TEXT } from "@/lib/common-passwords"

export const BOOTSTRAP_PASSWORD = "changeme"
export const MIN_PASSWORD_LENGTH = 15
export const MAX_PASSWORD_LENGTH = 256

export type PasswordIssue =
  | "passwordTooShort"
  | "passwordTooLong"
  | "passwordStillBootstrap"
  | "passwordMismatch"
  | "passwordExpected"
  | "passwordCommon"
  | "passwordPwned"

const commonPasswords: ReadonlySet<string> = new Set(
  COMMON_PASSWORDS_TEXT.split("\n").filter(Boolean)
)

function fold(value: string): string {
  return value.trim().toLowerCase()
}

function expectedPasswords(): Set<string> {
  const values = new Set<string>()
  const seeds = [
    BOOTSTRAP_PASSWORD,
    ADMIN_USERNAME,
    SITE_TITLE,
    SITE_TITLE.replace(/\s+/g, ""),
    SITE_TITLE.replace(/[^a-zA-Z0-9]+/g, ""),
    "reliquary",
  ]
  for (const seed of seeds) {
    const base = fold(seed)
    if (!base) continue
    values.add(base)
    let repeated = base
    while (repeated.length < MIN_PASSWORD_LENGTH) repeated += base
    values.add(repeated)
  }
  return values
}

export function passwordIssues(
  password: string,
  confirm?: string
): PasswordIssue[] {
  const issues: PasswordIssue[] = []
  if (password.length < MIN_PASSWORD_LENGTH) issues.push("passwordTooShort")
  if (password.length > MAX_PASSWORD_LENGTH) issues.push("passwordTooLong")
  if (confirm !== undefined && password !== confirm) issues.push("passwordMismatch")
  if (issues.length > 0) return issues

  const folded = fold(password)
  if (folded === BOOTSTRAP_PASSWORD) issues.push("passwordStillBootstrap")
  if (expectedPasswords().has(folded)) issues.push("passwordExpected")
  if (commonPasswords.has(folded)) issues.push("passwordCommon")
  return issues
}

export function isCommonPassword(password: string): boolean {
  return commonPasswords.has(fold(password))
}
