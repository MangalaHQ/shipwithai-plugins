// ============================================================
// Database Client — Drizzle + Better Auth
// File: src/lib/db.ts
//
// IMPORTANT: You MUST import and pass `schema` to drizzle().
// Without it, Better Auth cannot find its tables and you'll get:
//   "The model 'user' was not found in the schema object"
// See pitfall #41.
// ============================================================

import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@/db/schema";

// ── SQLite (local dev) ──────────────────
const sqlite = new Database("sqlite.db");
export const db = drizzle(sqlite, { schema });

// ── PostgreSQL (production) ─────────────
// Uncomment below and comment out SQLite above for production:
//
// import { drizzle } from "drizzle-orm/node-postgres";
// import { Pool } from "pg";
// import * as schema from "@/db/schema";
//
// const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// export const db = drizzle(pool, { schema });

// ── Turso / LibSQL (edge-compatible) ────
// Uncomment below for Turso:
//
// import { drizzle } from "drizzle-orm/libsql";
// import { createClient } from "@libsql/client";
// import * as schema from "@/db/schema";
//
// const client = createClient({
//   url: process.env.TURSO_DATABASE_URL!,
//   authToken: process.env.TURSO_AUTH_TOKEN,
// });
// export const db = drizzle(client, { schema });
