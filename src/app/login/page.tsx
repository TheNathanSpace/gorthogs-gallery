import { redirect } from "next/navigation"
import { Suspense } from "react"

import { LoginForm } from "@/components/admin/login-form"
import { getSession, getSetupSession } from "@/lib/auth"
import { ensureDb } from "@/lib/db"
import { t } from "@/lib/i18n"
import { keeperPasswordIsSet } from "@/lib/keepers"

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  return (
    <Suspense
      fallback={
        <main
          id="main-content"
          className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12 text-muted-foreground"
        >
          {t("openingDoor")}
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
  await ensureDb()
  const session = await getSession()
  const { next } = await searchParams
  const dest = next?.startsWith("/") && !next.startsWith("//") ? next : "/admin"
  if (session) redirect(dest)
  const setup = Boolean(await getSetupSession())
  const bootstrap = !keeperPasswordIsSet()

  return (
    <main
      id="main-content"
      className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12"
    >
      <div className="vault-frame rounded-md bg-card/80 p-6">
        <p className="font-display text-[0.7rem] tracking-[0.32em] text-gold/80 uppercase">
          {t("keepersDoor")}
        </p>
        <h1 className="font-display mt-1 text-3xl text-gold">
          {setup ? t("chooseKeyTitle") : t("signIn")}
        </h1>
        <p className="mt-2 mb-6 text-sm text-muted-foreground">{t("loginIntro")}</p>
        <LoginForm nextPath={dest} bootstrap={bootstrap} initialSetup={setup} />
      </div>
    </main>
  )
}
