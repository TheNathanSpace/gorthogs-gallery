type LogFields = Record<string, string | number | boolean | null | undefined>

function line(level: "info" | "warn" | "error", msg: string, fields?: LogFields): string {
  const payload: LogFields = {
    ts: new Date().toISOString(),
    level,
    msg,
    ...fields,
  }
  return JSON.stringify(payload)
}

export function logInfo(msg: string, fields?: LogFields): void {
  console.info(line("info", msg, fields))
}

export function logWarn(msg: string, fields?: LogFields): void {
  console.warn(line("warn", msg, fields))
}

export function logError(msg: string, fields?: LogFields): void {
  console.error(line("error", msg, fields))
}

export function shouldLogRequest(pathname: string): boolean {
  if (pathname === "/api/health" || pathname === "/api/ready") return false
  if (pathname.startsWith("/_next/")) return false
  if (pathname.startsWith("/theme/")) return false
  if (pathname === "/favicon.svg" || pathname === "/favicon.ico") return false
  return true
}
