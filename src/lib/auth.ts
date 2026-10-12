import "server-only"

import { timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { ADMIN_PASSWORD, ADMIN_USERNAME } from "@/lib/config"
import {
  SESSION_COOKIE,
  sessionCookieOptions,
  signSession,
  verifySessionToken,
} from "@/lib/session"

const attempts = new Map<string, { count: number; resetAt: number }>()

export async function getSession() {
  const jar = await cookies()
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value)
}

export async function isAdmin() {
  return Boolean(await getSession())
}

export async function requireAdmin() {
  const session = await getSession()
  if (!session) redirect("/login")
  return session
}

export function credentialsMatch(username: string, password: string): boolean {
  return safeEqual(username, ADMIN_USERNAME) && safeEqual(password, ADMIN_PASSWORD)
}

export async function establishSession(username: string) {
  const token = await signSession(username)
  const jar = await cookies()
  jar.set(SESSION_COOKIE, token, sessionCookieOptions())
}

export async function clearSession() {
  const jar = await cookies()
  jar.delete(SESSION_COOKIE)
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

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  if (left.length !== right.length) {
    timingSafeEqual(left, left)
    return false
  }
  return timingSafeEqual(left, right)
}
