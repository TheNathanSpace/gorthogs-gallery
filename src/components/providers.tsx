"use client"

import { ThemeProvider } from "next-themes"

import { I18nProvider } from "@/components/i18n-provider"
import { Toaster } from "@/components/ui/sonner"
import type { Locale } from "@/lib/messages"

export function Providers({
  locale,
  children,
}: {
  locale: Locale
  children: React.ReactNode
}) {
  return (
    <I18nProvider locale={locale}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        storageKey="reliquary-theme"
        themes={["system", "night", "parchment", "high-contrast"]}
        value={{
          night: "night",
          parchment: "parchment",
          "high-contrast": "high-contrast",
          dark: "night",
          light: "parchment",
        }}
        disableTransitionOnChange
      >
        {children}
        <Toaster position="bottom-right" />
      </ThemeProvider>
    </I18nProvider>
  )
}
