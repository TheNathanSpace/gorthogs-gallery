import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { t, plural } from "@/lib/i18n"
import type { MiniatureWithPhotos } from "@/lib/miniatures"
import { coverOf, miniaturePath, photoUrl } from "@/lib/urls"

export function MiniatureCard({ miniature }: { miniature: MiniatureWithPhotos }) {
  const cover = coverOf(miniature.photos)

  return (
    <Link
      href={miniaturePath(miniature.slug)}
      className="vault-frame group overflow-hidden rounded-md bg-card/80"
    >
      <div className="photo-plate relative aspect-[4/5] overflow-hidden">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl(cover.id, "thumb")}
            alt=""
            className="size-full object-cover motion-safe:transition motion-safe:duration-500 motion-safe:group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-muted text-sm text-muted-foreground">
            {t("noPhotographsYet")}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3">
          <h2 className="font-display text-lg leading-tight text-gold">
            {miniature.name}
          </h2>
          <p className="text-xs text-foreground/80">
            {t("paintedBy", { painter: miniature.painterName })}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <span className="truncate text-xs text-muted-foreground">
          {miniature.sourceName ?? t("sourceUnrecorded")}
        </span>
        <Badge variant="outline">
          {t("plateCount", {
            count: miniature.photos.length,
            plural: plural(miniature.photos.length),
          })}
        </Badge>
      </div>
    </Link>
  )
}
