/**
 * Drizzle Kit configuration for Better Auth with SQLite.
 * Copy to: drizzle.config.ts (project root)
 *
 * IMPORTANT: Use `dialect: "sqlite"` — NOT `driver: "better-sqlite"`.
 * The `driver` field was removed in drizzle-kit 0.21+. See pitfall #48.
 *
 * For PostgreSQL: change dialect to "postgresql" and update dbCredentials.
 * For MySQL: change dialect to "mysql" and update dbCredentials.
 */
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL || "sqlite.db",
  },
} satisfies Config;
