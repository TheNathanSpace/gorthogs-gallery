import { jwtVerify, SignJWT } from "jose"

export const SESSION_COOKIE =
  process.env.AUTH_COOKIE_NAME && process.env.AUTH_COOKIE_NAME.length > 0
    ? process.env.AUTH_COOKIE_NAME
    : "reliquary_session"

export const SETUP_COOKIE = `${SESSION_COOKIE}_setup`

const SESSION_TTL_SECONDS = Number(process.env.SESSION_TTL_SECONDS ?? "604800")
const SETUP_TTL_SECONDS = 15 * 60

export type SessionPayload = {
  sub: string
  role: "admin"
}

export type SetupPayload = {
  sub: string
  role: "setup"
}

function secretBytes(): Uint8Array {
  const secret = process.env.AUTH_SECRET
  if (secret) return new TextEncoder().encode(secret)
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "AUTH_SECRET is required in production. Set a long random value in the environment."
    )
  }
  return new TextEncoder().encode("dev-only-insecure-secret-change-me")
}

function cookieSecure(): boolean {
  return ["1", "true", "yes", "on"].includes(
    (process.env.AUTH_COOKIE_SECURE ?? "").toLowerCase()
  )
}

export async function signSession(username: string): Promise<string> {
  return new SignJWT({ role: "admin" } satisfies Omit<SessionPayload, "sub">)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(username)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretBytes())
}

export async function signSetupToken(username: string): Promise<string> {
  return new SignJWT({ role: "setup" } satisfies Omit<SetupPayload, "sub">)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(username)
    .setIssuedAt()
    .setExpirationTime(`${SETUP_TTL_SECONDS}s`)
    .sign(secretBytes())
}

export async function verifySessionToken(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secretBytes())
    if (payload.role !== "admin" || typeof payload.sub !== "string") return null
    return { sub: payload.sub, role: "admin" }
  } catch {
    return null
  }
}

export async function verifySetupToken(
  token: string | undefined
): Promise<SetupPayload | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secretBytes())
    if (payload.role !== "setup" || typeof payload.sub !== "string") return null
    return { sub: payload.sub, role: "setup" }
  } catch {
    return null
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: cookieSecure(),
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  }
}

export function setupCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: cookieSecure(),
    path: "/",
    maxAge: SETUP_TTL_SECONDS,
  }
}
