import "server-only"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { ADMIN_USERNAME } from "@/lib/config"
import {
  SESSION_COOKIE,
  SETUP_COOKIE,
  sessionCookieOptions,
  setupCookieOptions,
  signSession,
  signSetupToken,
  verifySessionToken,
  verifySetupToken,
} from "@/lib/session"

const attempts = new Map<string, { count: number; resetAt: number }>()

export async function getSession() {
  const jar = await cookies()
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value)
}

export async function getSetupSession() {
  const jar = await cookies()
  return verifySetupToken(jar.get(SETUP_COOKIE)?.value)
}

export async function isAdmin() {
  return Boolean(await getSession())
}

export async function requireAdmin() {
  const session = await getSession()
  if (!session) redirect("/login")
  return session
}

export async function establishSession(username: string) {
  const token = await signSession(username)
  const jar = await cookies()
  jar.delete(SETUP_COOKIE)
  jar.set(SESSION_COOKIE, token, sessionCookieOptions())
}

export async function establishSetupSession(username: string) {
  const token = await signSetupToken(username)
  const jar = await cookies()
  jar.set(SETUP_COOKIE, token, setupCookieOptions())
}

export async function clearSession() {
  const jar = await cookies()
  jar.delete(SESSION_COOKIE)
  jar.delete(SETUP_COOKIE)
}

export function allowLoginAttempt(key: string): boolean {
  const now = Date.now()
  const rec = attempts.get(key)
  if (!rec || rec.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + 5 * 60 * 1000 })
    return true
  }
  rec.count += 1
  if (rec.count > 8) return false
  return true
}

export function clearLoginAttempts(key: string) {
  attempts.delete(key)
}

export { ADMIN_USERNAME }
