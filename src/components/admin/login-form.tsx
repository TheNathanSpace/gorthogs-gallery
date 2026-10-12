"use client"

import { useActionState } from "react"

import { loginAction, setPasswordAction } from "@/app/actions/auth"
import { useT } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm({
  nextPath,
  bootstrap,
  initialSetup = false,
}: {
  nextPath: string
  bootstrap: boolean
  initialSetup?: boolean
}) {
  const { t } = useT()
  const [loginState, login, loggingIn] = useActionState(loginAction, undefined)
  const [setState, setPassword, setting] = useActionState(
    setPasswordAction,
    undefined
  )
  const setup = Boolean(initialSetup || loginState?.setup || setState?.setup)
  const error = setup ? setState?.error : loginState?.error
  const pending = setup ? setting : loggingIn

  if (setup) {
    return (
      <form action={setPassword} className="space-y-4">
        <input type="hidden" name="next" value={nextPath} />
        <p className="text-sm text-muted-foreground">{t("chooseKeyIntro")}</p>
        <div className="space-y-1.5">
          <Label htmlFor="newPassword">{t("newVaultKey")}</Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={15}
            maxLength={256}
            className="h-9 bg-background/60"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">{t("confirmVaultKey")}</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={15}
            maxLength={256}
            className="h-9 bg-background/60"
          />
        </div>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? t("inscribing") : t("lockTheVault")}
        </Button>
      </form>
    )
  }

  return (
    <form action={login} className="space-y-4">
      <input type="hidden" name="next" value={nextPath} />
      {bootstrap ? (
        <p className="text-sm text-muted-foreground">{t("bootstrapHint")}</p>
      ) : null}
      <div className="space-y-1.5">
        <Label htmlFor="username">{t("keeperName")}</Label>
        <Input
          id="username"
          name="username"
          autoComplete="username"
          required
          className="h-9 bg-background/60"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">{t("vaultKey")}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-9 bg-background/60"
        />
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("turningKey") : t("openLedger")}
      </Button>
    </form>
  )
}
