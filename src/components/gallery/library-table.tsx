import Link from "next/link"
import { ExternalLink } from "lucide-react"

import { formatVaultDate } from "@/lib/dates"
import { t } from "@/lib/i18n"
import type { MiniatureWithPhotos } from "@/lib/miniatures"
import { coverOf, miniaturePath, photoUrl } from "@/lib/urls"

export function LibraryTable({ miniatures }: { miniatures: MiniatureWithPhotos[] }) {
  return (
    <div className="vault-frame overflow-hidden rounded-md bg-card/70">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[56rem] border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[color-mix(in_oklch,var(--card)_92%,black)] text-[0.7rem] tracking-[0.14em] text-gold uppercase">
            <tr className="border-b border-gold/25">
              <th className="px-3 py-2 font-display font-normal">{t("tablePlate")}</th>
              <th className="px-3 py-2 font-display font-normal">{t("tableName")}</th>
              <th className="px-3 py-2 font-display font-normal">{t("tablePainter")}</th>
              <th className="px-3 py-2 font-display font-normal">{t("tableSource")}</th>
              <th className="px-3 py-2 font-display font-normal">{t("tableNotes")}</th>
              <th className="px-3 py-2 font-display font-normal">{t("tablePhotos")}</th>
              <th className="px-3 py-2 font-display font-normal">{t("tableEntered")}</th>
              <th className="px-3 py-2 font-display font-normal">{t("tableUpdated")}</th>
            </tr>
          </thead>
          <tbody>
            {miniatures.map((entry) => {
              const cover = coverOf(entry.photos)
              return (
                <tr
                  key={entry.id}
                  className="border-b border-border/60 last:border-0 hover:bg-accent/35"
                >
                  <td className="px-3 py-2">
                    <Link href={miniaturePath(entry.slug)} className="block">
                      <span className="photo-plate block size-12 overflow-hidden">
                        {cover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={photoUrl(cover.id, "thumb")}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          <span className="block size-full bg-muted" />
                        )}
                      </span>
                    </Link>
                  </td>
                  <td className="px-3 py-2 align-middle">
                    <Link
                      href={miniaturePath(entry.slug)}
                      className="font-display text-base text-gold hover:underline"
                    >
                      {entry.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2 align-middle whitespace-nowrap">
                    {entry.painterName}
                  </td>
                  <td className="max-w-[14rem] px-3 py-2 align-middle">
                    {entry.sourceName || entry.sourceUrl ? (
                      <div className="space-y-0.5">
                        <p className="leading-snug">{entry.sourceName ?? "—"}</p>
                        {entry.sourceUrl ? (
                          <a
                            href={entry.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex max-w-full items-center gap-1 truncate text-xs text-gold hover:underline"
                          >
                            <span className="truncate">{prettyHost(entry.sourceUrl)}</span>
                            <ExternalLink className="size-3 shrink-0" />
                          </a>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="max-w-[20rem] px-3 py-2 align-middle text-muted-foreground">
                    <p className="line-clamp-2 leading-snug">
                      {entry.notes?.trim() ? entry.notes : "—"}
                    </p>
                  </td>
                  <td className="px-3 py-2 align-middle tabular-nums">
                    {entry.photos.length}
                  </td>
                  <td className="px-3 py-2 align-middle whitespace-nowrap text-muted-foreground">
                    {formatVaultDate(entry.createdAt)}
                  </td>
                  <td className="px-3 py-2 align-middle whitespace-nowrap text-muted-foreground">
                    {formatVaultDate(entry.updatedAt)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function prettyHost(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "")
  } catch {
    return url
  }
}
