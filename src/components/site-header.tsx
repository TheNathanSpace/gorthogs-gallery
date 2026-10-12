import Link from "next/link"
import { KeyRound, ScrollText } from "lucide-react"

import { logoutAction } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { isAdmin } from "@/lib/auth"
import { SITE_TAGLINE, SITE_TITLE } from "@/lib/config"

export async function SiteHeader() {
  const admin = await isAdmin()

  return (
    <header className="sticky top-0 z-40 border-b border-gold/25 bg-[color-mix(in_oklch,var(--background)_88%,black)]/85 backdrop-blur-md">
      <div className="ornament-rule" />
      <div className="mx-auto flex w-full max-w-[1600px] items-center gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="group min-w-0 flex-1">
          <p className="font-display text-[0.65rem] tracking-[0.35em] text-gold/80 uppercase">
            Painted host
          </p>
          <h1 className="font-display truncate text-xl leading-tight text-gold sm:text-2xl">
            {SITE_TITLE}
          </h1>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">
            {SITE_TAGLINE}
          </p>
        </Link>
        <nav className="flex shrink-0 items-center gap-1.5">
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/" />}>
            <ScrollText data-icon="inline-start" />
            Library
          </Button>
          {admin ? (
            <>
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href="/admin" />}
              >
                Ledger
              </Button>
              <form action={logoutAction}>
                <Button variant="ghost" size="sm" type="submit">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/login" />}
            >
              <KeyRound data-icon="inline-start" />
              Keeper
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}
