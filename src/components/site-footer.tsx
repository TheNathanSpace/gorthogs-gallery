import { SITE_TITLE } from "@/lib/config"

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-gold/20">
      <div className="ornament-rule" />
      <div className="mx-auto flex max-w-[1600px] flex-col gap-1 px-4 py-5 text-center text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <p className="font-display tracking-[0.2em] text-gold/70 uppercase">
          {SITE_TITLE}
        </p>
        <p>A private vault of painted miniatures. Public to browse, locked to keep.</p>
      </div>
    </footer>
  )
}
