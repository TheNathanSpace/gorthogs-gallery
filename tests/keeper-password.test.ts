import { afterEach, describe, expect, it } from "vitest"

import { wipeVaultForTests } from "@/lib/db"
import { setKeeperPassword, verifyCredentials } from "@/lib/keepers"
import {
  BOOTSTRAP_PASSWORD,
  hashPassword,
  passwordIssues,
  verifyPasswordHash,
} from "@/lib/password"

afterEach(() => {
  wipeVaultForTests()
})

describe("password rules", () => {
  it("rejects short keys, expected values, common passwords, and mismatches", () => {
    expect(passwordIssues("fourteenchars!")).toContain("passwordTooShort")
    expect(passwordIssues(BOOTSTRAP_PASSWORD)).toContain("passwordTooShort")
    expect(passwordIssues("adminadminadmin")).toContain("passwordExpected")
    expect(passwordIssues("passwordpassword")).toContain("passwordCommon")
    expect(
      passwordIssues("a-lasting-vault-key", "other-lasting-key")
    ).toContain("passwordMismatch")
    expect(
      passwordIssues("a-lasting-vault-key", "a-lasting-vault-key")
    ).toEqual([])
  })

  it("round-trips a scrypt hash", async () => {
    const stored = await hashPassword("a-lasting-vault-key")
    expect(stored.startsWith("scrypt:")).toBe(true)
    expect(await verifyPasswordHash("a-lasting-vault-key", stored)).toBe(true)
    expect(await verifyPasswordHash("wrong-key", stored)).toBe(false)
  })
})

describe("first-login bootstrap", () => {
  it("accepts changeme only until a lasting key is stored in the vault", async () => {
    const before = await verifyCredentials("admin", BOOTSTRAP_PASSWORD)
    expect(before).toEqual({ ok: true, mustSetPassword: true })

    expect(await verifyCredentials("admin", "not-the-starter")).toEqual({
      ok: false,
      mustSetPassword: true,
    })

    await setKeeperPassword("a-lasting-vault-key")

    const after = await verifyCredentials("admin", "a-lasting-vault-key")
    expect(after).toEqual({ ok: true, mustSetPassword: false })
    expect(await verifyCredentials("admin", BOOTSTRAP_PASSWORD)).toEqual({
      ok: false,
      mustSetPassword: false,
    })
  })
})
