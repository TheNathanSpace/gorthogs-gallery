import { describe, expect, it } from "vitest"

import {
  isNextBuildPhase,
  productionConfigErrors,
  publicSiteIsHttps,
} from "@/lib/config"

describe("fail-closed production config", () => {
  it("rejects a missing or placeholder AUTH_SECRET", () => {
    const errors = productionConfigErrors({
      AUTH_SECRET: "change-me-to-a-long-random-string",
    })
    expect(errors.some((row) => row.includes("AUTH_SECRET"))).toBe(true)
    expect(
      productionConfigErrors({
        AUTH_SECRET: "replace-me--openssl-rand-base64-48",
      }).some((row) => row.includes("AUTH_SECRET"))
    ).toBe(true)
  })

  it("does not require a password in the environment", () => {
    const errors = productionConfigErrors({
      AUTH_SECRET: "a-sufficiently-long-random-secret",
    })
    expect(errors.some((row) => row.includes("PASSWORD"))).toBe(false)
  })

  it("rejects an insecure cookie when the public site is HTTPS", () => {
    const env = {
      AUTH_SECRET: "a-sufficiently-long-random-secret",
      PUBLIC_BASE_URL: "https://minis.example.com",
      AUTH_COOKIE_SECURE: "false",
    }
    expect(publicSiteIsHttps(env)).toBe(true)
    const errors = productionConfigErrors(env)
    expect(errors.some((row) => row.includes("AUTH_COOKIE_SECURE"))).toBe(true)
  })

  it("accepts a hardened production env without ADMIN_PASSWORD", () => {
    const errors = productionConfigErrors({
      AUTH_SECRET: "a-sufficiently-long-random-secret",
      PUBLIC_BASE_URL: "https://minis.example.com",
      AUTH_COOKIE_SECURE: "true",
    })
    expect(errors).toEqual([])
  })

  it("does not treat a Next.js build phase as runtime", () => {
    expect(
      isNextBuildPhase({ NEXT_PHASE: "phase-production-build" })
    ).toBe(true)
  })
})
