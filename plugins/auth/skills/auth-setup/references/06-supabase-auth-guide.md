# Supabase Auth — Setup Guide

> **⚠️ COMING SOON** — Supabase Auth is not yet supported by the setup wizard. This guide is included for future reference only. Currently supported providers: **Better Auth** and **Firebase Auth**. Run `/shipwithai-auth:setup` to get started with a supported provider.

Postgres-native auth. Free < 50K MAU. Row Level Security (RLS) built-in. Self-hostable.

## Installation

```bash
npm install @supabase/supabase-js @supabase/ssr
```bash

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...    # Server-side only, never expose to client
```env

Get from [Supabase Dashboard](https://supabase.com/dashboard) → Settings → API.

## Client & Server Setup

```ts
// lib/supabase/client.ts (browser)
import { createBrowserClient } from "@supabase/ssr";
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// lib/supabase/server.ts (server components, route handlers)
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
export async function createServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        },
      },
    }
  );
}
```ts

## Middleware (Session Refresh)

```ts
// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: (cookiesToSet) => cookiesToSet.forEach(({ name, value, options }) => { request.cookies.set(name, value); response.cookies.set(name, value, options); }) } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) return NextResponse.redirect(new URL("/login", request.url));
  return response;
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg)$).*)"] };
```ts

Always call `supabase.auth.getUser()` in middleware to refresh the session cookie.

## Email/Password Auth

```ts
const supabase = createClient();
await supabase.auth.signUp({ email, password });
await supabase.auth.signInWithPassword({ email, password });
await supabase.auth.signOut();
const { data: { user } } = await supabase.auth.getUser();
supabase.auth.onAuthStateChange((event, session) => { /* SIGNED_IN, SIGNED_OUT, etc. */ });
```ts

## OAuth & Callback Handler

```ts
// Client: Sign in with OAuth (Google, GitHub)
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: "google",
  options: { redirectTo: `${window.location.origin}/auth/callback` },
});

// app/auth/callback/route.ts - Handle OAuth callback
import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code");
  if (code) {
    const supabase = await createServerSupabase();
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
```ts

Enable providers in Supabase Dashboard → Authentication → Providers.

## Server Component Auth

```ts
import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
export default async function DashboardPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <div>Welcome, {user.email}</div>;
}
```ts

## Row Level Security (RLS)

Protect data at the database level:

```sql
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own todos" ON todos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own todos" ON todos FOR INSERT WITH CHECK (auth.uid() = user_id);
```sql

`auth.uid()` returns the current authenticated user's ID automatically.

## Gotchas

- **Use `@supabase/ssr`, NOT `@supabase/auth-helpers-nextjs`.** Auth helpers package is deprecated.
- **Use `getUser()`, not `getSession()`.** `getSession()` reads from cookies (spoofable); `getUser()` validates with Supabase.
- **Cookie chunking:** Large JWTs split into multiple cookies; the SSR package handles this, but custom cookie logic breaks.
- **Email rate limit:** Free tier: 4 emails/hour. Upgrade or use custom SMTP for production.
- **Enable RLS per table.** Forgetting RLS = data exposed to all authenticated users.
- **OAuth redirect URL:** Add `YOUR_DOMAIN/auth/callback` in Dashboard → Auth → URL Configuration.
- **Middleware is essential.** Without it, session cookies don't refresh and users get logged out.
