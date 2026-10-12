"use client"

import { useActionState } from "react"

import { changePasswordAction } from "@/app/actions/auth"
import { useT } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ChangePasswordForm() {
  const { t } = useT()
  const [state, action, pending] = useActionState(changePasswordAction, undefined)
  const saved = state !== undefined && !state.error

  return (
    <form action={action} className="mt-8 max-w-md space-y-3">
      <h2 className="font-display text-lg text-gold">{t("changeVaultKey")}</h2>
      <p className="text-sm text-muted-foreground">{t("changeKeyIntro")}</p>
      <div className="space-y-1.5">
        <Label htmlFor="currentPassword">{t("currentVaultKey")}</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          className="h-9 bg-background/60"
        />
      </div>
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
      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      {saved ? (
        <p className="text-sm text-gold" role="status">
          {t("keyUpdated")}
        </p>
      ) : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? t("inscribing") : t("saveVaultKey")}
      </Button>
    </form>
  )
}
