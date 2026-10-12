import { mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { vi } from "vitest"

process.env.DATA_DIR = mkdtempSync(join(tmpdir(), "reliquary-test-"))
process.env.SEED_DEMO = "false"
process.env.AUTH_SECRET = "test-secret-not-for-production-use-32"
process.env.ADMIN_PASSWORD = "test-password"
process.env.ADMIN_USERNAME = "admin"

vi.mock("next/server", () => ({
  connection: async () => {},
}))
