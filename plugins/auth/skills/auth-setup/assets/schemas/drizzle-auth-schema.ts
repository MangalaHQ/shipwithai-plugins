import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

// ============================================================
// Drizzle ORM Auth Schema
// Works with: Better Auth, Auth.js (with Drizzle adapter)
// Run: npx drizzle-kit push (or npx drizzle-kit generate + migrate)
// ============================================================

// ──────────────────────────────────────
// Users table
// ──────────────────────────────────────
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role").default("user"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ──────────────────────────────────────
// Sessions table
// ──────────────────────────────────────
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ──────────────────────────────────────
// Accounts table (OAuth providers)
// ──────────────────────────────────────
export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  // SECURITY: These tokens grant access to users' OAuth provider accounts (Google, GitHub, etc.).
  // For production, encrypt at rest using Better Auth's encryption plugin:
  //   import { fieldEncryption } from "better-auth/plugins/encryption";
  //   plugins: [fieldEncryption({ key: process.env.ENCRYPTION_KEY! })]
  // This encrypts accessToken, refreshToken, and idToken automatically.
  // Generate key: openssl rand -hex 32
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"), // hashed, for email/password accounts
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ──────────────────────────────────────
// Verifications table (email verify, password reset)
// ──────────────────────────────────────
export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(), // email or phone
  value: text("value").notNull(), // token or code
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ──────────────────────────────────────
// Optional: Two-factor auth table
// Uncomment if using 2FA plugin
// ──────────────────────────────────────
// export const twoFactors = pgTable("two_factors", {
//   id: text("id").primaryKey(),
//   userId: text("user_id")
//     .notNull()
//     .references(() => users.id, { onDelete: "cascade" }),
//   secret: text("secret").notNull(),
//   backupCodes: text("backup_codes").notNull(), // JSON string
//   createdAt: timestamp("created_at").notNull().defaultNow(),
// });

// ──────────────────────────────────────
// Type exports for use in app
// ──────────────────────────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type Account = typeof accounts.$inferSelect;
