---
name: auth-doctor
description: "Diagnose and fix issues in existing auth setups. Scans environment, files, security, middleware, OAuth, database, and dangerous code patterns. Produces scored health report with actionable fixes."
version: 1.0.0
license: MIT
---

# Auth Doctor — Diagnostic Guide

Health check for existing authentication setups. Detects misconfigurations, missing files, security issues, and dangerous code patterns across Better Auth and Firebase Auth projects.

## When to Use

- After running `/shipwithai-auth:setup` — final validation
- Auth is broken and you don't know why
- Before deploying to production — pre-flight check
- After upgrading auth packages or Next.js version
- Periodic maintenance check

## Step 1: Auto-Discover Project Stack

Run the **same discovery logic** as `skills/auth-setup/SKILL.md` → Step 0. This ensures setup and doctor use identical detection.

Scan for:

**1a. Framework & Versions** (same as setup Step 0a/0b):
- `next.config.*` → Next.js (extract version from `package.json`)
- App Router vs Pages Router
- React version, Node.js version

**1b. Auth Provider** (same as setup Step 0d):
- `better-auth` in deps → Better Auth
- `firebase` in deps → Firebase
- `@clerk/nextjs`, `next-auth`, `@supabase/ssr` → respective provider
- If no auth detected → ❌ STOP: "No auth setup detected. Run `/shipwithai-auth:setup` first."

**1c. ORM & Database** (same as setup Step 0c):
- `drizzle.config.ts` → Drizzle | `prisma/schema.prisma` → Prisma
- Check database type from drizzle config or deps (SQLite, PostgreSQL, MySQL)

**1d. Package Manager** (same as setup Step 0f):
- Lockfile detection

**1e. UI Library** (same as setup Step 0g):
- `components.json` → shadcn/ui | Tailwind | MUI/Chakra/Mantine

**1e. Existing Auth Pages & Routes** (same as setup Step 0e):
- Check for auth pages: `src/app/(auth)/login/`, `src/app/(auth)/register/`, etc.
- Check for API routes: `src/app/api/auth/`
- Check for middleware: `src/middleware.ts`, `middleware.ts`

**1f. Auth-specific detection:**
- `.env.local` or `.env` → configured env vars
- OAuth providers: check env vars for `GOOGLE_CLIENT_ID`, `GITHUB_CLIENT_ID`, `APPLE_CLIENT_ID`
- Email: check for `resend` in deps or `RESEND_API_KEY` in env

**Output the detection summary before proceeding:**
```
🔍 Auth Doctor — Scanning project...

Framework:   Next.js 14.2.18 (App Router)
Provider:    Better Auth (better-auth@1.2.3)
ORM:         Drizzle (drizzle-orm@0.30.10)
Database:    SQLite (better-sqlite3)
Package mgr: npm
UI:          shadcn/ui (new-york)
OAuth:       Google ✓, GitHub ✗
Email:       Resend ✓
```

## Step 2: Run Diagnostic Checks

Run each category. If `$ARGUMENTS` specifies a category, run ONLY that one. Otherwise run all 8.

### Category 1: Environment Variables (`env`)

**Check .env.local exists:**
- ❌ CRITICAL if missing entirely
- Read `.env.local` (or `.env` as fallback)

**Check provider-specific required vars:**

| Provider | Required |
|----------|----------|
| Better Auth | `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` |
| Firebase | `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` |

**Check var quality (not just existence):**
- `BETTER_AUTH_SECRET` — must be ≥32 chars (recommend 64 hex chars from `openssl rand -hex 32`)
- `BETTER_AUTH_URL` — must start with `http://` or `https://`
- `NEXT_PUBLIC_FIREBASE_API_KEY` — must start with `AIza`
- `FIREBASE_PRIVATE_KEY` — must contain `-----BEGIN`

**Check for test keys in production:**
- ⚠️ WARNING if `BETTER_AUTH_URL=http://localhost` in a project with `NODE_ENV=production` indicators
- ⚠️ WARNING if `RESEND_API_KEY=re_test_` (test key can't send to real emails)

**Check OAuth var pairs:**
- If `GOOGLE_CLIENT_ID` exists → `GOOGLE_CLIENT_SECRET` must also exist (and vice versa)
- If `GITHUB_CLIENT_ID` exists → `GITHUB_CLIENT_SECRET` must also exist
- If `APPLE_CLIENT_ID` exists → `APPLE_CLIENT_SECRET` must also exist
- ❌ CRITICAL if one exists without the other

**Check email vars (if Resend detected):**
- `RESEND_API_KEY` — must start with `re_`
- `EMAIL_FROM` — must be a valid email format
- ⚠️ WARNING if `EMAIL_FROM=onboarding@resend.dev` — can only send to account owner email

### Category 2: File Structure (`files`)

**Check all required files per provider:**

**Better Auth required files:**
```
src/db/schema.ts                              — Drizzle schema with auth tables
src/lib/db.ts                                 — Drizzle client
src/lib/auth.ts                               — Better Auth server config
src/lib/auth-client.ts                        — Better Auth client
src/app/api/auth/[...all]/route.ts            — API route handler
src/middleware.ts                              — Route protection middleware
src/app/(auth)/login/page.tsx                 — Login page
src/app/(auth)/register/page.tsx              — Register page
src/app/(auth)/forgot-password/page.tsx       — Forgot password page
src/app/(auth)/reset-password/page.tsx        — Reset password page
src/app/(protected)/layout.tsx                — Protected layout with session check
src/app/(protected)/dashboard/page.tsx        — Dashboard page
src/app/(protected)/dashboard/dashboard-client.tsx — Dashboard client component
src/components/icons.tsx                      — OAuth provider icons
.env.example                                  — Env var template
drizzle.config.ts                             — Drizzle Kit config
```

**Firebase required files:**
```
src/lib/firebase.ts                           — Client SDK init
src/lib/firebase-admin.ts                     — Admin SDK init
src/lib/firebase-session.ts                   — Session cookie helpers
src/lib/auth-server.ts                        — getServerUser() helper
src/app/api/auth/session/route.ts             — Session API with CSRF
src/middleware.ts                              — Route protection middleware
src/app/(auth)/login/page.tsx                 — Login page
src/app/(auth)/register/page.tsx              — Register page
src/app/(auth)/forgot-password/page.tsx       — Forgot password page
src/app/(auth)/reset-password/page.tsx        — Reset password page
src/app/(protected)/layout.tsx                — Protected layout with session verification
src/app/(protected)/dashboard/page.tsx        — Dashboard page
src/app/(protected)/dashboard/dashboard-client.tsx — Dashboard client component
src/components/icons.tsx                      — OAuth provider icons
.env.example                                  — Env var template
```

**For each missing file:** Report ❌ with the source asset path to copy from.

**Cross-reference imports:** For each existing file, check that its imports resolve:
- Read the file, extract `import ... from "..."` statements
- Check that aliased imports (`@/lib/auth`, `@/components/icons`, etc.) have corresponding files
- ❌ CRITICAL if an import target doesn't exist (build will fail)

### Category 3: Dependencies (`deps`)

**Check provider packages installed:**
- Read `package.json` dependencies + devDependencies
- Verify provider package exists and check version compatibility

**Check for known breaking versions:**
- `better-auth` < 0.4.0 — major API changes
- `drizzle-kit` with `driver` field instead of `dialect` — deprecated in 0.21+
- `shadcn` > 2.1.0 with Tailwind v3 — incompatible (pitfall #44)
- `next` >= 16 with `middleware.ts` — deprecated in favor of `proxy.ts` (pitfall #37)

**Check peer dependency conflicts:**
```bash
npm ls 2>&1 | grep "peer dep" | head -20
```

**Check node_modules exists:**
- ❌ CRITICAL if missing

### Category 4: Security (`security`)

**Check .gitignore:**
- `.env` and `.env.local` must be listed
- `sqlite.db` should be listed (if SQLite)
- ❌ CRITICAL if `.env` not in `.gitignore`

**Scan for hardcoded secrets in source files:**
- Scan `src/` for patterns: `sk_live_`, `sk_test_`, `re_`, `AIza`, `-----BEGIN`, `whsec_`
- Exclude `.env*` files and `node_modules/`
- ❌ CRITICAL if found in `.ts`/`.tsx` source files

**Check next.config for security headers:**
- ⚠️ WARNING if no security headers configured (X-Frame-Options, HSTS, CSP)
- Reference: `assets/config/next.config.ts`

**Check for better-sqlite3 in serverComponentsExternalPackages (Better Auth + SQLite):**
- Next.js 14: must be in `experimental.serverComponentsExternalPackages`
- Next.js 15+: must be in `serverExternalPackages`
- ❌ CRITICAL if missing — causes "Cannot find module" at runtime

### Category 5: Dangerous Code Patterns (`patterns`)

These checks map directly to SKILL.md Critical Code Rules R1–R8.

**R1 — Module-scope SDK instantiation:**
- Scan `src/lib/email.ts` for `new Resend(` at module scope (outside functions)
- Scan `src/lib/auth.ts` for `new Stripe(` or `new Resend(` at module scope
- ❌ CRITICAL — crashes during build/SSR because env vars unavailable at module evaluation

**R4 — Better Auth middleware using auth() wrapper:**
- Scan `src/middleware.ts` for `export { auth as middleware }` or `export default auth(`
- ❌ CRITICAL — `auth()` is Auth.js (NextAuth v5), not Better Auth

**R5 — Firebase middleware decoding JWT:**
- Scan `src/middleware.ts` for `atob(`, `Buffer.from(.*base64`, `firebase-admin`, `verifyIdToken`, `verifySessionCookie`
- ❌ CRITICAL — Edge Runtime cannot run Firebase Admin SDK

**R2 — Redirect before session cookie (Firebase):**
- Scan login/register pages for `router.push` without preceding `await createSessionCookie`
- ⚠️ WARNING — session may not persist

**R3 — Sign-out order (Firebase):**
- Scan dashboard-client for sign-out logic
- Server cookie delete should happen BEFORE client `signOut()`
- ⚠️ WARNING if order is reversed

**R7 — Missing Suspense wrapper:**
- Scan `reset-password/page.tsx` for `useSearchParams()` without `<Suspense>`
- ❌ CRITICAL — `next build` fails in Next.js 14+

**R8 — Missing files from checklist:**
- Already covered in Category 2, but double-check `auth-client.ts` specifically
- ❌ CRITICAL — cascading import errors

### Category 6: Middleware (`middleware`)

**Check middleware exists:**
- Look for `src/middleware.ts` or `middleware.ts`
- ⚠️ WARNING if missing

**Check middleware pattern matches provider:**

| Provider | Correct pattern | Wrong pattern |
|----------|----------------|---------------|
| Better Auth | `request.cookies.get("better-auth.session_token")` | `auth()`, `getSession()`, `headers()` |
| Firebase | `request.cookies.get("__session")` | `verifyIdToken`, `firebase-admin`, `atob` |

**Check route matcher:**
- ⚠️ WARNING if no `export const config = { matcher: [...] }` — middleware runs on all routes including static assets
- Verify matcher includes protected routes (`/dashboard`, `/profile`, etc.)
- Verify matcher excludes auth routes (`/login`, `/register`, `/api/auth`)

**Check for headers() import (Better Auth):**
- `headers()` from `next/headers` is NOT available in Edge Runtime middleware
- ❌ CRITICAL if imported

### Category 7: OAuth Configuration (`oauth`)

**For each detected OAuth provider (Google, GitHub, Apple):**

**Check env vars complete:**
- Client ID + Client Secret must both be set
- ❌ CRITICAL if one missing

**Check auth config includes the provider:**
- Better Auth: `socialProviders` in `src/lib/auth.ts` should list the provider
- Firebase: Provider must be enabled in Firebase Console (can't auto-check, but warn user)

**Check callback URL format:**
- Better Auth: `{BETTER_AUTH_URL}/api/auth/callback/{provider}`
- Firebase: `https://{PROJECT}.firebaseapp.com/__/auth/handler`
- ⚠️ WARNING: remind user to verify callback URL is registered in provider console

**Check for common Google OAuth mistakes (Firebase):**
- ⚠️ WARNING: remind about 5-step OAuth setup checklist in `references/05-firebase-auth-guide.md`
- Testing mode: test user emails must be added in Google Cloud Console

### Category 8: Database (`database`)

**Better Auth + Drizzle:**

**Check drizzle.config.ts:**
- Must exist at project root
- Must use `dialect: "sqlite"` (NOT `driver: "better-sqlite"`)
- ❌ CRITICAL if uses deprecated `driver` field

**Check schema has auth tables:**
- Read `src/db/schema.ts`
- Must contain: `user`, `session`, `account`, `verification` tables
- ❌ CRITICAL if any missing

**Check db.ts passes schema:**
- `drizzle(client, { schema })` — schema must be imported and passed
- ❌ CRITICAL if schema not passed — queries will fail

**Check auth.ts passes schema to adapter:**
- `drizzleAdapter(db, { provider: "sqlite", schema })` — schema must be passed
- ❌ CRITICAL if schema missing in adapter config

**Check database file exists (SQLite):**
- ⚠️ WARNING if `sqlite.db` doesn't exist — needs `npx drizzle-kit push` to create tables

**Check migration status:**
- If `drizzle/` directory has migration files, check they've been applied
- ⚠️ WARNING if migrations exist but database doesn't have the tables

## Step 3: Produce Health Report

After all checks complete, produce a scored report:

```
╔══════════════════════════════════════════════════╗
║          🔐 Auth Doctor — Health Report          ║
╠══════════════════════════════════════════════════╣
║ Provider:  Better Auth                           ║
║ Score:     18/22 checks passed                   ║
╚══════════════════════════════════════════════════╝

Category                 Status    Issues
─────────────────────────────────────────
1. Environment Variables   ✅       0
2. File Structure          ❌       2 missing files
3. Dependencies            ✅       0
4. Security                ⚠️       1 warning
5. Code Patterns           ✅       0
6. Middleware              ✅       0
7. OAuth Configuration     ❌       1 critical
8. Database                ⚠️       1 warning

──── CRITICAL (fix immediately) ─────────

❌ src/components/icons.tsx missing
   → Copy from plugin: assets/components/shared/icons.tsx

❌ GITHUB_CLIENT_ID set but GITHUB_CLIENT_SECRET missing
   → Add GITHUB_CLIENT_SECRET to .env.local

──── WARNINGS (review recommended) ──────

⚠️  No security headers in next.config
   → Merge from plugin: assets/config/next.config.ts

⚠️  sqlite.db not found — run: npx drizzle-kit push
```

**Ordering rules:**
1. ❌ CRITICAL items first (will break at runtime)
2. ⚠️ WARNING items second (works but risky)
3. ✅ PASS items last (or omit for brevity)

## Step 4: Offer to Fix

After presenting the report:

```
Found {N} issues ({X} critical, {Y} warnings).

Would you like me to fix them?
A) Fix all — apply all safe fixes automatically
B) Fix critical only — fix only ❌ items
C) Show me the fixes first — explain what I'd change, then confirm
D) Skip — I'll fix them manually
```

**CRITICAL rules for fixing:**
- NEVER modify `.env.local` values without user confirmation (may contain real secrets)
- NEVER delete files — only create missing ones or patch existing
- For env var issues: show what needs to change, let user update
- For missing files: copy from plugin assets (show source path)
- For code pattern issues: show the diff before applying
- For drizzle.config.ts `driver` → `dialect`: safe to auto-fix

## Step 5: Post-Fix Verification

After fixes are applied, re-run ONLY the failed categories to confirm they now pass.

If all checks pass:
```
✅ All issues resolved! Auth setup is healthy.

Next steps:
- Run `npm run build` to verify the full build
- Test the auth flow: register → verify email → login → dashboard → sign out
- Review references/09-common-pitfalls.md for 60 production pitfalls
```
