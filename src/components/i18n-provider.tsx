"use client"

import { createContext, useContext, useMemo } from "react"

import {
  photoAltText,
  plural,
  translate,
  type Locale,
  type MessageKey,
  type MessageVars,
} from "@/lib/i18n-core"

type I18nValue = {
  locale: Locale
  t: (key: MessageKey, vars?: MessageVars) => string
  photoAlt: (name: string, painter: string) => string
  plural: (count: number) => string
}

const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale
  children: React.ReactNode
}) {
  const value = useMemo<I18nValue>(
    () => ({
      locale,
      t: (key, vars) => translate(key, vars, locale),
      photoAlt: (name, painter) => photoAltText(name, painter, locale),
      plural,
    }),
    [locale]
  )
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useT(): I18nValue {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    return {
      locale: "en",
      t: (key, vars) => translate(key, vars, "en"),
      photoAlt: (name, painter) => photoAltText(name, painter, "en"),
      plural,
    }
  }
  return ctx
}
