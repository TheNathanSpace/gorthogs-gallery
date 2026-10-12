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
  it("rejects a short key, changeme, and a mismatch", () => {
    expect(passwordIssues("short")).toContain("passwordTooShort")
    expect(passwordIssues(BOOTSTRAP_PASSWORD)).toContain("passwordStillBootstrap")
    expect(passwordIssues("a-lasting-key", "other-key")).toContain("passwordMismatch")
    expect(passwordIssues("a-lasting-key", "a-lasting-key")).toEqual([])
  })

  it("round-trips a scrypt hash", async () => {
    const stored = await hashPassword("a-lasting-key")
    expect(stored.startsWith("scrypt:")).toBe(true)
    expect(await verifyPasswordHash("a-lasting-key", stored)).toBe(true)
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

    await setKeeperPassword("a-lasting-key")

    const after = await verifyCredentials("admin", "a-lasting-key")
    expect(after).toEqual({ ok: true, mustSetPassword: false })
    expect(await verifyCredentials("admin", BOOTSTRAP_PASSWORD)).toEqual({
      ok: false,
      mustSetPassword: false,
    })
  })
})
