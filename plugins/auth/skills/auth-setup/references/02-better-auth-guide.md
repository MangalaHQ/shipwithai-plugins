# Better Auth — Setup Guide

Open-source, self-hosted, TypeScript-first auth. Zero cost, full control.

## Installation

```bash
npm install better-auth    # or pnpm/yarn/bun
```

## Environment Variables

```env
BETTER_AUTH_SECRET=<random-32-chars-min>   # openssl rand -hex 32
BETTER_AUTH_URL=http://localhost:3000       # your app URL (exact match, no trailing slash)
NEXT_PUBLIC_APP_URL=http://localhost:3000   # for client-side references
GITHUB_CLIENT_ID=                          # OAuth (optional)
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
RESEND_API_KEY=                            # Email provider (optional — logs to console without it)
```

## Server Setup

Create `src/lib/auth.ts` — copy from `assets/config/better-auth.config.ts`:

```ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    sendVerificationEmail: async ({ user, url }: { user: { email: string }; url: string }) => {
      // TODO: Replace with Resend — see "Email Provider" section below
      console.log(`[AUTH] Verification email for ${user.email}: ${url}`);
    },
    sendResetPassword: async ({ user, url }: { user: { email: string }; url: string }) => {
      // TODO: Replace with Resend — see "Email Provider" section below
      console.log(`[AUTH] Password reset for ${user.email}: ${url}`);
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,      // Refresh every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // Cache 5 min (reduces DB queries)
    },
  },

  rateLimit: {
    window: 60,
    max: 10, // 10 requests per 60s per IP
  },
});

export type Session = typeof auth.$Infer.Session;
```

**Key config notes:**
- `requireEmailVerification: true` — users must verify email before full access
- `cookieCache` — reduces DB hits but session changes take up to 5 min to propagate
- `rateLimit` — enabled by default, protects all auth endpoints

## Client Setup

Create `src/lib/auth-client.ts`:

```ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});
```

## API Route

Create `src/app/api/auth/[...all]/route.ts`:

```ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

## Database Schema

```bash
npx @better-auth/cli generate
npx @better-auth/cli migrate
```

Core tables created: `user`, `session`, `account`, `verification`.

**IMPORTANT:** Run these commands again after adding any plugins (2FA, organizations, admin).

## Middleware (Protected Routes)

> **⚠️ Next.js 16 Warning:** Next.js 16 deprecated `middleware.ts` in favor of `proxy.ts`.
> This guide uses the `middleware.ts` convention (Next.js 14/15). Pin to Next.js 14
> when scaffolding: `npx create-next-app@14`. See pitfall #37.

Create `src/middleware.ts` — check the Better Auth session cookie directly (do NOT use `auth()` wrapper — that's Auth.js, not Better Auth; see pitfall #43):

```ts
import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/profile"];
const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

export function middleware(request: NextRequest) {
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");
  const isLoggedIn = !!sessionCookie?.value;

  const isProtected = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
```

**NOTE:** Middleware checks cookie existence only (fast, Edge-compatible). For cryptographic session verification, use `auth.api.getSession({ headers: await headers() })` in Server Components or the Protected Layout below.

## Protected Layout (Server-Side Verification)

Create `src/app/(protected)/layout.tsx` for server-side session verification:

```ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }
  return <>{children}</>;
}
```

This verifies the session cryptographically on the server — middleware only checks cookie existence.

## Usage

```ts
// Sign up
await authClient.signUp.email({ email, password, name });

// Sign in (email)
await authClient.signIn.email({ email, password });

// Sign in (OAuth)
await authClient.signIn.social({ provider: "google" });
await authClient.signIn.social({ provider: "github" });

// Get session (client component)
const { data: session } = authClient.useSession();

// Get session (server component)
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
const session = await auth.api.getSession({ headers: await headers() });

// Sign out
await authClient.signOut();
```

## Email Provider — Resend

Better Auth requires you to send verification and password reset emails yourself. We recommend [Resend](https://resend.com) (free tier: 100 emails/day).

**Setup:**
1. Create account at resend.com → copy your API key
2. Add to `.env.local`: `RESEND_API_KEY=re_xxxxx` and `EMAIL_FROM=onboarding@resend.dev`
3. Install: `npm install resend`
4. Create `src/lib/email.ts` (see asset file or code below)

**⚠️ Resend free-tier limitation:**
- `onboarding@resend.dev` can ONLY send to the email that owns your Resend account
- Emails to any other address are **silently rejected** (403 error)
- To send to any email: verify your own domain at [resend.com/domains](https://resend.com/domains), then use `EMAIL_FROM=auth@yourdomain.com`

**Local dev without Resend:** If `RESEND_API_KEY` is not set, emails log to your terminal instead. Check the dev server output for verification/reset links.

**Email utility (`src/lib/email.ts`):**
Copy from `assets/config/email.ts`. This template uses **lazy initialization** — the Resend client is created on first use, not at module load time. This prevents the "Missing API key" crash during build/SSR (pitfall #50).

**CRITICAL:** NEVER write `const resend = new Resend(process.env.RESEND_API_KEY)` at module top level. See pitfall #50.

## Password Reset — Complete Flow

**Step 1:** User clicks "Forgot password" → `forgot-password.tsx` calls:

```ts
await authClient.requestPasswordReset({
  email,
  redirectTo: `${window.location.origin}/reset-password`,  // Must be absolute URL — relative paths cause INVALID_CALLBACK_URL
});
```

**Step 2:** Better Auth calls `sendResetPassword` with a URL containing a token. User receives email with reset link.

**Step 3:** User clicks the link → lands on `/reset-password?token=xxx` → `reset-password.tsx` extracts the token and shows a new password form.

**Step 4:** User submits new password → component calls:

```ts
await authClient.resetPassword({ newPassword: password, token });
```

**Step 5:** Success → redirect to `/login`.

**SECURITY:** Always hardcode `redirectTo: "/reset-password"`. Never derive it from URL params or user input — this prevents open redirect attacks (see pitfall #33).

### API Endpoint Mapping (for Postman/curl testing)

| Client Method | Server Endpoint |
|---|---|
| `authClient.signIn.email()` | `POST /api/auth/sign-in/email` |
| `authClient.signUp.email()` | `POST /api/auth/sign-up/email` |
| `authClient.requestPasswordReset()` | `POST /api/auth/forget-password` |
| `authClient.resetPassword()` | `POST /api/auth/reset-password` |

> **Gotcha:** Client method is `requestPasswordReset()` but endpoint is `forget-password`. Testing with `/request-password-reset` returns 404.

## OAuth Setup (Google & GitHub)

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Authorized redirect URI: `{BETTER_AUTH_URL}/api/auth/callback/google`
4. Copy Client ID and Secret to env vars

**GitHub OAuth:**
1. Go to [GitHub Developer Settings](https://github.com/settings/developers) → OAuth Apps → New
2. Authorization callback URL: `{BETTER_AUTH_URL}/api/auth/callback/github`
3. Copy Client ID and Secret to env vars

**IMPORTANT:** Callback URLs must match EXACTLY — protocol, host, port, path. No trailing slash.

See `references/07-oauth-social-login.md` for detailed console setup with screenshots.

## Security Hardening

**CSRF Protection:** Better Auth handles CSRF internally via its API route handler. No additional configuration needed. Custom `fetch` calls to auth endpoints need `credentials: "include"`.

**Rate Limiting:** Enabled by default in the config above (10 req/60s per IP). For serverless environments, consider `@upstash/ratelimit` for distributed rate limiting.

**Session Management:**
- Sessions expire after 7 days (`expiresIn`)
- Sessions refresh every 24 hours (`updateAge`)
- Cookie cache reduces DB queries but delays session updates by up to 5 minutes

**Security Headers:** Add the security headers template from `assets/config/next.config.ts` to your project. Includes X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy, and Permissions-Policy.

## File Creation Checklist

You MUST create ALL of these files for Better Auth to work:

1. `src/lib/auth.ts` — Server config (from `better-auth.config.ts`)
2. `src/lib/auth-client.ts` — Client setup (from config → "Client Setup" section above)
3. `src/app/api/auth/[...all]/route.ts` — API route handler
4. `src/middleware.ts` — Route protection (from `assets/middleware/better-auth/nextjs-middleware.ts`)
5. `src/app/(protected)/layout.tsx` — Server-side session verification
6. Database migration — Run `npx @better-auth/cli generate && npx @better-auth/cli migrate`
7. UI components — Copy from `assets/components/better-auth/` (login, register, forgot-password, reset-password, dashboard-client, protected-layout, auth-provider-buttons, user-profile). Shared files (globals.css, dashboard-page.tsx) from `assets/components/shared/`

## Gotchas

- **Generate schema after adding plugins.** Every plugin (2FA, passkeys, orgs) adds tables. Always re-run `generate` and `migrate`.
- **CSRF issues with custom fetch:** Better Auth handles CSRF internally, but custom fetch calls need `credentials: "include"`.
- **Cookie domain:** Set `BETTER_AUTH_URL` to exact domain (no trailing slash). Mismatch = session lost.
- **Serverless cold starts:** First request may be slow. Use connection pooling (Neon, Supabase pooler).
- **OAuth callback URL:** Must match EXACTLY in provider dashboard. `http` vs `https`, trailing slash — all matter.
- **`cookieCache` stale data:** Session changes take up to 5 min to propagate. For critical flows, use `disableCookieCache: true`.
- **`headers()` in middleware:** Do NOT use `headers()` from `next/headers` in middleware — it may fail in Edge Runtime. Use it only in Server Components.

See `references/09-common-pitfalls.md` for 60 production pitfalls including 5 Better Auth-specific issues (#31–#35), scaffolding (#36), Next.js 16 (#37), API rename (#38), Suspense (#39), shadcn/Tailwind (#40), Drizzle schema (#41), next.config (#42), middleware (#43), shadcn version (#44), ESLint catch (#45), login error (#46), Resend free-tier (#47), drizzle-kit dialect (#48), zsh shopt (#49), Resend top-level init (#50), token type narrowing (#51), pitfalls #52–#59, and reset-password 404 (#60).
