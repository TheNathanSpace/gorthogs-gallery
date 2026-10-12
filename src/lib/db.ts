import "server-only"

import { existsSync, mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"
import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"

import { DATA_DIR, DB_PATH, MEDIA_DIR } from "@/lib/config"
import * as schema from "@/lib/schema"
import { seedDemoIfEmpty } from "@/lib/seed"

const globalForDb = globalThis as unknown as {
  __reliquarySqlite?: Database.Database
  __reliquaryDb?: ReturnType<typeof drizzle<typeof schema>>
  __reliquarySeed?: Promise<void>
}

function migrationsFolder(): string {
  return path.join(process.cwd(), "drizzle")
}

function createDb() {
  mkdirSync(DATA_DIR, { recursive: true })
  mkdirSync(MEDIA_DIR, { recursive: true })
  const marker = path.join(DATA_DIR, "VAULT.txt")
  if (!existsSync(marker)) {
    writeFileSync(
      marker,
      [
        "This directory is a Reliquary vault.",
        "It holds the SQLite database and every photograph.",
        "",
        "Copy this whole directory (the Docker volume) to clone the gallery onto another host.",
        "The keeper password hash lives here. AUTH_SECRET and site title stay in the container environment.",
        "",
      ].join("\n")
    )
  }
  const sqlite = new Database(DB_PATH)
  sqlite.pragma("journal_mode = WAL")
  sqlite.pragma("foreign_keys = ON")
  const db = drizzle(sqlite, { schema })
  migrate(db, { migrationsFolder: migrationsFolder() })
  sqlite.pragma("wal_checkpoint(TRUNCATE)")
  globalForDb.__reliquarySqlite = sqlite
  return db
}

export function getSqlite(): Database.Database {
  getDb()
  const sqlite = globalForDb.__reliquarySqlite
  if (!sqlite) throw new Error("SQLite is not open.")
  return sqlite
}

export function getDb() {
  if (!globalForDb.__reliquaryDb) {
    globalForDb.__reliquaryDb = createDb()
  }
  return globalForDb.__reliquaryDb
}

export async function ensureDb() {
  const db = getDb()
  if (!globalForDb.__reliquarySeed) {
    globalForDb.__reliquarySeed = seedDemoIfEmpty(db)
  }
  await globalForDb.__reliquarySeed
  return db
}

export function resetDbForTests() {
  try {
    globalForDb.__reliquarySqlite?.close()
  } catch {
    // already closed
  }
  globalForDb.__reliquarySqlite = undefined
  globalForDb.__reliquaryDb = undefined
  globalForDb.__reliquarySeed = undefined
}

export function wipeVaultForTests() {
  const sqlite = getSqlite()
  sqlite.exec("DELETE FROM photos; DELETE FROM miniatures; DELETE FROM keepers;")
  globalForDb.__reliquarySeed = Promise.resolve()
}
