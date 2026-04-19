# Auth.js (v5) — Setup Guide

> **⚠️ COMING SOON** — Auth.js is not yet supported by the setup wizard. This guide is included for future reference only. Currently supported providers: **Better Auth** and **Firebase Auth**. Run `/shipwithai-auth:setup` to get started with a supported provider.

Lightweight, open-source auth. Formerly NextAuth.js. Zero cost. Maintained by the open-source community.

## Installation

```bash
npm install next-auth@beta
```bash

## Environment Variables (root .env.local)

```env
AUTH_SECRET=<random-32-chars>              # npx auth secret
AUTH_URL=http://localhost:3000
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
```env

## Auth Config

```ts
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub,
    Google,
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        const user = await getUserFromDb(credentials.email, credentials.password);
        return user ?? null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
```ts

## API Route & Middleware

**API Route** (`app/api/auth/[...nextauth]/route.ts`):
```ts
import { handlers } from "@/auth";
export const { GET, POST } = handlers;
```ts

**Middleware** (`middleware.ts`):
```ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((request) => {
  if (!request.auth && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
});

export const config = { matcher: ["/dashboard/:path*", "/settings/:path*"] };
```ts

## Client & Server Usage

**Client Components:**
```tsx
"use client";
import { signIn, signOut } from "next-auth/react";
<button onClick={() => signIn("github")}>Sign in with GitHub</button>
<button onClick={() => signOut()}>Sign out</button>
```tsx

**Server Components:**
```tsx
import { auth } from "@/auth";
export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");
  return <div>Welcome, {session.user?.name}</div>;
}
```tsx

## Session Provider

Use SessionProvider in `app/layout.tsx`:
```tsx
import { SessionProvider } from "next-auth/react";
export default function Layout({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```tsx
Client: `useSession()` hook from `next-auth/react`.

## Database Adapter (Drizzle)

```bash
npm install @auth/drizzle-adapter
```bash
```ts
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  // ... providers
});
```ts

## TypeScript: Extend Session Type

```ts
import { DefaultSession } from "next-auth";
declare module "next-auth" {
  interface Session {
    user: { id: string; role: string } & DefaultSession["user"];
  }
}
```ts

## Callbacks (customize token/session)

```ts
callbacks: {
  jwt({ token, user }) {
    if (user) { token.id = user.id; token.role = user.role; }
    return token;
  },
  session({ session, token }) {
    session.user.id = token.id as string;
    session.user.role = token.role as string;
    return session;
  },
},
```ts

## Gotchas

- **v4 → v5:** Config moved to root `auth.ts`; import paths changed.
- **Credentials:** No session DB support; use JWT strategy.
- **TypeScript:** Extend Session type manually (see above).
- **Edge:** Some adapters unavailable; use `jwt` for Edge middleware.
- **Ownership:** Maintained by the open-source community (Balazs Orban et al). Better Auth is a separate project.
