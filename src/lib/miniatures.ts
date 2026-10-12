import "server-only"

import { and, asc, desc, eq, inArray, like, lt, or, sql } from "drizzle-orm"
import { connection } from "next/server"

import { ensureDb, getDb } from "@/lib/db"
import { deletePhotoFiles, processUpload, writePhotoFiles } from "@/lib/images"
import { miniatures, photos, type Miniature, type Photo } from "@/lib/schema"
import {
  likeNeedle,
  PHOTO_PAGE_SIZE,
  type SearchField,
} from "@/lib/search"
import { slugify } from "@/lib/slug"
import type { GalleryPhoto } from "@/lib/types"

export type { GalleryPhoto } from "@/lib/types"

export type MiniatureWithPhotos = Miniature & { photos: Photo[] }

async function ready() {
  await connection()
  return ensureDb()
}

export async function listPainters(): Promise<string[]> {
  const db = await ready()
  const rows = db
    .selectDistinct({ painterName: miniatures.painterName })
    .from(miniatures)
    .orderBy(asc(miniatures.painterName))
    .all()
  return rows.map((row) => row.painterName)
}

export type LibraryFilters = {
  q?: string
  field?: SearchField
}

export async function listMiniatures(
  filters?: LibraryFilters
): Promise<MiniatureWithPhotos[]> {
  const db = await ready()
  const where = whereFilters(filters)
  const rows = where
    ? db.select().from(miniatures).where(where).orderBy(desc(miniatures.createdAt)).all()
    : db.select().from(miniatures).orderBy(desc(miniatures.createdAt)).all()
  return attachPhotos(rows)
}

export async function countMiniatures(filters?: LibraryFilters): Promise<number> {
  const db = await ready()
  const where = whereFilters(filters)
  const query = db.select({ n: sql<number>`count(*)` }).from(miniatures)
  const row = where ? query.where(where).get() : query.get()
  return Number(row?.n ?? 0)
}

export async function countGalleryPhotos(filters?: LibraryFilters): Promise<number> {
  const db = await ready()
  const where = whereFilters(filters)
  const query = db
    .select({ n: sql<number>`count(*)` })
    .from(photos)
    .innerJoin(miniatures, eq(photos.miniatureId, miniatures.id))
  const row = where ? query.where(where).get() : query.get()
  return Number(row?.n ?? 0)
}

export type PhotoPage = {
  photos: GalleryPhoto[]
  nextCursor: string | null
}

export async function listGalleryPhotosPage(
  filters?: LibraryFilters & { cursor?: string; limit?: number }
): Promise<PhotoPage> {
  const db = await ready()
  const limit = Math.min(Math.max(filters?.limit ?? PHOTO_PAGE_SIZE, 1), 60)
  const clauses = []
  const search = whereFilters(filters)
  if (search) clauses.push(search)
  const decoded = decodePhotoCursor(filters?.cursor)
  if (decoded) {
    const created = new Date(decoded.createdAt)
    clauses.push(
      or(
        lt(photos.createdAt, created),
        and(eq(photos.createdAt, created), lt(photos.id, decoded.id))
      )
    )
  }
  const where = clauses.length === 0 ? undefined : clauses.length === 1 ? clauses[0] : and(...clauses)

  const query = db
    .select({
      photo: photos,
      miniatureName: miniatures.name,
      miniatureSlug: miniatures.slug,
      painterName: miniatures.painterName,
      sourceName: miniatures.sourceName,
      sourceUrl: miniatures.sourceUrl,
    })
    .from(photos)
    .innerJoin(miniatures, eq(photos.miniatureId, miniatures.id))
    .orderBy(desc(photos.createdAt), desc(photos.id))
    .limit(limit + 1)

  const rows = where ? query.where(where).all() : query.all()
  const hasMore = rows.length > limit
  const page = hasMore ? rows.slice(0, limit) : rows
  const mapped = page.map(mapGalleryRow)
  const last = mapped[mapped.length - 1]
  return {
    photos: mapped,
    nextCursor: hasMore && last ? encodePhotoCursor(last) : null,
  }
}

export async function getGalleryPhotoById(id: string): Promise<GalleryPhoto | null> {
  const db = await ready()
  const row = db
    .select({
      photo: photos,
      miniatureName: miniatures.name,
      miniatureSlug: miniatures.slug,
      painterName: miniatures.painterName,
      sourceName: miniatures.sourceName,
      sourceUrl: miniatures.sourceUrl,
    })
    .from(photos)
    .innerJoin(miniatures, eq(photos.miniatureId, miniatures.id))
    .where(eq(photos.id, id))
    .get()
  return row ? mapGalleryRow(row) : null
}

export async function getMiniatureBySlug(
  slug: string
): Promise<MiniatureWithPhotos | null> {
  const db = await ready()
  const row = db.select().from(miniatures).where(eq(miniatures.slug, slug)).get()
  if (!row) return null
  const [withPhotos] = await attachPhotos([row])
  return withPhotos ?? null
}

export async function getMiniatureById(
  id: string
): Promise<MiniatureWithPhotos | null> {
  const db = await ready()
  const row = db.select().from(miniatures).where(eq(miniatures.id, id)).get()
  if (!row) return null
  const [withPhotos] = await attachPhotos([row])
  return withPhotos ?? null
}

export async function getPhotoById(id: string): Promise<Photo | null> {
  const db = await ready()
  return db.select().from(photos).where(eq(photos.id, id)).get() ?? null
}

export type MiniatureInput = {
  name: string
  painterName: string
  sourceName?: string
  sourceUrl?: string
  notes?: string
}

export async function createMiniature(
  input: MiniatureInput,
  files: File[],
  coverIndex: number
): Promise<MiniatureWithPhotos> {
  const db = await ready()
  const id = crypto.randomUUID()
  const now = new Date()
  const slug = uniqueSlug(slugify(input.name), id)
  db.insert(miniatures)
    .values({
      id,
      slug,
      name: input.name.trim(),
      painterName: input.painterName.trim(),
      sourceName: emptyToNull(input.sourceName),
      sourceUrl: emptyToNull(input.sourceUrl),
      notes: emptyToNull(input.notes),
      createdAt: now,
      updatedAt: now,
    })
    .run()

  await addPhotos(id, files, coverIndex)
  const created = await getMiniatureById(id)
  if (!created) throw new Error("Failed to create miniature.")
  return created
}

export async function updateMiniature(
  id: string,
  input: MiniatureInput,
  options: {
    existingOrder: string[]
    deleteIds: string[]
    coverPhotoId?: string
    newFiles: File[]
  }
): Promise<MiniatureWithPhotos> {
  const db = await ready()
  const current = await getMiniatureById(id)
  if (!current) throw new Error("Miniature not found.")

  const now = new Date()
  const nextSlug =
    current.name === input.name.trim()
      ? current.slug
      : uniqueSlug(slugify(input.name), id, current.slug)

  db.update(miniatures)
    .set({
      name: input.name.trim(),
      painterName: input.painterName.trim(),
      sourceName: emptyToNull(input.sourceName),
      sourceUrl: emptyToNull(input.sourceUrl),
      notes: emptyToNull(input.notes),
      slug: nextSlug,
      updatedAt: now,
    })
    .where(eq(miniatures.id, id))
    .run()

  for (const photoId of options.deleteIds) {
    const photo = current.photos.find((item) => item.id === photoId)
    if (!photo) continue
    db.delete(photos).where(eq(photos.id, photoId)).run()
    await deletePhotoFiles(photoId)
  }

  const remaining = options.existingOrder.filter(
    (photoId) => !options.deleteIds.includes(photoId)
  )
  remaining.forEach((photoId, index) => {
    db.update(photos)
      .set({
        sortOrder: index,
        isCover: options.coverPhotoId === photoId,
      })
      .where(and(eq(photos.id, photoId), eq(photos.miniatureId, id)))
      .run()
  })

  if (options.newFiles.length > 0) {
    const start = remaining.length
    const coverFromNew =
      options.coverPhotoId && options.coverPhotoId.startsWith("new:")
        ? Number(options.coverPhotoId.slice(4))
        : -1
    await addPhotos(id, options.newFiles, coverFromNew, start, remaining.length === 0)
  } else if (remaining.length > 0 && !options.coverPhotoId) {
    db.update(photos)
      .set({ isCover: true })
      .where(eq(photos.id, remaining[0]))
      .run()
  }

  db.update(miniatures).set({ updatedAt: now }).where(eq(miniatures.id, id)).run()
  const updated = await getMiniatureById(id)
  if (!updated) throw new Error("Miniature vanished while saving.")
  return updated
}

export async function deleteMiniature(id: string): Promise<void> {
  const current = await getMiniatureById(id)
  if (!current) return
  const db = await ready()
  db.delete(miniatures).where(eq(miniatures.id, id)).run()
  for (const photo of current.photos) {
    await deletePhotoFiles(photo.id)
  }
}

function mapGalleryRow(row: {
  photo: Photo
  miniatureName: string
  miniatureSlug: string
  painterName: string
  sourceName: string | null
  sourceUrl: string | null
}): GalleryPhoto {
  return {
    ...row.photo,
    miniatureName: row.miniatureName,
    miniatureSlug: row.miniatureSlug,
    painterName: row.painterName,
    sourceName: row.sourceName,
    sourceUrl: row.sourceUrl,
  }
}

function encodePhotoCursor(photo: Pick<Photo, "id" | "createdAt">): string {
  return `${photo.createdAt.getTime()}:${photo.id}`
}

function decodePhotoCursor(cursor?: string): { createdAt: number; id: string } | null {
  if (!cursor) return null
  const sep = cursor.indexOf(":")
  if (sep <= 0) return null
  const createdAt = Number(cursor.slice(0, sep))
  const id = cursor.slice(sep + 1)
  if (!id || !Number.isFinite(createdAt)) return null
  return { createdAt, id }
}

function whereFilters(filters?: LibraryFilters) {
  const q = filters?.q?.trim()
  if (!q) return undefined
  const needle = likeNeedle(q)
  const field = filters?.field ?? "all"
  switch (field) {
    case "name":
      return like(miniatures.name, needle)
    case "painter":
      return like(miniatures.painterName, needle)
    case "source":
      return or(like(miniatures.sourceName, needle), like(miniatures.sourceUrl, needle))
    case "notes":
      return like(miniatures.notes, needle)
    default:
      return or(
        like(miniatures.name, needle),
        like(miniatures.painterName, needle),
        like(miniatures.sourceName, needle),
        like(miniatures.sourceUrl, needle),
        like(miniatures.notes, needle)
      )
  }
}

function attachPhotos(rows: Miniature[]): MiniatureWithPhotos[] {
  if (rows.length === 0) return []
  const db = getDb()
  const allPhotos = db
    .select()
    .from(photos)
    .where(
      inArray(
        photos.miniatureId,
        rows.map((row) => row.id)
      )
    )
    .orderBy(asc(photos.sortOrder))
    .all()

  const byMiniature = new Map<string, Photo[]>()
  for (const photo of allPhotos) {
    const list = byMiniature.get(photo.miniatureId) ?? []
    list.push(photo)
    byMiniature.set(photo.miniatureId, list)
  }
  return rows.map((row) => ({
    ...row,
    photos: byMiniature.get(row.id) ?? [],
  }))
}

function uniqueSlug(base: string, id: string, current?: string): string {
  const db = getDb()
  const taken = db.select({ slug: miniatures.slug, id: miniatures.id }).from(miniatures).all()
  const used = new Set(taken.filter((row) => row.id !== id).map((row) => row.slug))
  if (current && !used.has(current) && current === base) return current
  if (!used.has(base)) return base
  let n = 2
  while (used.has(`${base}-${n}`)) n += 1
  return `${base}-${n}`
}

async function addPhotos(
  miniatureId: string,
  files: File[],
  coverIndex: number,
  startOrder = 0,
  forceCoverIfNone = true
) {
  const db = getDb()
  const now = new Date()
  for (const [index, file] of files.entries()) {
    if (!file || file.size === 0) continue
    const image = await processUpload(file)
    const id = crypto.randomUUID()
    await writePhotoFiles(id, image)
    const isCover =
      coverIndex === index || (forceCoverIfNone && startOrder === 0 && index === 0 && coverIndex < 0)
    db.insert(photos)
      .values({
        id,
        miniatureId,
        originalFilename: file.name || `photo-${index + 1}.jpg`,
        mimeType: image.mimeType,
        width: image.width,
        height: image.height,
        sortOrder: startOrder + index,
        isCover,
        createdAt: now,
      })
      .run()
  }

  if (coverIndex >= 0 && coverIndex < files.length) {
    const all = db
      .select()
      .from(photos)
      .where(eq(photos.miniatureId, miniatureId))
      .orderBy(asc(photos.sortOrder))
      .all()
    for (const photo of all) {
      db.update(photos)
        .set({ isCover: photo.sortOrder === startOrder + coverIndex })
        .where(eq(photos.id, photo.id))
        .run()
    }
  }
}

function emptyToNull(value?: string): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}
