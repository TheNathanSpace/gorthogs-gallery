"use client"

import { useActionState } from "react"

import { loginAction } from "@/app/actions/auth"
import { useT } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm({ nextPath }: { nextPath: string }) {
  const { t } = useT()
  const [state, action, pending] = useActionState(loginAction, undefined)

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={nextPath} />
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
      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("turningKey") : t("openLedger")}
      </Button>
    </form>
  )
}
