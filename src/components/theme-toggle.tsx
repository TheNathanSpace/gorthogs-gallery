"use client"

import { Contrast, Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"

import { useT } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const THEMES = ["system", "night", "parchment", "high-contrast"] as const

export function ThemeToggle() {
  const { t } = useT()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const current = mounted ? (theme ?? "system") : "system"
  const resolved = mounted ? (resolvedTheme ?? "night") : "night"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label={t("theme")} />
        }
      >
        {resolved === "parchment" ? (
          <Sun className="size-4" />
        ) : resolved === "high-contrast" ? (
          <Contrast className="size-4" />
        ) : (
          <Moon className="size-4" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuLabel>{t("theme")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={current} onValueChange={setTheme}>
          {THEMES.map((value) => (
            <DropdownMenuRadioItem key={value} value={value}>
              {value === "system" ? (
                <Monitor className="size-3.5" />
              ) : value === "night" ? (
                <Moon className="size-3.5" />
              ) : value === "parchment" ? (
                <Sun className="size-3.5" />
              ) : (
                <Contrast className="size-3.5" />
              )}
              {themeLabel(value, t)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function themeLabel(
  value: (typeof THEMES)[number],
  t: ReturnType<typeof useT>["t"]
): string {
  switch (value) {
    case "parchment":
      return t("themeParchment")
    case "high-contrast":
      return t("themeHighContrast")
    case "night":
      return t("themeNight")
    default:
      return t("themeSystem")
  }
}
