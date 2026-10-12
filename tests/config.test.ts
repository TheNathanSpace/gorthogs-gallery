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
      ADMIN_PASSWORD: "a-real-password",
    })
    expect(errors.some((row) => row.includes("AUTH_SECRET"))).toBe(true)
  })

  it("rejects the default changeme password", () => {
    const errors = productionConfigErrors({
      AUTH_SECRET: "a-sufficiently-long-random-secret",
      ADMIN_PASSWORD: "changeme",
    })
    expect(errors.some((row) => row.includes("ADMIN_PASSWORD"))).toBe(true)
  })

  it("rejects an insecure cookie when the public site is HTTPS", () => {
    const env = {
      AUTH_SECRET: "a-sufficiently-long-random-secret",
      ADMIN_PASSWORD: "a-real-password",
      PUBLIC_BASE_URL: "https://minis.example.com",
      AUTH_COOKIE_SECURE: "false",
    }
    expect(publicSiteIsHttps(env)).toBe(true)
    const errors = productionConfigErrors(env)
    expect(errors.some((row) => row.includes("AUTH_COOKIE_SECURE"))).toBe(true)
  })

  it("accepts a hardened production env", () => {
    const errors = productionConfigErrors({
      AUTH_SECRET: "a-sufficiently-long-random-secret",
      ADMIN_PASSWORD: "a-real-password",
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
