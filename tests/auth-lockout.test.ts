import { describe, expect, it } from "vitest"

import { allowLoginAttempt, clearLoginAttempts } from "@/lib/auth"

describe("login lockout", () => {
  it("allows a burst then refuses further attempts from the same key", () => {
    const key = `lockout-${crypto.randomUUID()}`
    const results: boolean[] = []
    for (let i = 0; i < 10; i += 1) {
      results.push(allowLoginAttempt(key))
    }
    const allowed = results.filter(Boolean).length
    const blocked = results.filter((ok) => !ok).length
    expect(allowed).toBe(8)
    expect(blocked).toBe(2)
    expect(results[8]).toBe(false)
  })

  it("resets after a successful clear", () => {
    const key = `lockout-${crypto.randomUUID()}`
    for (let i = 0; i < 9; i += 1) allowLoginAttempt(key)
    expect(allowLoginAttempt(key)).toBe(false)
    clearLoginAttempts(key)
    expect(allowLoginAttempt(key)).toBe(true)
  })
})
