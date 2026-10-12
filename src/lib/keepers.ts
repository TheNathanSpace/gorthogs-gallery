import "server-only"

import { eq } from "drizzle-orm"

import { timingSafeEqual } from "node:crypto"

import { ADMIN_USERNAME } from "@/lib/config"
import { getDb } from "@/lib/db"
import {
  BOOTSTRAP_PASSWORD,
  hashPassword,
  matchesBootstrap,
  verifyPasswordHash,
} from "@/lib/password"
import { keepers } from "@/lib/schema"

export type CredentialCheck = {
  ok: boolean
  mustSetPassword: boolean
}

function usernameMatches(username: string): boolean {
  const left = Buffer.from(username)
  const right = Buffer.from(ADMIN_USERNAME)
  if (left.length !== right.length) {
    timingSafeEqual(left, left)
    return false
  }
  return timingSafeEqual(left, right)
}

export function keeperPasswordIsSet(): boolean {
  const row = getDb()
    .select({ hash: keepers.passwordHash })
    .from(keepers)
    .where(eq(keepers.username, ADMIN_USERNAME))
    .get()
  return Boolean(row?.hash)
}

export async function verifyCredentials(
  username: string,
  password: string
): Promise<CredentialCheck> {
  if (!usernameMatches(username)) {
    return { ok: false, mustSetPassword: false }
  }

  const row = getDb()
    .select()
    .from(keepers)
    .where(eq(keepers.username, ADMIN_USERNAME))
    .get()

  if (!row?.passwordHash) {
    return {
      ok: matchesBootstrap(password),
      mustSetPassword: true,
    }
  }

  return {
    ok: await verifyPasswordHash(password, row.passwordHash),
    mustSetPassword: false,
  }
}

export async function setKeeperPassword(password: string): Promise<void> {
  const db = getDb()
  const now = new Date()
  const passwordHash = await hashPassword(password)
  const existing = db
    .select({ username: keepers.username })
    .from(keepers)
    .where(eq(keepers.username, ADMIN_USERNAME))
    .get()
  if (existing) {
    db.update(keepers)
      .set({ passwordHash, updatedAt: now })
      .where(eq(keepers.username, ADMIN_USERNAME))
      .run()
    return
  }
  db.insert(keepers)
    .values({
      username: ADMIN_USERNAME,
      passwordHash,
      updatedAt: now,
    })
    .run()
}

export { BOOTSTRAP_PASSWORD }
