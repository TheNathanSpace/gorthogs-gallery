import { NextResponse, type NextRequest } from "next/server"

import { logInfo, shouldLogRequest } from "@/lib/log"
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (shouldLogRequest(pathname)) {
    logInfo("request", {
      method: request.method,
      path: pathname,
    })
  }

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next()
  }

  const session = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value
  )

  if (!session) {
    const login = new URL("/login", request.url)
    login.searchParams.set("next", request.nextUrl.pathname)
    return NextResponse.redirect(login)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.svg|favicon.ico|theme/).*)",
  ],
}
