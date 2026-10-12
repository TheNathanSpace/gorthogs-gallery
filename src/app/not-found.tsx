import Link from "next/link"

import { Button } from "@/components/ui/button"
import { t } from "@/lib/i18n"

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-16 text-center"
    >
      <p className="font-display text-[0.7rem] tracking-[0.32em] text-gold/80 uppercase">
        {t("uncatalogued")}
      </p>
      <h1 className="font-display mt-2 text-3xl text-gold">{t("shelfEmpty")}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{t("notFoundBody")}</p>
      <Button className="mt-6" nativeButton={false} render={<Link href="/" />}>
        {t("returnLibrary")}
      </Button>
    </main>
  )
}
