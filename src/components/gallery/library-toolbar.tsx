"use client"

import { useRouter } from "next/navigation"
import { LayoutGrid, Images } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { libraryHref } from "@/lib/urls"
import { cn } from "@/lib/utils"

export function LibraryToolbar({
  view,
  q,
  painter,
  painters,
  photoCount,
  miniatureCount,
}: {
  view: "photos" | "collection"
  q: string
  painter: string
  painters: string[]
  photoCount: number
  miniatureCount: number
}) {
  const router = useRouter()

  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-display text-[0.7rem] tracking-[0.32em] text-gold/80 uppercase">
            The vault
          </p>
          <h2 className="font-display text-3xl text-gold sm:text-4xl">Whole library</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {miniatureCount} miniature{miniatureCount === 1 ? "" : "s"} · {photoCount} photograph{photoCount === 1 ? "" : "s"}
          </p>
        </div>
        <form
          className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto"
          action="/"
        >
          <input type="hidden" name="view" value={view} />
          {painter ? <input type="hidden" name="painter" value={painter} /> : null}
          <Input
            name="q"
            defaultValue={q}
            placeholder="Search names, painters, sources…"
            className="h-9 min-w-0 bg-card/60 sm:w-72"
          />
          <Button type="submit" size="sm">
            Seek
          </Button>
        </form>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          <FilterChip
            active={!painter}
            href={libraryHref({ view, q: q || undefined })}
            label="All painters"
          />
          {painters.map((name) => (
            <FilterChip
              key={name}
              active={painter === name}
              href={libraryHref({ view, q: q || undefined, painter: name })}
              label={name}
            />
          ))}
        </div>
        <div className="flex rounded-md border border-gold/25 p-0.5">
          <Button
            size="sm"
            variant={view === "photos" ? "default" : "ghost"}
            onClick={() =>
              router.push(libraryHref({ view: "photos", q: q || undefined, painter: painter || undefined }))
            }
          >
            <Images data-icon="inline-start" />
            Photos
          </Button>
          <Button
            size="sm"
            variant={view === "collection" ? "default" : "ghost"}
            onClick={() =>
              router.push(
                libraryHref({
                  view: "collection",
                  q: q || undefined,
                  painter: painter || undefined,
                })
              )
            }
          >
            <LayoutGrid data-icon="inline-start" />
            Miniatures
          </Button>
        </div>
      </div>
    </div>
  )
}

function FilterChip({
  href,
  label,
  active,
}: {
  href: string
  label: string
  active: boolean
}) {
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={() => router.push(href)}
      className={cn(
        "rounded-full border px-2.5 py-1 text-xs transition",
        active
          ? "border-gold bg-primary text-primary-foreground"
          : "border-border bg-card/50 text-muted-foreground hover:border-gold/50 hover:text-foreground"
      )}
    >
      {label}
    </button>
  )
}
