import "server-only"

import { mkdir, readFile, rm, writeFile } from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

import {
  DISPLAY_MAX_EDGE,
  MAX_UPLOAD_BYTES,
  MEDIA_DIR,
  THUMB_MAX_EDGE,
} from "@/lib/config"

const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp", "gif", "tiff"])

export type ProcessedImage = {
  original: Buffer
  thumb: Buffer
  display: Buffer
  width: number
  height: number
  mimeType: string
  format: string
}

export function photoDir(photoId: string): string {
  return path.join(MEDIA_DIR, photoId)
}

export function photoPath(
  photoId: string,
  variant: "original" | "thumb" | "display"
): string {
  if (variant === "original") return path.join(photoDir(photoId), "original")
  return path.join(photoDir(photoId), `${variant}.webp`)
}

export async function processUpload(file: File): Promise<ProcessedImage> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `“${file.name}” is larger than the ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)}MB upload limit.`
    )
  }

  const original = Buffer.from(await file.arrayBuffer())
  const meta = await sharp(original, { failOn: "none" }).rotate().metadata()
  const format = meta.format ?? ""
  if (!ALLOWED_FORMATS.has(format)) {
    throw new Error(
      `“${file.name}” is not a supported image. Use JPEG, PNG, WebP, GIF, or TIFF.`
    )
  }

  const width = meta.width ?? 0
  const height = meta.height ?? 0
  if (width < 32 || height < 32) {
    throw new Error(`“${file.name}” is too small to use in the gallery.`)
  }

  const mimeType = mimeFor(format)
  const display = await sharp(original, { failOn: "none" })
    .rotate()
    .resize({
      width: DISPLAY_MAX_EDGE,
      height: DISPLAY_MAX_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 86 })
    .toBuffer()

  const thumb = await sharp(original, { failOn: "none" })
    .rotate()
    .resize({
      width: THUMB_MAX_EDGE,
      height: THUMB_MAX_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 78 })
    .toBuffer()

  return { original, thumb, display, width, height, mimeType, format }
}

export async function writePhotoFiles(
  photoId: string,
  image: ProcessedImage
): Promise<void> {
  const dir = photoDir(photoId)
  await mkdir(dir, { recursive: true })
  await writeFile(photoPath(photoId, "original"), image.original)
  await writeFile(photoPath(photoId, "thumb"), image.thumb)
  await writeFile(photoPath(photoId, "display"), image.display)
}

export async function readPhotoFile(
  photoId: string,
  variant: "original" | "thumb" | "display"
): Promise<Buffer> {
  return readFile(photoPath(photoId, variant))
}

export async function deletePhotoFiles(photoId: string): Promise<void> {
  await rm(photoDir(photoId), { recursive: true, force: true })
}

function mimeFor(format: string): string {
  switch (format) {
    case "jpeg":
      return "image/jpeg"
    case "png":
      return "image/png"
    case "webp":
      return "image/webp"
    case "gif":
      return "image/gif"
    case "tiff":
      return "image/tiff"
    default:
      return "application/octet-stream"
  }
}
