import { NextResponse } from "next/server"

import { SITE_TITLE } from "@/lib/config"
import { probeLive } from "@/lib/health"

export async function GET() {
  const probe = await probeLive()
  return NextResponse.json(
    { ...probe, site: SITE_TITLE },
    { status: probe.ok ? 200 : 503 }
  )
}
