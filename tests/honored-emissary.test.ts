import { sql } from "drizzle-orm"
import { afterEach, describe, expect, it } from "vitest"

import { getDb, wipeVaultForTests } from "@/lib/db"
import { getHonoredEmissary, setHonoredEmissary } from "@/lib/honored"
import { createMiniature, deleteMiniature } from "@/lib/miniatures"
import { honoredEmissary } from "@/lib/schema"

async function tinyPng(): Promise<File> {
  const sharp = (await import("sharp")).default
  const bytes = await sharp({
    create: { width: 64, height: 80, channels: 3, background: { r: 40, g: 70, b: 90 } },
  })
    .png()
    .toBuffer()
  return new File([bytes], "plate.png", { type: "image/png" })
}

function honorRows(): number {
  const row = getDb()
    .select({ n: sql<number>`count(*)` })
    .from(honoredEmissary)
    .get()
  return Number(row?.n ?? 0)
}

afterEach(() => {
  wipeVaultForTests()
})

describe("honored emissary", () => {
  it("names one miniature, clears it, then names another", async () => {
    const file = await tinyPng()
    const first = await createMiniature({ name: "First Banner", painterName: "Ada" }, [file], 0)
    const second = await createMiniature({ name: "Second Banner", painterName: "Bea" }, [file], 0)

    expect(await getHonoredEmissary()).toBeNull()

    const named = await setHonoredEmissary(first.id)
    expect(named).toMatchObject({ ok: true, nextSlug: first.slug })
    expect((await getHonoredEmissary())?.id).toBe(first.id)

    const replaced = await setHonoredEmissary(second.id)
    expect(replaced).toMatchObject({
      ok: true,
      previousSlug: first.slug,
      nextSlug: second.slug,
    })
    expect((await getHonoredEmissary())?.name).toBe("Second Banner")
    expect(honorRows()).toBe(1)

    const cleared = await setHonoredEmissary(null)
    expect(cleared).toMatchObject({ ok: true, previousSlug: second.slug, nextSlug: null })
    expect(await getHonoredEmissary()).toBeNull()

    await setHonoredEmissary(first.id)
    expect((await getHonoredEmissary())?.name).toBe("First Banner")
    expect(honorRows()).toBe(1)
  })

  it("refuses an unknown miniature and clears the honor when that miniature is deleted", async () => {
    const file = await tinyPng()
    const kept = await createMiniature({ name: "Kept", painterName: "Ada" }, [file], 0)
    const doomed = await createMiniature({ name: "Doomed", painterName: "Bea" }, [file], 0)

    expect(await setHonoredEmissary("not-in-the-vault")).toEqual({
      ok: false,
      reason: "missing",
    })
    expect(await getHonoredEmissary()).toBeNull()

    await setHonoredEmissary(doomed.id)
    await deleteMiniature(doomed.id)
    expect(await getHonoredEmissary()).toBeNull()

    await setHonoredEmissary(kept.id)
    expect((await getHonoredEmissary())?.id).toBe(kept.id)
  })
})
