import { describe, expect, it } from "vitest"

import { processUpload } from "@/lib/images"

describe("rejected uploads", () => {
  it("rejects a file that is not an image", async () => {
    const file = new File([Buffer.from("not-an-image")], "notes.txt", {
      type: "text/plain",
    })
    await expect(processUpload(file)).rejects.toThrow(/supported image/i)
  })

  it("rejects an image that is too small", async () => {
    const sharp = (await import("sharp")).default
    const bytes = await sharp({
      create: { width: 8, height: 8, channels: 3, background: { r: 10, g: 10, b: 10 } },
    })
      .png()
      .toBuffer()
    const file = new File([bytes], "tiny.png", { type: "image/png" })
    await expect(processUpload(file)).rejects.toThrow(/too small/i)
  })

  it("rejects a file over the upload cap", async () => {
    const oversized = Buffer.alloc(21 * 1024 * 1024, 1)
    const file = new File([oversized], "huge.bin", { type: "application/octet-stream" })
    await expect(processUpload(file)).rejects.toThrow(/upload limit/i)
  })
})
