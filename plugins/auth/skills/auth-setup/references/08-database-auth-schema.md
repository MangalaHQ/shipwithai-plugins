# Database Auth Schemas

Pre-built schemas for Drizzle ORM, Prisma, and Supabase SQL.

## When to Use Each

| Auth Provider | Schema needed? | ORM |
|---|---|---|
| Better Auth | YES — generates via CLI | Drizzle, Prisma, Kysely, or direct |
| Clerk | NO — managed by Clerk | Optional sync via webhook |
| Auth.js | YES — adapter creates tables | Drizzle, Prisma |
| Firebase | NO — managed by Firebase | Optional user mirror table |
| Supabase | PARTIAL — auth tables managed, you add app tables | SQL migrations |

## Drizzle ORM Schema

```ts
import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
export const users = pgTable("user", {
  id: text("id").primaryKey(), name: text("name").notNull(), email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false), image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(), updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export const sessions = pgTable("session", {
  id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(), ipAddress: text("ip_address"), userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const accounts = pgTable("account", {
  id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(), providerId: text("provider_id").notNull(),
  accessToken: text("access_token"), refreshToken: text("refresh_token"), expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const verifications = pgTable("verification", {
  id: text("id").primaryKey(), identifier: text("identifier").notNull(), value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(), createdAt: timestamp("created_at").defaultNow(),
});
```ts

## Prisma Schema

```prisma
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }
model User { id String @id @default(cuid()); name String; email String @unique; emailVerified Boolean @default(false); image String?; createdAt DateTime @default(now()); updatedAt DateTime @updatedAt; sessions Session[]; accounts Account[] }
model Session { id String @id @default(cuid()); userId String; expiresAt DateTime; ipAddress String?; userAgent String?; createdAt DateTime @default(now()); user User @relation(fields: [userId], references: [id], onDelete: Cascade) }
model Account { id String @id @default(cuid()); userId String; accountId String; providerId String; accessToken String?; refreshToken String?; expiresAt DateTime?; createdAt DateTime @default(now()); user User @relation(fields: [userId], references: [id], onDelete: Cascade) }
model Verification { id String @id @default(cuid()); identifier String; value String; expiresAt DateTime; createdAt DateTime? @default(now()) }
```prisma

## Supabase SQL

```sql
CREATE TABLE public.profiles (id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY, full_name TEXT, avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now());
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
BEGIN INSERT INTO public.profiles (id, full_name, avatar_url) VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url'); RETURN new; END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
```sql

## Third-Party Auth User Tables

```ts
// Clerk sync: export const users = pgTable("user", {
  id: text("id").primaryKey(), clerkId: text("clerk_id").notNull().unique(), email: text("email").notNull(),
  name: text("name"), imageUrl: text("image_url"), createdAt: timestamp("created_at").defaultNow().notNull(),
});
// Firebase mirror: export const firebaseUsers = pgTable("firebase_user", {
  id: text("id").primaryKey(), firebaseUid: text("firebase_uid").notNull().unique(), email: text("email").notNull(),
  displayName: text("display_name"), photoUrl: text("photo_url"), createdAt: timestamp("created_at").defaultNow().notNull(),
});
```ts

## Migration Commands

| ORM | Generate | Apply |
|-----|----------|-------|
| Drizzle | `npx drizzle-kit generate` | `npx drizzle-kit migrate` |
| Prisma | `npx prisma migrate dev --name init` | `npx prisma migrate deploy` |
| Better Auth CLI | `npx @better-auth/cli generate` | Depends on adapter |
| Supabase | Write SQL in Dashboard → SQL Editor | Auto-applied |
