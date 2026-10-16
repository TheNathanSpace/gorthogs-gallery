"use client"

import { useActionState } from "react"

import { setHonoredEmissaryAction } from "@/app/actions/miniatures"
import { useT } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export function HonoredEmissaryForm({
  entries,
  currentId,
}: {
  entries: { id: string; name: string; painterName: string }[]
  currentId: string | null
}) {
  const { t } = useT()
  const [state, action, pending] = useActionState(setHonoredEmissaryAction, undefined)
  const saved = state !== undefined && !state.error

  return (
    <form action={action} className="mt-4 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1 space-y-1.5">
          <Label htmlFor="honoredMiniature">{t("honoredChoose")}</Label>
          <select
            id="honoredMiniature"
            name="miniatureId"
            defaultValue={currentId ?? ""}
            className="h-9 w-full rounded-lg border border-input bg-background/60 px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">{t("honoredNone")}</option>
            {entries.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.name} — {entry.painterName}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? t("savingHonor") : t("saveHonor")}
        </Button>
      </div>
      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      {saved ? (
        <p className="text-sm text-muted-foreground" role="status">
          {t("honorSaved")}
        </p>
      ) : null}
    </form>
  )
}
