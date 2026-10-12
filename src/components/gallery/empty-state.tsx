import Link from "next/link"

import { Button } from "@/components/ui/button"

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
        Empty shelves
      </p>
      <h2 className="mt-2 font-display text-2xl text-gold">
        {filtered ? "Nothing matches that search" : "The vault is waiting"}
      </h2>
      <p className="mt-3 text-sm text-muted-foreground">
        {filtered
          ? "Clear the search or pick another painter to see the rest of the host."
          : isAdmin
            ? "Create the first miniature from the ledger. Name, painter, source, and photographs will appear here."
            : "The keeper has not entered any miniatures yet. Return once the first plates are hung."}
      </p>
      {isAdmin && !filtered ? (
        <Button className="mt-6" nativeButton={false} render={<Link href="/admin/miniatures/new" />}>
          Record a miniature
        </Button>
      ) : null}
    </div>
  )
}
