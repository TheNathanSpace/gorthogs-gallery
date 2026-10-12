import Link from "next/link"

import { Button } from "@/components/ui/button"
import { t } from "@/lib/i18n"

export function EmptyState({
  isAdmin,
  filtered,
}: {
  isAdmin: boolean
  filtered: boolean
}) {
  return (
    <div className="vault-frame mx-auto max-w-xl rounded-md bg-card/70 px-6 py-12 text-center">
      <p className="font-display text-[0.7rem] tracking-[0.3em] text-gold/80 uppercase">
        {t("emptyShelves")}
      </p>
      <h2 className="mt-2 font-display text-2xl text-gold">
        {filtered ? t("emptyFilteredTitle") : t("emptyTitle")}
      </h2>
      <p className="mt-3 text-sm text-muted-foreground">
        {filtered
          ? t("emptyFilteredBody")
          : isAdmin
            ? t("emptyAdminBody")
            : t("emptyVisitorBody")}
      </p>
      {isAdmin && !filtered ? (
        <Button className="mt-6" nativeButton={false} render={<Link href="/admin/miniatures/new" />}>
          {t("recordMiniature")}
        </Button>
      ) : null}
    </div>
  )
}
