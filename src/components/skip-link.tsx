"use client"

import { useT } from "@/components/i18n-provider"

export function SkipLink() {
  const { t } = useT()
  return (
    <a
      href="#main-content"
      className="skip-link"
    >
      {t("skipToContent")}
    </a>
  )
}
