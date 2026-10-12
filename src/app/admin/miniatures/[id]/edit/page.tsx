import { notFound } from "next/navigation"
import { Suspense } from "react"

import { DeleteMiniatureButton } from "@/components/admin/delete-miniature-button"
import { MiniatureForm } from "@/components/admin/miniature-form"
import { requireAdmin } from "@/lib/auth"
import { t } from "@/lib/i18n"
import { getMiniatureById } from "@/lib/miniatures"

export default function EditMiniaturePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <Suspense
      fallback={
        <main
          id="main-content"
          className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 text-muted-foreground"
        >
          {t("fetchingLedger")}
        </main>
      }
    >
      <Edit params={params} />
    </Suspense>
  )
}

async function Edit({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const miniature = await getMiniatureById(id)
  if (!miniature) notFound()

  return (
    <main id="main-content" className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <p className="font-display text-[0.7rem] tracking-[0.32em] text-gold/80 uppercase">
            {t("amendLedger")}
          </p>
          <h1 className="font-display text-3xl text-gold">{miniature.name}</h1>
        </div>
        <DeleteMiniatureButton
          id={miniature.id}
          slug={miniature.slug}
          name={miniature.name}
        />
      </div>
      <div className="vault-frame rounded-md bg-card/80 p-5">
        <MiniatureForm mode="edit" miniature={miniature} />
      </div>
    </main>
  )
}
