import { PUBLIC_BASE_URL } from "@/lib/config"

export function publicBaseUrl(): string | undefined {
  return PUBLIC_BASE_URL || undefined
}

export function absoluteUrl(pathname: string): string | undefined {
  const base = publicBaseUrl()
  if (!base) return undefined
  if (!pathname.startsWith("/")) return `${base}/${pathname}`
  return `${base}${pathname}`
}
