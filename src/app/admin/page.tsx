import Link from "next/link"
import { Plus } from "lucide-react"
import { Suspense } from "react"

import { DeleteMiniatureButton } from "@/components/admin/delete-miniature-button"
import { Button } from "@/components/ui/button"
import { requireAdmin } from "@/lib/auth"
import { listMiniatures } from "@/lib/miniatures"
import { coverOf, miniaturePath, photoUrl } from "@/lib/urls"

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 text-muted-foreground">
          Opening the ledger…
        </main>
      }
    >
      <Ledger />
    </Suspense>
  )
}

async function Ledger() {
  await requireAdmin()
  const entries = await listMiniatures()

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-[0.7rem] tracking-[0.32em] text-gold/80 uppercase">
            Keeper&apos;s ledger
          </p>
          <h1 className="font-display text-3xl text-gold">Catalog</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and tend entries. The public library updates as soon as you save.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/admin/miniatures/new" />}>
          <Plus data-icon="inline-start" />
          New miniature
        </Button>
      </div>

      {entries.length === 0 ? (
        <div className="vault-frame rounded-md bg-card/70 px-6 py-10 text-center">
          <p className="font-display text-xl text-gold">No entries yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Record the first miniature to populate the vault.
          </p>
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
                  <Link
                    href={miniaturePath(entry.slug)}
                    className="font-display text-lg text-gold hover:underline"
                  >
                    {entry.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {entry.painterName}
                    {entry.sourceName ? ` · ${entry.sourceName}` : ""} · {entry.photos.length} photo{entry.photos.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-1 sm:flex-row sm:items-center">
                  <Button
                    size="sm"
                    variant="outline"
                    nativeButton={false}
                    render={<Link href={`/admin/miniatures/${entry.id}/edit`} />}
                  >
                    Edit
                  </Button>
                  <DeleteMiniatureButton id={entry.id} slug={entry.slug} name={entry.name} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
