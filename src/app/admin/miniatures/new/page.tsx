import { Suspense } from "react"

import { MiniatureForm } from "@/components/admin/miniature-form"
import { requireAdmin } from "@/lib/auth"
import { t } from "@/lib/i18n"

export default function NewMiniaturePage() {
  return (
    <Suspense
      fallback={
        <main
          id="main-content"
          className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 text-muted-foreground"
        >
          {t("preparingPlate")}
        </main>
      }
    >
      <NewMiniature />
    </Suspense>
  )
}

async function NewMiniature() {
  await requireAdmin()

  return (
    <main id="main-content" className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
      <p className="font-display text-[0.7rem] tracking-[0.32em] text-gold/80 uppercase">
        {t("newPlate")}
      </p>
      <h1 className="font-display mb-6 text-3xl text-gold">{t("recordMiniature")}</h1>
      <div className="vault-frame rounded-md bg-card/80 p-5">
        <MiniatureForm mode="create" />
      </div>
    </main>
  )
}
