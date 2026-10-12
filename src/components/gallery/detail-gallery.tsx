"use client"

import { useRouter } from "next/navigation"
import { useCallback } from "react"

import { JustifiedGallery } from "@/components/gallery/justified-gallery"
import { Lightbox } from "@/components/gallery/lightbox"
import { useT } from "@/components/i18n-provider"
import type { GalleryPhoto } from "@/lib/types"
import { miniaturePath, photoUrl } from "@/lib/urls"

export function DetailGallery({
  photos,
  slug,
  activePhotoId,
}: {
  photos: GalleryPhoto[]
  slug: string
  activePhotoId?: string
}) {
  const { photoAlt } = useT()
  const router = useRouter()
  const setPhoto = useCallback(
    (id?: string) => {
      const href = id ? `${miniaturePath(slug)}?photo=${id}` : miniaturePath(slug)
      router.replace(href, { scroll: false })
    },
    [router, slug]
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
          alt: photoAlt(photo.miniatureName, photo.painterName),
        }))}
        targetRowHeight={280}
        onSelect={(item) => setPhoto(item.id)}
      />
      {activePhotoId ? (
        <Lightbox
          photos={photos}
          activeId={activePhotoId}
          onClose={() => setPhoto(undefined)}
          onChange={setPhoto}
          showMiniatureLink={false}
        />
      ) : null}
    </>
  )
}
