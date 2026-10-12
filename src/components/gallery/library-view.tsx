"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

import { JustifiedGallery } from "@/components/gallery/justified-gallery"
import { Lightbox } from "@/components/gallery/lightbox"
import type { SearchField } from "@/lib/search"
import type { GalleryPhoto } from "@/lib/types"
import { libraryHref, photoUrl } from "@/lib/urls"

function revive(photo: GalleryPhoto & { createdAt: Date | string }): GalleryPhoto {
  return {
    ...photo,
    createdAt:
      photo.createdAt instanceof Date ? photo.createdAt : new Date(photo.createdAt),
  }
}

export function LibraryView({
  initialPhotos,
  initialCursor,
  activePhotoId,
  q,
  field,
}: {
  initialPhotos: GalleryPhoto[]
  initialCursor: string | null
  activePhotoId?: string
  q?: string
  field: SearchField
}) {
  const router = useRouter()
  const [photos, setPhotos] = useState(() => initialPhotos.map(revive))
  const [cursor, setCursor] = useState(initialCursor)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)

  const loadMore = useCallback(async () => {
    if (!cursor || loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set("cursor", cursor)
      if (q) params.set("q", q)
      if (field && field !== "all") params.set("field", field)
      const response = await fetch(`/api/library/photos?${params.toString()}`)
      if (!response.ok) throw new Error("The next shelf could not be fetched.")
      const data = (await response.json()) as {
        photos: Array<GalleryPhoto & { createdAt: string }>
        nextCursor: string | null
      }
      setPhotos((current) => {
        const seen = new Set(current.map((photo) => photo.id))
        const incoming = data.photos.map(revive).filter((photo) => !seen.has(photo.id))
        return [...current, ...incoming]
      })
      setCursor(data.nextCursor)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load more plates.")
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [cursor, q, field])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !cursor) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void loadMore()
      },
      { rootMargin: "1200px 0px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [cursor, loadMore])

  const setPhoto = useCallback(
    (id?: string) => {
      router.replace(libraryHref({ view: "photos", q, field, photo: id }), {
        scroll: false,
      })
    },
    [router, q, field]
  )

  return (
    <>
      <JustifiedGallery
        items={photos.map((photo) => ({
          id: photo.id,
          width: photo.width,
          height: photo.height,
          thumbUrl: photoUrl(photo.id, "thumb"),
          displayUrl: photoUrl(photo.id, "display"),
          alt: `${photo.miniatureName}, painted by ${photo.painterName}`,
          caption: `${photo.miniatureName} · ${photo.painterName}`,
        }))}
        targetRowHeight={210}
        onSelect={(item) => setPhoto(item.id)}
      />
      <div ref={sentinelRef} className="h-8" />
      {loading ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          Fetching older plates…
        </p>
      ) : null}
      {error ? (
        <div className="py-4 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <button
            type="button"
            className="mt-2 text-sm text-gold hover:underline"
            onClick={() => void loadMore()}
          >
            Try again
          </button>
        </div>
      ) : null}
      {!cursor && photos.length > 0 ? (
        <p className="py-3 text-center text-xs text-muted-foreground">
          End of the vault
        </p>
      ) : null}
      {activePhotoId ? (
        <Lightbox
          photos={photos}
          activeId={activePhotoId}
          onClose={() => setPhoto(undefined)}
          onChange={setPhoto}
        />
      ) : null}
    </>
  )
}
