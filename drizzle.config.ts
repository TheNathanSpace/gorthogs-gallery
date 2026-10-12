import { defineConfig } from "drizzle-kit"

import { DB_PATH } from "./src/lib/config"

export default defineConfig({
  schema: "./src/lib/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: DB_PATH,
  },
})
