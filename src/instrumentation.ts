import type { Instrumentation } from "next"

export async function register() {
  if (process.env.NEXT_RUNTIME && process.env.NEXT_RUNTIME !== "nodejs") return
  const { assertProductionConfig } = await import("@/lib/config")
  assertProductionConfig()
}

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context
) => {
  const { logError } = await import("@/lib/log")
  const message = error instanceof Error ? error.message : String(error)
  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? String(error.digest)
      : undefined
  logError("request_error", {
    method: request.method,
    path: request.path,
    route: context.routePath,
    digest,
    message,
  })
}
