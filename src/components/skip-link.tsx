import { t } from "@/lib/i18n"

export function SkipLink() {
  return (
    <a href="#main-content" className="skip-link">
      {t("skipToContent")}
    </a>
  )
}
