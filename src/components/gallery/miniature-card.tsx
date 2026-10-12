import Link from "next/link"

import { Badge } from "@/components/ui/badge"
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
            className="size-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-muted text-sm text-muted-foreground">
            No photographs yet
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3">
          <h2 className="font-display text-lg leading-tight text-gold">
            {miniature.name}
          </h2>
          <p className="text-xs text-foreground/80">Painted by {miniature.painterName}</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <span className="truncate text-xs text-muted-foreground">
          {miniature.sourceName ?? "Source unrecorded"}
        </span>
        <Badge variant="outline">{miniature.photos.length} plate{miniature.photos.length === 1 ? "" : "s"}</Badge>
      </div>
    </Link>
  )
}
