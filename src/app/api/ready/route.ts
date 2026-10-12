import { NextResponse } from "next/server"

import { SITE_TITLE } from "@/lib/config"
import { ensureDb } from "@/lib/db"
import { probeReady } from "@/lib/health"

export async function GET() {
  try {
    await ensureDb()
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        sqlite: "error",
        disk: "error",
        writable: "error",
        site: SITE_TITLE,
        error: error instanceof Error ? error.message : "not ready",
      },
      { status: 503 }
    )
  }
  const probe = await probeReady()
  return NextResponse.json(
    { ...probe, site: SITE_TITLE },
    { status: probe.ok ? 200 : 503 }
  )
}
