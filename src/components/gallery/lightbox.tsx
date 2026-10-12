"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react"

import { useT } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"
import type { GalleryPhoto } from "@/lib/types"
import { miniaturePath, photoUrl } from "@/lib/urls"

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

export function Lightbox({
  photos,
  activeId,
  onClose,
  onChange,
  showMiniatureLink = true,
}: {
  photos: GalleryPhoto[]
  activeId: string
  onClose: () => void
  onChange: (id: string) => void
  showMiniatureLink?: boolean
}) {
  const { t, photoAlt } = useT()
  const dialogRef = useRef<HTMLDivElement>(null)
  const index = Math.max(
    0,
    photos.findIndex((item) => item.id === activeId)
  )
  const photo = photos[index]
  const previous = photos[(index - 1 + photos.length) % photos.length]
  const next = photos[(index + 1) % photos.length]

  useEffect(() => {
    if (!photo) return
    const root = dialogRef.current
    const previously = document.activeElement as HTMLElement | null
    const focusables = () =>
      root
        ? [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
            (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1
          )
        : []
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
      if (event.key === "ArrowLeft" && previous) onChange(previous.id)
      if (event.key === "ArrowRight" && next) onChange(next.id)
      if (event.key === "Tab" && root) {
        const items = focusables()
        if (items.length === 0) return
        const first = items[0]
        const last = items[items.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener("keydown", onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    focusables()[0]?.focus()
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = previousOverflow
      previously?.focus?.()
    }
  }, [onChange, onClose, photo, previous, next])

  if (!photo) return null

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={photo.miniatureName}
      className="fixed inset-0 z-50 flex flex-col bg-black/92"
    >
      <div className="flex items-center justify-between gap-3 px-3 py-3 text-foreground">
        <div className="min-w-0">
          <p className="font-display truncate text-lg text-gold">{photo.miniatureName}</p>
          <p className="truncate text-sm text-muted-foreground">
            {t("paintedBy", { painter: photo.painterName })}
            {photos.length > 1
              ? ` · ${t("photoPosition", { current: index + 1, total: photos.length })}`
              : null}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {showMiniatureLink ? (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href={miniaturePath(photo.miniatureSlug)} />}
            >
              {t("openEntry")}
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label={t("close")}
          >
            <X />
          </Button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-3 sm:px-12">
        {photos.length > 1 ? (
          <button
            type="button"
            className="absolute left-1 z-10 hidden rounded-full bg-black/40 p-2 text-gold hover:bg-black/70 sm:block"
            onClick={() => onChange(previous.id)}
            aria-label={t("previousPhoto")}
          >
            <ChevronLeft className="size-7" />
          </button>
        ) : null}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoUrl(photo.id, "display")}
          alt={photoAlt(photo.miniatureName, photo.painterName)}
          className="max-h-full max-w-full object-contain"
        />
        {photos.length > 1 ? (
          <button
            type="button"
            className="absolute right-1 z-10 hidden rounded-full bg-black/40 p-2 text-gold hover:bg-black/70 sm:block"
            onClick={() => onChange(next.id)}
            aria-label={t("nextPhoto")}
          >
            <ChevronRight className="size-7" />
          </button>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-gold/20 px-4 py-3 text-sm">
        <div className="min-w-0 text-muted-foreground">
          {photo.sourceName ? (
            photo.sourceUrl ? (
              <a
                href={photo.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-gold hover:underline"
              >
                {photo.sourceName}
                <ExternalLink className="size-3.5" />
              </a>
            ) : (
              <span>{photo.sourceName}</span>
            )
          ) : (
            <span>{t("noSourceRecorded")}</span>
          )}
        </div>
        <a
          href={photoUrl(photo.id, "original")}
          className="text-gold hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          {t("fullSize")}
        </a>
      </div>
    </div>
  )
}
