"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"

import {
  allowLoginAttempt,
  clearLoginAttempts,
  clearSession,
  credentialsMatch,
  establishSession,
} from "@/lib/auth"
import { t } from "@/lib/i18n"

export type LoginState = { error?: string } | undefined

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "")
  const password = String(formData.get("password") ?? "")
  const next = String(formData.get("next") ?? "/admin")
  const dest = next.startsWith("/") && !next.startsWith("//") ? next : "/admin"

  const h = await headers()
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "local"

  if (!allowLoginAttempt(ip)) {
    return { error: t("tooManyAttempts") }
  }

  if (!credentialsMatch(username, password)) {
    return { error: t("badCredentials") }
  }

  clearLoginAttempts(ip)
  await establishSession(username)
  redirect(dest)
}

export async function logoutAction() {
  await clearSession()
  redirect("/")
}
