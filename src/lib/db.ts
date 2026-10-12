import "server-only"

import { existsSync, mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"
import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"

import { DATA_DIR, DB_PATH, MEDIA_DIR } from "@/lib/config"
import * as schema from "@/lib/schema"
import { seedDemoIfEmpty } from "@/lib/seed"

const globalForDb = globalThis as unknown as {
  __reliquarySqlite?: Database.Database
  __reliquaryDb?: ReturnType<typeof drizzle<typeof schema>>
  __reliquarySeed?: Promise<void>
}

function migrate(sqlite: Database.Database) {
  sqlite.pragma("journal_mode = WAL")
  sqlite.pragma("foreign_keys = ON")
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS miniatures (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      painter_name TEXT NOT NULL,
      source_name TEXT,
      source_url TEXT,
      notes TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS photos (
      id TEXT PRIMARY KEY,
      miniature_id TEXT NOT NULL REFERENCES miniatures(id) ON DELETE CASCADE,
      original_filename TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      width INTEGER NOT NULL,
      height INTEGER NOT NULL,
      sort_order INTEGER NOT NULL,
      is_cover INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS photos_miniature_id_idx ON photos(miniature_id);
    CREATE INDEX IF NOT EXISTS miniatures_painter_idx ON miniatures(painter_name);
    CREATE INDEX IF NOT EXISTS photos_created_at_idx ON photos(created_at, id);
    CREATE INDEX IF NOT EXISTS miniatures_created_at_idx ON miniatures(created_at);
  `)
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
        "Keeper login and site title come from the container environment, not from this folder.",
        "",
      ].join("\n")
    )
  }
  const sqlite = new Database(DB_PATH)
  migrate(sqlite)
  // Flush WAL so a copied /data volume is a consistent clone after stop.
  sqlite.pragma("wal_checkpoint(TRUNCATE)")
  return drizzle(sqlite, { schema })
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
