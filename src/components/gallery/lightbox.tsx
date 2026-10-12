"use client"

import Link from "next/link"
import { useEffect } from "react"
import { ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { GalleryPhoto } from "@/lib/types"
import { miniaturePath, photoUrl } from "@/lib/urls"

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
  const index = Math.max(
    0,
    photos.findIndex((item) => item.id === activeId)
  )
  const photo = photos[index]
  const previous = photos[(index - 1 + photos.length) % photos.length]
  const next = photos[(index + 1) % photos.length]

  useEffect(() => {
    if (!photo) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
      if (event.key === "ArrowLeft" && previous) onChange(previous.id)
      if (event.key === "ArrowRight" && next) onChange(next.id)
    }
    window.addEventListener("keydown", onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [onChange, onClose, photo, previous, next])

  if (!photo) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo.miniatureName}
      className="fixed inset-0 z-50 flex flex-col bg-black/92"
    >
      <div className="flex items-center justify-between gap-3 px-3 py-3 text-foreground">
        <div className="min-w-0">
          <p className="font-display truncate text-lg text-gold">{photo.miniatureName}</p>
          <p className="truncate text-sm text-muted-foreground">
            Painted by {photo.painterName}
            {photos.length > 1 ? ` · ${index + 1} of ${photos.length}` : null}
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
              Open entry
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close"
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
            aria-label="Previous photo"
          >
            <ChevronLeft className="size-7" />
          </button>
        ) : null}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoUrl(photo.id, "display")}
          alt={photo.miniatureName}
          className="max-h-full max-w-full object-contain"
        />
        {photos.length > 1 ? (
          <button
            type="button"
            className="absolute right-1 z-10 hidden rounded-full bg-black/40 p-2 text-gold hover:bg-black/70 sm:block"
            onClick={() => onChange(next.id)}
            aria-label="Next photo"
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
            <span>No source recorded</span>
          )}
        </div>
        <a
          href={photoUrl(photo.id, "original")}
          className="text-gold hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          Full size
        </a>
      </div>
    </div>
  )
}
