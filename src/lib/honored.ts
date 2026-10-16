import "server-only"

import { eq } from "drizzle-orm"
import { connection } from "next/server"

import { ensureDb } from "@/lib/db"
import { getMiniatureById, type MiniatureWithPhotos } from "@/lib/miniatures"
import { honoredEmissary, miniatures } from "@/lib/schema"

const SINGLETON_ID = 1

export type HonorUpdate =
  | { ok: true; previousSlug: string | null; nextSlug: string | null }
  | { ok: false; reason: "missing" }

export async function getHonoredEmissary(): Promise<MiniatureWithPhotos | null> {
  await connection()
  const db = await ensureDb()
  const row = db
    .select()
    .from(honoredEmissary)
    .where(eq(honoredEmissary.id, SINGLETON_ID))
    .get()
  if (!row?.miniatureId) return null
  return getMiniatureById(row.miniatureId)
}

export async function setHonoredEmissary(miniatureId: string | null): Promise<HonorUpdate> {
  await connection()
  const db = await ensureDb()
  const current = db
    .select()
    .from(honoredEmissary)
    .where(eq(honoredEmissary.id, SINGLETON_ID))
    .get()

  let previousSlug: string | null = null
  if (current?.miniatureId) {
    const previous = db
      .select({ slug: miniatures.slug })
      .from(miniatures)
      .where(eq(miniatures.id, current.miniatureId))
      .get()
    previousSlug = previous?.slug ?? null
  }

  let nextSlug: string | null = null
  if (miniatureId) {
    const next = db
      .select({ slug: miniatures.slug })
      .from(miniatures)
      .where(eq(miniatures.id, miniatureId))
      .get()
    if (!next) return { ok: false, reason: "missing" }
    nextSlug = next.slug
  }

  db.insert(honoredEmissary)
    .values({ id: SINGLETON_ID, miniatureId })
    .onConflictDoUpdate({
      target: honoredEmissary.id,
      set: { miniatureId },
    })
    .run()

  return { ok: true, previousSlug, nextSlug }
}
