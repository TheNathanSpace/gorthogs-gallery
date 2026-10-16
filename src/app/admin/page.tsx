import Link from "next/link"
import { Plus } from "lucide-react"
import { Suspense } from "react"

import { ChangePasswordForm } from "@/components/admin/change-password-form"
import { DeleteMiniatureButton } from "@/components/admin/delete-miniature-button"
import { HonoredEmissaryForm } from "@/components/admin/honored-emissary-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { requireAdmin } from "@/lib/auth"
import { getHonoredEmissary } from "@/lib/honored"
import { t, plural } from "@/lib/i18n"
import { listMiniatures } from "@/lib/miniatures"
import { coverOf, miniaturePath, photoUrl } from "@/lib/urls"

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <main
          id="main-content"
          className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 text-muted-foreground"
        >
          {t("openingLedger")}
        </main>
      }
    >
      <Ledger />
    </Suspense>
  )
}

async function Ledger() {
  await requireAdmin()
  const [entries, honored] = await Promise.all([listMiniatures(), getHonoredEmissary()])

  return (
    <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-[0.7rem] tracking-[0.32em] text-gold/80 uppercase">
            {t("keepersLedger")}
          </p>
          <h1 className="font-display text-3xl text-gold">{t("catalog")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("catalogIntro")}</p>
        </div>
        <Button nativeButton={false} render={<Link href="/admin/miniatures/new" />}>
          <Plus data-icon="inline-start" />
          {t("newMiniature")}
        </Button>
      </div>

      {entries.length > 0 ? (
        <section className="vault-frame mb-6 rounded-md bg-card/75 p-4 sm:p-5">
          <h2 className="font-display text-xl text-gold">{t("honoredEmissary")}</h2>
          <p className="mt-1 max-w-prose text-sm text-muted-foreground">
            {t("honoredEmissaryIntro")}
          </p>
          <p className="mt-3 text-sm">
            {honored ? t("honoredCurrent", { name: honored.name }) : t("honoredCurrentNone")}
          </p>
          <HonoredEmissaryForm
            key={honored?.id ?? "none"}
            currentId={honored?.id ?? null}
            entries={entries.map((entry) => ({
              id: entry.id,
              name: entry.name,
              painterName: entry.painterName,
            }))}
          />
        </section>
      ) : null}

      {entries.length === 0 ? (
        <div className="vault-frame rounded-md bg-card/70 px-6 py-10 text-center">
          <p className="font-display text-xl text-gold">{t("noEntriesYet")}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t("recordFirst")}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => {
            const cover = coverOf(entry.photos)
            return (
              <li
                key={entry.id}
                className="vault-frame flex gap-3 overflow-hidden rounded-md bg-card/75 p-3"
              >
                <div className="photo-plate size-20 shrink-0 overflow-hidden">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photoUrl(cover.id, "thumb")}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="size-full bg-muted" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={miniaturePath(entry.slug)}
                      className="font-display text-lg text-gold hover:underline"
                    >
                      {entry.name}
                    </Link>
                    {entry.id === honored?.id ? <Badge>{t("honoredEmissary")}</Badge> : null}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {entry.painterName}
                    {entry.sourceName ? ` · ${entry.sourceName}` : ""} ·{" "}
                    {t("plateCount", {
                      count: entry.photos.length,
                      plural: plural(entry.photos.length),
                    })}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-1 sm:flex-row sm:items-center">
                  <Button
                    size="sm"
                    variant="outline"
                    nativeButton={false}
                    render={<Link href={`/admin/miniatures/${entry.id}/edit`} />}
                  >
                    {t("edit")}
                  </Button>
                  <DeleteMiniatureButton id={entry.id} slug={entry.slug} name={entry.name} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
      <ChangePasswordForm />
    </main>
  )
}
