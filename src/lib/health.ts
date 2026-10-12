import { access, constants, unlink, writeFile } from "node:fs/promises"
import path from "node:path"

import { DATA_DIR, MEDIA_DIR } from "@/lib/config"
import { getSqlite } from "@/lib/db"

export type Probe = {
  ok: boolean
  sqlite: "ok" | "error"
  disk: "ok" | "error"
  writable?: "ok" | "error"
  error?: string
}

function sqlitePing(): void {
  const row = getSqlite().prepare("select 1 as n").get() as { n: number } | undefined
  if (row?.n !== 1) throw new Error("SQLite did not answer.")
}

async function diskReadable(): Promise<void> {
  await access(DATA_DIR, constants.R_OK)
  await access(MEDIA_DIR, constants.R_OK)
}

async function diskWritable(): Promise<void> {
  await access(DATA_DIR, constants.W_OK)
  await access(MEDIA_DIR, constants.W_OK)
  const probe = path.join(DATA_DIR, ".ready-probe")
  await writeFile(probe, "ok\n")
  await unlink(probe)
}

export async function probeLive(): Promise<Probe> {
  try {
    sqlitePing()
    await diskReadable()
    return { ok: true, sqlite: "ok", disk: "ok" }
  } catch (error) {
    return {
      ok: false,
      sqlite: "error",
      disk: "error",
      error: error instanceof Error ? error.message : "unhealthy",
    }
  }
}

export async function probeReady(): Promise<Probe> {
  try {
    sqlitePing()
    await diskReadable()
    await diskWritable()
    return { ok: true, sqlite: "ok", disk: "ok", writable: "ok" }
  } catch (error) {
    return {
      ok: false,
      sqlite: "error",
      disk: "error",
      writable: "error",
      error: error instanceof Error ? error.message : "not ready",
    }
  }
}
