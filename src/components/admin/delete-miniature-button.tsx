"use client"

import { deleteMiniatureAction } from "@/app/actions/miniatures"
import { useT } from "@/components/i18n-provider"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

export function DeleteMiniatureButton({
  id,
  slug,
  name,
}: {
  id: string
  slug: string
  name: string
}) {
  const { t } = useT()
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="destructive" size="sm">
            {t("removeFromVault")}
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("removeTitle", { name })}</AlertDialogTitle>
          <AlertDialogDescription>{t("removeBody")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("keepIt")}</AlertDialogCancel>
          <form action={deleteMiniatureAction}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="slug" value={slug} />
            <Button variant="destructive" type="submit">
              {t("delete")}
            </Button>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
