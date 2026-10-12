import { afterEach, describe, expect, it } from "vitest"

import { wipeVaultForTests } from "@/lib/db"
import {
  countGalleryPhotos,
  createMiniature,
  listGalleryPhotosPage,
  listMiniatures,
} from "@/lib/miniatures"

async function tinyPng(): Promise<File> {
  const sharp = (await import("sharp")).default
  const bytes = await sharp({
    create: { width: 64, height: 80, channels: 3, background: { r: 90, g: 60, b: 30 } },
  })
    .png()
    .toBuffer()
  return new File([bytes], "plate.png", { type: "image/png" })
}

afterEach(() => {
  wipeVaultForTests()
})

describe("field-scoped search", () => {
  it("finds a name hit only when searching name or all fields", async () => {
    const file = await tinyPng()
    await createMiniature(
      {
        name: "Sir Aldric the Oathbound",
        painterName: "Mira Thorne",
        notes: "NMM gold on the trim",
      },
      [file],
      0
    )
    await createMiniature(
      {
        name: "Ashscale Wyrmling",
        painterName: "Kael Voss",
        notes: "rim light on the wings",
      },
      [file],
      0
    )

    const byName = await listMiniatures({ q: "Aldric", field: "name" })
    expect(byName.map((row) => row.name)).toEqual(["Sir Aldric the Oathbound"])

    const byPainter = await listMiniatures({ q: "Aldric", field: "painter" })
    expect(byPainter).toHaveLength(0)

    const byNotes = await listMiniatures({ q: "rim light", field: "notes" })
    expect(byNotes.map((row) => row.name)).toEqual(["Ashscale Wyrmling"])

    const all = await listMiniatures({ q: "gold", field: "all" })
    expect(all.map((row) => row.name)).toEqual(["Sir Aldric the Oathbound"])
  })
})

describe("newest-first pagination", () => {
  it("returns later photographs first and continues from the cursor", async () => {
    const file = await tinyPng()
    await createMiniature({ name: "Oldest", painterName: "A" }, [file], 0)
    await new Promise((resolve) => setTimeout(resolve, 25))
    await createMiniature({ name: "Middle", painterName: "B" }, [file], 0)
    await new Promise((resolve) => setTimeout(resolve, 25))
    await createMiniature({ name: "Newest", painterName: "C" }, [file], 0)

    const first = await listGalleryPhotosPage({ limit: 2 })
    expect(first.photos.map((photo) => photo.miniatureName)).toEqual([
      "Newest",
      "Middle",
    ])
    expect(first.nextCursor).toBeTruthy()

    const second = await listGalleryPhotosPage({
      limit: 2,
      cursor: first.nextCursor ?? undefined,
    })
    expect(second.photos.map((photo) => photo.miniatureName)).toEqual(["Oldest"])
    expect(second.nextCursor).toBeNull()

    expect(await countGalleryPhotos()).toBe(3)
  })
})
