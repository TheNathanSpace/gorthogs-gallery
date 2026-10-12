import { afterEach, describe, expect, it, vi } from "vitest"

import { evaluatePassword } from "@/lib/password"
import {
  isBreachedPassword,
  rangeContainsSuffix,
  sha1Hex,
} from "@/lib/pwned-passwords"

afterEach(() => {
  vi.unstubAllGlobals()
  process.env.PWNED_PASSWORDS = "false"
})

describe("HIBP range matching", () => {
  it("matches a suffix and ignores padding rows with count 0", () => {
    const body = [
      "0018A45C4D1DEF81644B54AB7F969B88D65:1",
      "00D4F6E8FA6EECAD2A3AA415EEC418D38EC:0",
      "1E4C9B93F3F0682250B6CF8331B7EE68FD8:3303003",
    ].join("\n")
    expect(rangeContainsSuffix(body, "1E4C9B93F3F0682250B6CF8331B7EE68FD8")).toBe(
      true
    )
    expect(rangeContainsSuffix(body, "00D4F6E8FA6EECAD2A3AA415EEC418D38EC")).toBe(
      false
    )
    expect(rangeContainsSuffix(body, "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF")).toBe(
      false
    )
  })
})

describe("breached-password lookup", () => {
  it("does not call the network when PWNED_PASSWORDS is off", async () => {
    process.env.PWNED_PASSWORDS = "false"
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    expect(await isBreachedPassword("orange-maple-kettle-9")).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("treats a matching HIBP suffix as breached without sending the password", async () => {
    process.env.PWNED_PASSWORDS = "true"
    const password = "orange-maple-kettle-9"
    const digest = sha1Hex(password)
    const prefix = digest.slice(0, 5)
    const suffix = digest.slice(5)
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      expect(String(input)).toBe(`https://api.pwnedpasswords.com/range/${prefix}`)
      return new Response(`${suffix}:12\n00D4F6E8FA6EECAD2A3AA415EEC418D38EC:0\n`, {
        status: 200,
      })
    })
    vi.stubGlobal("fetch", fetchMock)
    expect(await isBreachedPassword(password)).toBe(true)
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it("fails open when the range API is unreachable", async () => {
    process.env.PWNED_PASSWORDS = "true"
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("offline")
    }))
    expect(await isBreachedPassword("orange-maple-kettle-9")).toBe(false)
  })

  it("surfaces a pwned issue only after local rules pass", async () => {
    process.env.PWNED_PASSWORDS = "true"
    const password = "orange-maple-kettle-9"
    const digest = sha1Hex(password)
    const suffix = digest.slice(5)
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(`${suffix}:1\n`, { status: 200 }))
    )
    expect(await evaluatePassword(password, password)).toEqual(["passwordPwned"])
    expect(await evaluatePassword("passwordpassword")).toEqual(["passwordCommon"])
  })
})
