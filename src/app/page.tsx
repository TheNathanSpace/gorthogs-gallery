import { Suspense } from "react"
import { preload } from "react-dom"

import { EmptyState } from "@/components/gallery/empty-state"
import { GallerySkeleton } from "@/components/gallery/gallery-skeleton"
import { LibraryTable } from "@/components/gallery/library-table"
import { LibraryToolbar } from "@/components/gallery/library-toolbar"
import { LibraryView } from "@/components/gallery/library-view"
import { MiniatureCard } from "@/components/gallery/miniature-card"
import { isAdmin } from "@/lib/auth"
import {
  countGalleryPhotos,
  getGalleryPhotoById,
  listGalleryPhotosPage,
  listMiniatures,
  listPainters,
} from "@/lib/miniatures"
import { parseLibraryView, parseSearchField, PHOTO_PAGE_SIZE } from "@/lib/search"
import { photoUrl } from "@/lib/urls"

export default function Home({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string
    q?: string
    field?: string
    photo?: string
  }>
}) {
  return (
    <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6">
      <Suspense fallback={<GallerySkeleton />}>
        <Library searchParams={searchParams} />
      </Suspense>
    </main>
  )
}

async function Library({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string
    q?: string
    field?: string
    photo?: string
  }>
}) {
  const params = await searchParams
  const view = parseLibraryView(params.view)
  const q = params.q?.trim() ?? ""
  const field = parseSearchField(params.field)
  const filters = { q: q || undefined, field }

  const [page, miniatures, painters, admin, photoCount] = await Promise.all([
    listGalleryPhotosPage({ ...filters, limit: PHOTO_PAGE_SIZE }),
    listMiniatures(filters),
    listPainters(),
    isAdmin(),
    countGalleryPhotos(filters),
  ])

  let photos = page.photos
  if (view === "photos") {
    for (const photo of photos.slice(0, 8)) {
      preload(photoUrl(photo.id, "thumb"), { as: "image" })
    }
  }
  if (params.photo && !photos.some((photo) => photo.id === params.photo)) {
    const extra = await getGalleryPhotoById(params.photo)
    if (extra) photos = [...photos, extra]
  }

  return (
    <>
      <LibraryToolbar
        view={view}
        q={q}
        field={field}
        painters={painters}
        photoCount={photoCount}
        miniatureCount={miniatures.length}
      />
      {miniatures.length === 0 ? (
        <EmptyState isAdmin={admin} filtered={Boolean(q)} />
      ) : view === "table" ? (
        <LibraryTable miniatures={miniatures} />
      ) : view === "collection" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {miniatures.map((miniature) => (
            <MiniatureCard key={miniature.id} miniature={miniature} />
          ))}
        </div>
      ) : (
        <LibraryView
          key={`${field}:${q}:${page.nextCursor ?? "end"}:${page.photos.map((photo) => photo.id).join(",")}`}
          initialPhotos={photos}
          initialCursor={page.nextCursor}
          activePhotoId={params.photo}
          q={q || undefined}
          field={field}
        />
      )}
    </>
  )
}
