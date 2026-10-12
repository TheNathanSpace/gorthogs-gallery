"use client"

import { useActionState, useMemo, useState } from "react"
import { Star, Trash2, ArrowLeft, ArrowRight } from "lucide-react"

import {
  createMiniatureAction,
  updateMiniatureAction,
  type MutationState,
} from "@/app/actions/miniatures"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Photo } from "@/lib/schema"
import { photoUrl } from "@/lib/urls"
import { cn } from "@/lib/utils"

type Existing = Photo & { marked?: boolean }

export function MiniatureForm({
  mode,
  miniature,
}: {
  mode: "create" | "edit"
  miniature?: {
    id: string
    name: string
    painterName: string
    sourceName: string | null
    sourceUrl: string | null
    notes: string | null
    photos: Photo[]
  }
}) {
  const action = mode === "create" ? createMiniatureAction : updateMiniatureAction
  const [state, formAction, pending] = useActionState<MutationState, FormData>(
    action,
    undefined
  )
  const [existing, setExisting] = useState<Existing[]>(miniature?.photos ?? [])
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [cover, setCover] = useState<string>(
    miniature?.photos.find((photo) => photo.isCover)?.id ??
      miniature?.photos[0]?.id ??
      "new:0"
  )

  const previews = useMemo(
    () => newFiles.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [newFiles]
  )

  function moveExisting(index: number, dir: -1 | 1) {
    const next = [...existing]
    const swap = index + dir
    if (swap < 0 || swap >= next.length) return
    ;[next[index], next[swap]] = [next[swap], next[index]]
    setExisting(next)
  }

  function moveNew(index: number, dir: -1 | 1) {
    const next = [...newFiles]
    const swap = index + dir
    if (swap < 0 || swap >= next.length) return
    ;[next[index], next[swap]] = [next[swap], next[index]]
    setNewFiles(next)
    if (cover === `new:${index}`) setCover(`new:${swap}`)
    else if (cover === `new:${swap}`) setCover(`new:${index}`)
  }

  return (
    <form
      className="space-y-6"
      action={(formData) => {
        formData.delete("photos")
        for (const file of newFiles) formData.append("photos", file)
        formData.set(
          "existingOrder",
          JSON.stringify(existing.filter((photo) => !photo.marked).map((photo) => photo.id))
        )
        formData.set(
          "deleteIds",
          JSON.stringify(existing.filter((photo) => photo.marked).map((photo) => photo.id))
        )
        formData.set("coverPhotoId", cover)
        const coverIndex = cover.startsWith("new:") ? Number(cover.slice(4)) : 0
        formData.set("coverIndex", String(coverIndex))
        formAction(formData)
      }}
    >
      {mode === "edit" && miniature ? (
        <input type="hidden" name="id" value={miniature.id} />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Miniature name" htmlFor="name">
          <Input
            id="name"
            name="name"
            required
            defaultValue={miniature?.name}
            className="h-9 bg-background/60"
          />
        </Field>
        <Field label="Painter" htmlFor="painterName">
          <Input
            id="painterName"
            name="painterName"
            required
            defaultValue={miniature?.painterName}
            className="h-9 bg-background/60"
          />
        </Field>
        <Field label="Online source name" htmlFor="sourceName">
          <Input
            id="sourceName"
            name="sourceName"
            defaultValue={miniature?.sourceName ?? ""}
            placeholder="MyMiniFactory, Patreon, official range…"
            className="h-9 bg-background/60"
          />
        </Field>
        <Field label="Online source URL" htmlFor="sourceUrl">
          <Input
            id="sourceUrl"
            name="sourceUrl"
            type="url"
            defaultValue={miniature?.sourceUrl ?? ""}
            placeholder="https://"
            className="h-9 bg-background/60"
          />
        </Field>
      </div>

      <Field label="Notes" htmlFor="notes">
        <Textarea
          id="notes"
          name="notes"
          defaultValue={miniature?.notes ?? ""}
          placeholder="Paint recipes, scale, lighting notes — optional."
          className="bg-background/60"
        />
      </Field>

      <div className="space-y-3">
        <div>
          <Label htmlFor="photos">Photographs</Label>
          <p className="mt-1 text-xs text-muted-foreground">
            JPEG, PNG, or WebP. Mark a cover plate for the collection view. Drop replacements in here any time.
          </p>
        </div>
        <Input
          id="photos"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="h-auto bg-background/60 py-2"
          onChange={(event) => {
            const added = Array.from(event.target.files ?? [])
            setNewFiles((current) => [...current, ...added])
            if (!cover && added.length > 0) setCover("new:0")
            event.target.value = ""
          }}
        />

        {existing.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {existing.map((photo, index) => (
              <Plate
                key={photo.id}
                src={photoUrl(photo.id, "thumb")}
                name={photo.originalFilename}
                marked={photo.marked}
                isCover={cover === photo.id}
                onCover={() => setCover(photo.id)}
                onRemove={() =>
                  setExisting((rows) =>
                    rows.map((row) =>
                      row.id === photo.id ? { ...row, marked: !row.marked } : row
                    )
                  )
                }
                onLeft={() => moveExisting(index, -1)}
                onRight={() => moveExisting(index, 1)}
              />
            ))}
          </div>
        ) : null}

        {previews.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {previews.map((item, index) => (
              <Plate
                key={`${item.file.name}-${index}`}
                src={item.url}
                name={item.file.name}
                isCover={cover === `new:${index}`}
                onCover={() => setCover(`new:${index}`)}
                onRemove={() =>
                  setNewFiles((files) => files.filter((_, i) => i !== index))
                }
                onLeft={() => moveNew(index, -1)}
                onRight={() => moveNew(index, 1)}
              />
            ))}
          </div>
        ) : null}
      </div>

      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending
          ? "Inscribing…"
          : mode === "create"
            ? "Enter into the vault"
            : "Save changes"}
      </Button>
    </form>
  )
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  )
}

function Plate({
  src,
  name,
  isCover,
  marked,
  onCover,
  onRemove,
  onLeft,
  onRight,
}: {
  src: string
  name: string
  isCover: boolean
  marked?: boolean
  onCover: () => void
  onRemove: () => void
  onLeft: () => void
  onRight: () => void
}) {
  return (
    <div
      className={cn(
        "photo-plate overflow-hidden rounded-md",
        marked && "opacity-40 grayscale"
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="aspect-[4/3] w-full object-cover" />
      <div className="space-y-2 p-2">
        <p className="truncate text-xs text-muted-foreground">{name}</p>
        <div className="flex flex-wrap gap-1">
          <Button type="button" size="xs" variant={isCover ? "default" : "outline"} onClick={onCover}>
            <Star data-icon="inline-start" />
            Cover
          </Button>
          <Button type="button" size="xs" variant="outline" onClick={onLeft}>
            <ArrowLeft />
          </Button>
          <Button type="button" size="xs" variant="outline" onClick={onRight}>
            <ArrowRight />
          </Button>
          <Button type="button" size="xs" variant="destructive" onClick={onRemove}>
            <Trash2 />
          </Button>
        </div>
      </div>
    </div>
  )
}
