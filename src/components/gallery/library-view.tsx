"use client"

import { useRouter } from "next/navigation"
import { useCallback } from "react"

import { JustifiedGallery } from "@/components/gallery/justified-gallery"
import { Lightbox } from "@/components/gallery/lightbox"
import type { GalleryPhoto } from "@/lib/types"
import { libraryHref, photoUrl } from "@/lib/urls"

export function LibraryView({
  photos,
  activePhotoId,
  view,
  q,
  painter,
}: {
  photos: GalleryPhoto[]
  activePhotoId?: string
  view: "photos" | "collection"
  q?: string
  painter?: string
}) {
  const router = useRouter()

  const setPhoto = useCallback(
    (id?: string) => {
      router.replace(libraryHref({ view, q, painter, photo: id }), { scroll: false })
    },
    [router, view, q, painter]
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
