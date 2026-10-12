import { NextResponse } from "next/server"

import { SITE_TITLE } from "@/lib/config"
import { ensureDb } from "@/lib/db"

export async function GET() {
  try {
    await ensureDb()
    return NextResponse.json({ ok: true, site: SITE_TITLE })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "unhealthy",
      },
      { status: 500 }
    )
  }
}
