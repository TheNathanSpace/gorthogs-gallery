import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { ExternalLink, Pencil } from "lucide-react"
import type { Metadata } from "next"

import { DeleteMiniatureButton } from "@/components/admin/delete-miniature-button"
import { DetailGallery } from "@/components/gallery/detail-gallery"
import { GallerySkeleton } from "@/components/gallery/gallery-skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { isAdmin } from "@/lib/auth"
import { SITE_TITLE } from "@/lib/config"
import { getHonoredEmissary } from "@/lib/honored"
import { t, plural } from "@/lib/i18n"
import { getMiniatureBySlug } from "@/lib/miniatures"
import { absoluteUrl } from "@/lib/site-url"
import { coverOf, photoUrl } from "@/lib/urls"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const miniature = await getMiniatureBySlug(slug)
  if (!miniature) return { title: t("shelfEmpty") }
  const description = t("paintedBy", { painter: miniature.painterName })
  const cover = coverOf(miniature.photos)
  const image = cover ? absoluteUrl(photoUrl(cover.id, "display")) : undefined
  return {
    title: miniature.name,
    description,
    openGraph: {
      title: `${miniature.name} · ${SITE_TITLE}`,
      description,
      type: "article",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: miniature.name,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export default function MiniaturePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ photo?: string }>
}) {
  return (
    <Suspense
      fallback={
        <div className="flex-1 px-4 py-8">
          <GallerySkeleton />
        </div>
      }
    >
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
  const [miniature, admin, honored] = await Promise.all([
    getMiniatureBySlug(slug),
    isAdmin(),
    getHonoredEmissary(),
  ])
  if (!miniature) notFound()
  const isHonored = honored?.id === miniature.id
  const galleryPhotos = miniature.photos.map((photo) => ({
    ...photo,
    miniatureName: miniature.name,
    miniatureSlug: miniature.slug,
    painterName: miniature.painterName,
    sourceName: miniature.sourceName,
    sourceUrl: miniature.sourceUrl,
  }))

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-8 sm:px-6"
    >
      <div className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:items-end">
        <div>
          <p className="font-display text-[0.7rem] tracking-[0.32em] text-gold/80 uppercase">
            {isHonored ? t("honoredEmissary") : t("miniatureEyebrow")}
          </p>
          <h1 className="font-display mt-1 text-4xl text-gold sm:text-5xl">{miniature.name}</h1>
          <p className="mt-3 text-lg">
            {t("paintedBy", { painter: miniature.painterName })}
          </p>
        </div>
        <div className="vault-frame space-y-3 rounded-md bg-card/75 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">
              {t("photographCount", {
                count: miniature.photos.length,
                plural: plural(miniature.photos.length),
              })}
            </Badge>
            {miniature.sourceName ? (
              <Badge variant="secondary">{miniature.sourceName}</Badge>
            ) : null}
          </div>
          {miniature.sourceUrl ? (
            <a
              href={miniature.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-gold hover:underline"
            >
              {t("onlineSource")}
              <ExternalLink className="size-3.5" />
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">{t("noSourceUrl")}</p>
          )}
          {admin ? (
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                size="sm"
                nativeButton={false}
                render={<Link href={`/admin/miniatures/${miniature.id}/edit`} />}
              >
                <Pencil data-icon="inline-start" />
                {t("edit")}
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
        <p className="text-muted-foreground">{t("noPhotographsHung")}</p>
      ) : (
        <DetailGallery
          photos={galleryPhotos}
          slug={miniature.slug}
          activePhotoId={photoId}
        />
      )}

      {miniature.photos.length > 0 ? (
        <p className="mt-4 text-xs text-muted-foreground">
          {t("originalHint", {
            example: miniature.photos[0]
              ? ` (example: ${photoUrl(miniature.photos[0].id, "original")}).`
              : ".",
          })}
        </p>
      ) : null}
    </main>
  )
}
