import Link from "next/link"

import { photoAlt, t } from "@/lib/i18n"
import type { MiniatureWithPhotos } from "@/lib/miniatures"
import { coverOf, miniaturePath, photoUrl } from "@/lib/urls"

export function HonoredEmissaryBanner({ miniature }: { miniature: MiniatureWithPhotos }) {
  const cover = coverOf(miniature.photos)
  const href = miniaturePath(miniature.slug)

  return (
    <section
      aria-labelledby="honored-emissary-heading"
      className="vault-frame mb-8 overflow-hidden rounded-md bg-card/80"
    >
      <div className="grid md:grid-cols-[minmax(14rem,22rem)_minmax(0,1fr)]">
        <Link href={href} className="photo-plate relative block min-h-64 overflow-hidden md:min-h-full">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl(cover.id, "display")}
              alt={photoAlt(miniature.name, miniature.painterName)}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full min-h-64 items-center justify-center bg-muted px-4 text-center text-sm text-muted-foreground">
              {t("noPhotographsYet")}
            </div>
          )}
        </Link>
        <div className="flex flex-col justify-center gap-3 p-6 sm:p-8">
          <p className="font-display text-[0.7rem] tracking-[0.32em] text-gold/80 uppercase">
            {t("honoredEmissary")}
          </p>
          <div className="ornament-rule w-24" />
          <h2
            id="honored-emissary-heading"
            className="font-display text-4xl leading-tight text-gold sm:text-5xl"
          >
            <Link href={href} className="hover:underline">
              {miniature.name}
            </Link>
          </h2>
          <p className="text-lg">{t("paintedBy", { painter: miniature.painterName })}</p>
          {miniature.sourceName ? (
            <p className="text-sm text-muted-foreground">{miniature.sourceName}</p>
          ) : null}
          {miniature.notes ? (
            <p className="line-clamp-3 max-w-prose text-sm leading-relaxed text-foreground/90">
              {miniature.notes}
            </p>
          ) : null}
          <Link href={href} className="mt-1 w-fit text-sm text-gold hover:underline">
            {t("viewHonoredEntry")}
          </Link>
        </div>
      </div>
    </section>
  )
}
