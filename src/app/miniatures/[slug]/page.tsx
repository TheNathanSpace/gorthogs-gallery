import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { ExternalLink, Pencil } from "lucide-react"

import { DeleteMiniatureButton } from "@/components/admin/delete-miniature-button"
import { DetailGallery } from "@/components/gallery/detail-gallery"
import { GallerySkeleton } from "@/components/gallery/gallery-skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { isAdmin } from "@/lib/auth"
import { getMiniatureBySlug } from "@/lib/miniatures"
import { photoUrl } from "@/lib/urls"

export default function MiniaturePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ photo?: string }>
}) {
  return (
    <Suspense fallback={<div className="flex-1 px-4 py-8"><GallerySkeleton /></div>}>
      <Detail params={params} searchParams={searchParams} />
    </Suspense>
  )
}

async function Detail({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ photo?: string }>
}) {
  const { slug } = await params
  const { photo: photoId } = await searchParams
  const miniature = await getMiniatureBySlug(slug)
  if (!miniature) notFound()
  const admin = await isAdmin()
  const galleryPhotos = miniature.photos.map((photo) => ({
    ...photo,
    miniatureName: miniature.name,
    miniatureSlug: miniature.slug,
    painterName: miniature.painterName,
    sourceName: miniature.sourceName,
    sourceUrl: miniature.sourceUrl,
  }))

  return (
    <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-8 sm:px-6">
      <div className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-end">
        <div>
          <p className="font-display text-[0.7rem] tracking-[0.32em] text-gold/80 uppercase">
            Miniature
          </p>
          <h1 className="font-display mt-1 text-4xl text-gold sm:text-5xl">{miniature.name}</h1>
          <p className="mt-3 text-lg">
            Painted by <span className="text-gold">{miniature.painterName}</span>
          </p>
        </div>
        <div className="vault-frame space-y-3 rounded-md bg-card/75 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{miniature.photos.length} photograph{miniature.photos.length === 1 ? "" : "s"}</Badge>
            {miniature.sourceName ? <Badge variant="secondary">{miniature.sourceName}</Badge> : null}
          </div>
          {miniature.sourceUrl ? (
            <a
              href={miniature.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-gold hover:underline"
            >
              Online source
              <ExternalLink className="size-3.5" />
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">No source URL recorded.</p>
          )}
          {admin ? (
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                size="sm"
                nativeButton={false}
                render={<Link href={`/admin/miniatures/${miniature.id}/edit`} />}
              >
                <Pencil data-icon="inline-start" />
                Edit
              </Button>
              <DeleteMiniatureButton
                id={miniature.id}
                slug={miniature.slug}
                name={miniature.name}
              />
            </div>
          ) : null}
        </div>
      </div>

      {miniature.notes ? (
        <blockquote className="vault-frame mb-8 rounded-md bg-card/60 px-5 py-4 text-sm leading-relaxed">
          {miniature.notes}
        </blockquote>
      ) : null}

      {miniature.photos.length === 0 ? (
        <p className="text-muted-foreground">No photographs have been hung for this miniature yet.</p>
      ) : (
        <DetailGallery
          photos={galleryPhotos}
          slug={miniature.slug}
          activePhotoId={photoId}
        />
      )}

      {miniature.photos.length > 0 ? (
        <p className="mt-4 text-xs text-muted-foreground">
          Original files remain available from the lightbox “Full size” link
          {miniature.photos[0] ? ` (example: ${photoUrl(miniature.photos[0].id, "original")}).` : "."}
        </p>
      ) : null}
    </main>
  )
}
