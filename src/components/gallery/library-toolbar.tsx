"use client"

import { useRouter } from "next/navigation"
import { Images, LayoutGrid, Table2 } from "lucide-react"

import { useT } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  SEARCH_FIELDS,
  searchFieldMessageKey,
  type LibraryViewMode,
  type SearchField,
} from "@/lib/search"
import { libraryHref } from "@/lib/urls"
import { cn } from "@/lib/utils"

export function LibraryToolbar({
  view,
  q,
  field,
  painters,
  photoCount,
  miniatureCount,
}: {
  view: LibraryViewMode
  q: string
  field: SearchField
  painters: string[]
  photoCount: number
  miniatureCount: number
}) {
  const { t, plural } = useT()
  const router = useRouter()
  const filtered = Boolean(q)

  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-display text-[0.7rem] tracking-[0.32em] text-gold/80 uppercase">
            {t("vaultEyebrow")}
          </p>
          <h2 className="font-display text-3xl text-gold sm:text-4xl">{t("wholeLibrary")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("libraryCounts", {
              miniatures: miniatureCount,
              miniaturesPlural: plural(miniatureCount),
              photos: photoCount,
              photosPlural: plural(photoCount),
              matching: filtered ? t("matchingSearch") : "",
            })}
          </p>
        </div>
        <form
          className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto"
          action="/"
        >
          <input type="hidden" name="view" value={view} />
          <label className="sr-only" htmlFor="field">
            {t("searchIn")}
          </label>
          <select
            id="field"
            name="field"
            defaultValue={field}
            className="h-9 rounded-lg border border-input bg-card/60 px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {SEARCH_FIELDS.map((value) => (
              <option key={value} value={value}>
                {t(searchFieldMessageKey(value))}
              </option>
            ))}
          </select>
          <Input
            name="q"
            defaultValue={q}
            placeholder={placeholderFor(field, t)}
            className="h-9 min-w-0 bg-card/60 sm:w-72"
          />
          <Button type="submit" size="sm">
            {t("seek")}
          </Button>
          {filtered ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => router.push(libraryHref({ view }))}
            >
              {t("clear")}
            </Button>
          ) : null}
        </form>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          <FilterChip
            active={!filtered}
            href={libraryHref({ view })}
            label={t("allPainters")}
          />
          {painters.map((name) => (
            <FilterChip
              key={name}
              active={field === "painter" && q === name}
              href={libraryHref({ view, field: "painter", q: name })}
              label={name}
            />
          ))}
        </div>
        <div className="flex flex-wrap rounded-md border border-gold/25 p-0.5">
          <ViewButton
            active={view === "photos"}
            onClick={() =>
              router.push(libraryHref({ view: "photos", q: q || undefined, field }))
            }
            icon={<Images data-icon="inline-start" />}
            label={t("photos")}
          />
          <ViewButton
            active={view === "collection"}
            onClick={() =>
              router.push(libraryHref({ view: "collection", q: q || undefined, field }))
            }
            icon={<LayoutGrid data-icon="inline-start" />}
            label={t("miniatures")}
          />
          <ViewButton
            active={view === "table"}
            onClick={() =>
              router.push(libraryHref({ view: "table", q: q || undefined, field }))
            }
            icon={<Table2 data-icon="inline-start" />}
            label={t("table")}
          />
        </div>
      </div>
    </div>
  )
}

function ViewButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <Button size="sm" variant={active ? "default" : "ghost"} onClick={onClick}>
      {icon}
      {label}
    </Button>
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

function placeholderFor(field: SearchField, t: ReturnType<typeof useT>["t"]): string {
  switch (field) {
    case "name":
      return t("searchPlaceholderName")
    case "painter":
      return t("searchPlaceholderPainter")
    case "source":
      return t("searchPlaceholderSource")
    case "notes":
      return t("searchPlaceholderNotes")
    default:
      return t("searchPlaceholderAll")
  }
}
