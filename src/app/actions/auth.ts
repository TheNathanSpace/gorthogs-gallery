"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"

import {
  allowLoginAttempt,
  clearLoginAttempts,
  clearSession,
  establishSession,
  establishSetupSession,
  getSetupSession,
  requireAdmin,
} from "@/lib/auth"
import { ensureDb } from "@/lib/db"
import { t } from "@/lib/i18n"
import { setKeeperPassword, verifyCredentials } from "@/lib/keepers"
import { evaluatePassword } from "@/lib/password"

export type LoginState = { error?: string; setup?: boolean } | undefined

function clientKey(h: Headers): string {
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "local"
  )
}

function safeNext(value: string): string {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/admin"
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  await ensureDb()
  const username = String(formData.get("username") ?? "")
  const password = String(formData.get("password") ?? "")
  const dest = safeNext(String(formData.get("next") ?? "/admin"))

  const h = await headers()
  const ip = clientKey(h)

  if (!allowLoginAttempt(ip)) {
    return { error: t("tooManyAttempts") }
  }

  const check = await verifyCredentials(username, password)
  if (!check.ok) {
    return { error: t("badCredentials") }
  }

  clearLoginAttempts(ip)
  if (check.mustSetPassword) {
    await establishSetupSession(username)
    return { setup: true }
  }

  await establishSession(username)
  redirect(dest)
}

export async function setPasswordAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  await ensureDb()
  const setup = await getSetupSession()
  if (!setup) {
    return { error: t("setupExpired") }
  }

  const password = String(formData.get("newPassword") ?? "")
  const confirm = String(formData.get("confirmPassword") ?? "")
  const dest = safeNext(String(formData.get("next") ?? "/admin"))
  const issues = await evaluatePassword(password, confirm)
  if (issues.length > 0) {
    return { error: t(issues[0]), setup: true }
  }

  await setKeeperPassword(password)
  await establishSession(setup.sub)
  redirect(dest)
}

export async function changePasswordAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const session = await requireAdmin()
  await ensureDb()
  const current = String(formData.get("currentPassword") ?? "")
  const password = String(formData.get("newPassword") ?? "")
  const confirm = String(formData.get("confirmPassword") ?? "")

  const check = await verifyCredentials(session.sub, current)
  if (!check.ok || check.mustSetPassword) {
    return { error: t("badCredentials") }
  }

  const issues = await evaluatePassword(password, confirm)
  if (issues.length > 0) {
    return { error: t(issues[0]) }
  }

  await setKeeperPassword(password)
  return { error: undefined }
}

export async function logoutAction() {
  await clearSession()
  redirect("/")
}
