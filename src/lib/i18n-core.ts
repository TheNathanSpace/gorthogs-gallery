import { catalogs, en, type Locale, type MessageKey } from "@/lib/messages"

export type { MessageKey, Locale }
export type MessageVars = Record<string, string | number | undefined>

export function interpolate(template: string, vars?: MessageVars): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, name: string) => {
    const value = vars[name]
    return value === undefined ? `{${name}}` : String(value)
  })
}

export function translate(
  key: MessageKey,
  vars?: MessageVars,
  loc: Locale = "en"
): string {
  const catalog = catalogs[loc] ?? en
  const template = catalog[key] ?? en[key]
  return interpolate(template, vars)
}

export function plural(count: number): string {
  return count === 1 ? "" : "s"
}

export function photoAltText(name: string, painter: string, loc: Locale = "en"): string {
  return translate("photoAlt", { name, painter }, loc)
}
