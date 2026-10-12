"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requireAdmin } from "@/lib/auth"
import { t } from "@/lib/i18n"
import {
  createMiniature,
  deleteMiniature,
  updateMiniature,
} from "@/lib/miniatures"

function readFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim()
  const painterName = String(formData.get("painterName") ?? "").trim()
  const sourceName = String(formData.get("sourceName") ?? "").trim()
  const sourceUrl = String(formData.get("sourceUrl") ?? "").trim()
  const notes = String(formData.get("notes") ?? "").trim()
  return { name, painterName, sourceName, sourceUrl, notes }
}

function filesFrom(formData: FormData): File[] {
  return formData
    .getAll("photos")
    .filter((item): item is File => item instanceof File && item.size > 0)
}

export type MutationState = { error?: string } | undefined

export async function createMiniatureAction(
  _prev: MutationState,
  formData: FormData
): Promise<MutationState> {
  await requireAdmin()
  const fields = readFields(formData)
  if (!fields.name || !fields.painterName) {
    return { error: t("needsNamePainter") }
  }
  if (fields.sourceUrl && !isHttpUrl(fields.sourceUrl)) {
    return { error: t("sourceUrlHttp") }
  }

  const files = filesFrom(formData)
  const coverIndex = Number(formData.get("coverIndex") ?? "0")
  try {
    const created = await createMiniature(
      fields,
      files,
      Number.isFinite(coverIndex) ? coverIndex : 0
    )
    revalidatePath("/")
    revalidatePath(`/miniatures/${created.slug}`)
    revalidatePath("/admin")
    redirect(`/miniatures/${created.slug}`)
  } catch (error) {
    return { error: error instanceof Error ? error.message : t("createFailed") }
  }
}

export async function updateMiniatureAction(
  _prev: MutationState,
  formData: FormData
): Promise<MutationState> {
  await requireAdmin()
  const id = String(formData.get("id") ?? "")
  const fields = readFields(formData)
  if (!id) return { error: t("missingId") }
  if (!fields.name || !fields.painterName) {
    return { error: t("needsNamePainter") }
  }
  if (fields.sourceUrl && !isHttpUrl(fields.sourceUrl)) {
    return { error: t("sourceUrlHttp") }
  }

  const existingOrder = parseIdList(formData.get("existingOrder"))
  const deleteIds = parseIdList(formData.get("deleteIds"))
  const coverPhotoId = String(formData.get("coverPhotoId") ?? "")
  const newFiles = filesFrom(formData)

  try {
    const updated = await updateMiniature(id, fields, {
      existingOrder,
      deleteIds,
      coverPhotoId: coverPhotoId || undefined,
      newFiles,
    })
    revalidatePath("/")
    revalidatePath(`/miniatures/${updated.slug}`)
    revalidatePath("/admin")
    redirect(`/miniatures/${updated.slug}`)
  } catch (error) {
    return { error: error instanceof Error ? error.message : t("saveFailed") }
  }
}

export async function deleteMiniatureAction(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get("id") ?? "")
  const slug = String(formData.get("slug") ?? "")
  if (!id) return
  await deleteMiniature(id)
  revalidatePath("/")
  if (slug) revalidatePath(`/miniatures/${slug}`)
  revalidatePath("/admin")
  redirect("/admin")
}

function parseIdList(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string" || value.trim() === "") return []
  try {
    const parsed = JSON.parse(value) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === "string")
  } catch {
    return value.split(",").map((item) => item.trim()).filter(Boolean)
  }
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}
