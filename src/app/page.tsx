import { Suspense } from "react"

import { EmptyState } from "@/components/gallery/empty-state"
import { GallerySkeleton } from "@/components/gallery/gallery-skeleton"
import { LibraryToolbar } from "@/components/gallery/library-toolbar"
import { LibraryView } from "@/components/gallery/library-view"
import { MiniatureCard } from "@/components/gallery/miniature-card"
import { isAdmin } from "@/lib/auth"
import {
  listGalleryPhotos,
  listMiniatures,
  listPainters,
} from "@/lib/miniatures"

export default function Home({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; q?: string; painter?: string; photo?: string }>
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
  searchParams: Promise<{ view?: string; q?: string; painter?: string; photo?: string }>
}) {
  const params = await searchParams
  const view = params.view === "collection" ? "collection" : "photos"
  const q = params.q?.trim() ?? ""
  const painter = params.painter?.trim() ?? ""
  const filters = { q: q || undefined, painter: painter || undefined }

  const [photos, miniatures, painters, admin] = await Promise.all([
    listGalleryPhotos(filters),
    listMiniatures(filters),
    listPainters(),
    isAdmin(),
  ])

  return (
    <>
      <LibraryToolbar
        view={view}
        q={q}
        painter={painter}
        painters={painters}
        photoCount={photos.length}
        miniatureCount={miniatures.length}
      />
      {miniatures.length === 0 ? (
        <EmptyState isAdmin={admin} filtered={Boolean(q || painter)} />
      ) : view === "collection" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {miniatures.map((miniature) => (
            <MiniatureCard key={miniature.id} miniature={miniature} />
          ))}
        </div>
      ) : (
        <LibraryView
          photos={photos}
          activePhotoId={params.photo}
          view={view}
          q={q || undefined}
          painter={painter || undefined}
        />
      )}
    </>
  )
}
