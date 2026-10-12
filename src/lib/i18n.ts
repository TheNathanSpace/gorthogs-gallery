import { catalogs, type Locale } from "@/lib/messages"
import { LOCALE } from "@/lib/config"
import { photoAltText, translate, type MessageKey, type MessageVars } from "@/lib/i18n-core"

export type { MessageKey, Locale, MessageVars }
export { plural } from "@/lib/i18n-core"

const supported = new Set(Object.keys(catalogs))

export function resolveLocale(value = LOCALE): Locale {
  const normalized = value.trim().toLowerCase()
  const short = normalized.split("-")[0] ?? "en"
  if (supported.has(short)) return short as Locale
  return "en"
}

export const locale = resolveLocale()

export function t(key: MessageKey, vars?: MessageVars): string {
  return translate(key, vars, locale)
}

export function photoAlt(name: string, painter: string): string {
  return photoAltText(name, painter, locale)
}

export function htmlLang(): string {
  return locale
}
