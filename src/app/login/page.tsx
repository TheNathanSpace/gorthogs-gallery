import { redirect } from "next/navigation"
import { Suspense } from "react"

import { LoginForm } from "@/components/admin/login-form"
import { getSession } from "@/lib/auth"

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12 text-muted-foreground">
          Opening the keeper&apos;s door…
        </main>
      }
    >
      <Login searchParams={searchParams} />
    </Suspense>
  )
}

async function Login({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const session = await getSession()
  const { next } = await searchParams
  const dest = next?.startsWith("/") && !next.startsWith("//") ? next : "/admin"
  if (session) redirect(dest)

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
      <div className="vault-frame rounded-md bg-card/80 p-6">
        <p className="font-display text-[0.7rem] tracking-[0.32em] text-gold/80 uppercase">
          Keeper&apos;s door
        </p>
        <h1 className="font-display mt-1 text-3xl text-gold">Sign in</h1>
        <p className="mt-2 mb-6 text-sm text-muted-foreground">
          One account keeps the ledger. Visitors do not need a key to browse.
        </p>
        <LoginForm nextPath={dest} />
      </div>
    </main>
  )
}
