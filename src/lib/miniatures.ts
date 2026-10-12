import "server-only"

import { and, asc, desc, eq, inArray, like, or } from "drizzle-orm"
import { connection } from "next/server"

import { ensureDb, getDb } from "@/lib/db"
import { deletePhotoFiles, processUpload, writePhotoFiles } from "@/lib/images"
import { miniatures, photos, type Miniature, type Photo } from "@/lib/schema"
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

export async function listMiniatures(filters?: {
  q?: string
  painter?: string
}): Promise<MiniatureWithPhotos[]> {
  const db = await ready()
  const where = whereFilters(filters)
  const rows = where
    ? db.select().from(miniatures).where(where).orderBy(desc(miniatures.updatedAt)).all()
    : db.select().from(miniatures).orderBy(desc(miniatures.updatedAt)).all()
  return attachPhotos(rows)
}

export async function listGalleryPhotos(filters?: {
  q?: string
  painter?: string
}): Promise<GalleryPhoto[]> {
  const db = await ready()
  const where = whereFilters(filters)
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
    .orderBy(desc(miniatures.updatedAt), asc(photos.sortOrder))

  const rows = where ? query.where(where).all() : query.all()
  return rows.map((row) => ({
    ...row.photo,
    miniatureName: row.miniatureName,
    miniatureSlug: row.miniatureSlug,
    painterName: row.painterName,
    sourceName: row.sourceName,
    sourceUrl: row.sourceUrl,
  }))
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

function whereFilters(filters?: { q?: string; painter?: string }) {
  const clauses = []
  if (filters?.painter) {
    clauses.push(eq(miniatures.painterName, filters.painter))
  }
  if (filters?.q) {
    const needle = `%${filters.q.replaceAll("%", "")}%`
    clauses.push(
      or(
        like(miniatures.name, needle),
        like(miniatures.painterName, needle),
        like(miniatures.sourceName, needle),
        like(miniatures.notes, needle)
      )
    )
  }
  if (clauses.length === 0) return undefined
  return clauses.length === 1 ? clauses[0] : and(...clauses)
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
