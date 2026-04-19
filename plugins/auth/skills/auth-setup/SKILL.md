---
name: auth-setup
description: "Set up authentication for web apps. Supports Better Auth and Firebase Auth. Handles email/password, Google OAuth, sessions, middleware, protected routes. Includes UI components. Auto-detects existing project themes. (GitHub & Apple OAuth coming soon)"
version: 1.6.1
license: MIT
---

# Auth Setup

Production-ready authentication for any web app in under 45 minutes.
2 auth providers (Better Auth & Firebase), Google OAuth, copy-paste UI components, and a verification script. GitHub & Apple OAuth coming soon.

## When to Use

- Starting a new project needing user authentication
- Adding auth to an existing app (auto-detects and adapts to existing theme)
- Migrating between auth providers
- Setting up OAuth social login (Google, GitHub, Apple)
- Need login/register page components

## CRITICAL — New Project Scaffolding

If scaffolding a new Next.js project, **never run `create-next-app .` in the current directory**.
Claude Code plugins (OMC, gstack) create dotfiles (`.omc/`, `.claude/`) that conflict with
`create-next-app`, which requires a completely empty directory. The dotfiles are recreated
by hooks between deletion and scaffolding, causing an infinite failure loop.

**Correct pattern — scaffold in /tmp, pin to Next.js 14:**
```bash
SCAFFOLD_DIR=/tmp/nextjs-scaffold-$RANDOM && \
npx create-next-app@14 "$SCAFFOLD_DIR" \
  --typescript --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --use-npm --no-turbopack && \
cp -a "$SCAFFOLD_DIR"/. . && rm -rf "$SCAFFOLD_DIR"
```

**Why `@14` not `@latest`?** Next.js 16 deprecated `middleware.ts` in favor of `proxy.ts`.
All templates, guides, and middleware examples in this plugin use the `middleware.ts` convention
(Next.js 14/15). Using `@latest` will install Next.js 16+ and the build will fail.
See pitfall #37 for details.

**Or scaffold into a named subdirectory, then move files up.**

**shadcn/ui:** Use `npx shadcn@2.1.0 init -d` (NOT `shadcn@2` or `shadcn@latest`).
`shadcn@2.5+` expects Tailwind v4's CSS-based config and fails with Next.js 14's `tailwind.config.ts`.
After `shadcn init`, you MUST install `tailwindcss-animate` — shadcn adds it to `tailwind.config.ts` but does NOT auto-install it: `{pm} install tailwindcss-animate` (use package manager detected in Step 0).
See pitfall #44.

## Provider Decision Framework

| Your situation | Best choice | Why |
|---|---|---|
| Full control, no vendor lock-in | **Better Auth** | Open-source, self-hosted, most flexible, zero cost |
| Google ecosystem or mobile + web | **Firebase Auth** | Best mobile/KMP support, free < 50K MAU |

> **Note:** Clerk, Auth.js, and Supabase Auth support is planned for a future release. Currently only Better Auth and Firebase Auth are fully supported.

Full comparison with cost analysis: `references/01-choosing-provider.md`

## Quick Start

### Step 0: Auto-Discover Project Stack (SILENT — no user interaction)

Before asking ANY questions, scan the project silently:

**0a. Framework & Router:**
- Check `next.config.*` (`.js`, `.mjs`, `.ts`) → Next.js
- Check `astro.config.*` → Astro
- Check `remix.config.*` or `@remix-run/*` in deps → Remix
- Check `vite.config.*` without framework deps → Vite
- Check `app/` directory → App Router | `pages/` directory → Pages Router
- If no framework detected → warn: "No supported framework detected. This plugin is designed for Next.js App Router."
- If Pages Router only (no `app/`) → warn: "Pages Router detected. This plugin requires Next.js App Router (`app/` directory)."

**0b. Version Compatibility:**
- Read `package.json` and extract versions:
  - `next` — check major version (14, 15, 16+)
  - `react` — must be ≥18 for Server Components
  - `node` — check `engines` field or `.nvmrc` if exists
- ❌ BLOCK if Next.js < 14: "This plugin requires Next.js 14+ with App Router."
- ❌ BLOCK if React < 18: "React 18+ required for Server Components."
- ⚠️ WARNING if Next.js ≥ 16: "Next.js 16 detected. `middleware.ts` is deprecated — plugin will use `proxy.ts` pattern instead."
- Store version for later decisions:
  - Next.js 14 → `experimental: { serverComponentsExternalPackages: [...] }`
  - Next.js 15+ → `serverExternalPackages: [...]`

**0c. Database ORM:**
- Check `drizzle.config.ts` or `drizzle.config.js` → Drizzle
- Check `prisma/schema.prisma` → Prisma
- Fallback: check `package.json` for `drizzle-orm` or `@prisma/client`
- If both detected → prefer the one with config file
- If none detected → will ask user in Q3 (don't block)

**0d. Existing Auth:**
- Check `src/lib/auth.ts` + `better-auth` in deps → Better Auth already installed
- Check `src/lib/firebase.ts` + `firebase` in deps → Firebase already installed
- Check `@clerk/nextjs` in deps → Clerk detected
- Check `next-auth` in deps → Auth.js/NextAuth detected
- Check `@supabase/ssr` in deps → Supabase Auth detected
- If auth detected → ⚠️ WARNING: "Existing auth setup detected ({provider}). Running setup may conflict. Run `/shipwithai-auth:doctor` first to check health, or confirm you want to replace it."

**0e. Existing Auth Pages & Routes:**
- Check for existing pages: `src/app/(auth)/login/`, `src/app/login/`, `app/login/`
- Check for existing API routes: `src/app/api/auth/`, `app/api/auth/`
- Check for existing middleware: `src/middleware.ts`, `middleware.ts`
- If found → store list, will warn before overwriting in Step 2

**0f. Package Manager:**
- `pnpm-lock.yaml` → pnpm
- `yarn.lock` → yarn
- `bun.lockb` → bun
- `package-lock.json` → npm
- Default to npm if no lockfile found

**0g. UI Library:**
- Check `components.json` → shadcn/ui (read `style` and `baseColor` fields)
- Check `@mui/material` in deps → MUI
- Check `@chakra-ui/react` in deps → Chakra UI
- Check `@mantine/core` in deps → Mantine
- Check for Tailwind: `tailwind.config.*` or `tailwindcss` in deps
- If shadcn/ui detected → skip `shadcn init` in setup, only add missing components
- If non-shadcn UI library detected → ⚠️ WARNING: "Detected {library}. Auth components use shadcn/ui — you may need to adapt styling."

**0h. Existing Design System (Context Project):**
- This is detected via Question 5 (cannot auto-detect parent project path)
- But if `globals.css` already has shadcn CSS variables → Scenario A (skip theme generation)

**Show discovery summary to user:**
```
🔍 Project scan complete

Framework:     Next.js 14.2.18 (App Router)
Package mgr:   npm
ORM:           Drizzle (drizzle-orm@0.30.10)
UI:            shadcn/ui (new-york style)
Existing auth: None detected
Existing pages: /dashboard (protected)
Node.js:       v20.11.0
React:         18.3.1

Ready to set up authentication.
```

**If critical issues found, STOP and report:**
```
⛔ Cannot proceed:
- Next.js 13 detected — requires Next.js 14+ with App Router
- No `app/` directory found — Pages Router not supported

Fix these issues first, then re-run /shipwithai-auth:setup
```

### Step 1: Choose provider

Ask user which provider using `AskUserQuestion`. Present options:
1. **Better Auth (Recommended)** — Free, self-hosted, full control. Open-source, no vendor lock-in. Best for most projects.
2. **Firebase Auth** — Google ecosystem, best for mobile/KMP apps. Free < 50K MAU.
3. Clerk — ⚠️ Coming Soon
4. Supabase Auth — ⚠️ Coming Soon
5. Auth.js — ⚠️ Coming Soon

**If user selects a "Coming Soon" provider:** Do NOT proceed. Warn and re-ask with only supported options.

If unsure, ask:
- "Need mobile support (KMP/React Native)?" → Firebase Auth
- "Want self-hosted, full control, zero cost?" → Better Auth
- "Using Google ecosystem (Firebase, GCP)?" → Firebase Auth
- "Building a SaaS with custom auth logic?" → Better Auth

### Step 1a: Choose OAuth

Ask user which social login using `AskUserQuestion`. Present options:
1. **Google only (Recommended)** — Most common, covers 90%+ of users
2. Google + GitHub — ⚠️ GitHub Coming Soon
3. Google + GitHub + Apple — ⚠️ GitHub & Apple Coming Soon
4. None — Email/password only, add social login later

**If user selects an option with "Coming Soon" providers:** Warn, then proceed with Google only. Mention `/shipwithai-auth:add-oauth` for future providers.

### Step 1b: Detect theme context

**ALWAYS run this step** — even for new projects. Use Step 0 discovery results to auto-classify where possible.

**There are 4 scenarios:**

| Scenario | Condition | globals.css Action |
|----------|-----------|-------------------|
| **A** | Existing project with shadcn/ui (detected in 0g) | SKIP — use existing CSS variables |
| **B** | Existing project with Tailwind but no shadcn/ui (detected in 0g) | MERGE — add shadcn/ui vars to existing globals.css |
| **C** | Standalone new project (no parent design system) | AUTO-SELECT — AI picks Ocean or Sunrise preset |
| **D** | New project inside/alongside existing project | INHERIT — map parent's design tokens to shadcn/ui vars |

**Auto-classification from Step 0:**
- If Step 0 detected shadcn/ui (`components.json` exists) → **Scenario A** — skip to Step 2, no question needed
- If Step 0 detected Tailwind but no shadcn/ui → **Scenario B** — confirm with user, then merge
- If Step 0 detected existing auth pages → likely Scenario A or B, confirm with user

**Only ask Question 5 if scenario is ambiguous:**
- If this is a new project being scaffolded (no existing `globals.css`) → ask: *"Is this new app part of an existing project with its own design system?"*
- If YES → get the parent project path and run:
  `npx ts-node scripts/detect-theme.ts /path/to/new-app --context /path/to/parent-project`
- If NO → Scenario C, proceed with AI theme auto-selection (see below)

**Scenario C (NEW PROJECT) — AI auto-selects theme:**

Two curated theme presets are available in `assets/themes/`. Do NOT ask the user to choose — pick automatically based on project signals:

| Theme | File | Font | Best for |
|-------|------|------|----------|
| **Ocean** | `assets/themes/ocean.css` | DM Sans | SaaS, dashboard, dev tools, API, analytics, admin, B2B |
| **Sunrise** | `assets/themes/sunrise.css` | Outfit | Consumer, blog, shop, community, education, portfolio, e-commerce |

**Auto-selection logic (SILENT — no user interaction):**
1. Read `package.json` → `name` and `description` fields
2. Read `README.md` first paragraph (if exists)
3. Match keywords against domain signals:
   - SaaS / dashboard / admin / api / analytics / dev / tool / platform / monitor / deploy → **Ocean**
   - blog / shop / store / community / social / education / learn / portfolio / landing / market → **Sunrise**
4. If ambiguous or no signals → **Ocean** (default)

**After selecting theme:**
1. Run `npx shadcn@2.1.0 init -d` first (creates default globals.css)
2. Overwrite `globals.css` with the selected theme preset file
3. Add the theme's Google Font import at the top of `globals.css`:
   - Ocean: `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`
   - Sunrise: `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');`
4. Update `layout.tsx` to use the theme's font instead of default Geist:
   - Ocean: `import { DM_Sans } from "next/font/google"` → `const font = DM_Sans({ subsets: ["latin"] })`
   - Sunrise: `import { Outfit } from "next/font/google"` → `const font = Outfit({ subsets: ["latin"] })`
5. Ocean is dark-first → set `<html className="dark">` in `layout.tsx`
6. Show the selected theme in the Step 0 summary:
   ```
   Theme:         Ocean (dark, DM Sans) — auto-selected for SaaS project
   ```

**Scenario D (INHERIT) — what to do:**
- **CRITICAL ordering:** Run `npx shadcn@2.1.0 init -d` FIRST, then apply the inherited theme. `shadcn init` overwrites `globals.css` with default variables — if you apply the inherited theme first, shadcn will destroy it.
- The script scans the parent's CSS files and extracts design tokens (backgrounds, text colors, accents, borders, fonts, border-radius)
- It maps them to shadcn/ui CSS variables and outputs a `shadcnMapping` with `dark` and `light` mode values
- After shadcn init completes, overwrite `globals.css` with the inherited theme mapping
- Add the parent's Google Fonts `@import` to globals.css
- Set `className="dark"` on `<html>` if the parent is dark-first
- Update `layout.tsx` to use the parent's font-family instead of default Geist

**Key rule:** Auth components use shadcn/ui CSS variables (`--primary`, `--background`, etc.). The theme detection ensures these variables match the surrounding project's design — whether it's the same project (A/B), a parent/sibling project (D), or an auto-selected preset (C).

See `references/10-existing-project-integration.md` for detailed adaptation steps.

### Step 2: Follow provider guide

| Provider | Guide |
|----------|-------|
| Better Auth | `references/02-better-auth-guide.md` |
| Firebase Auth | `references/05-firebase-auth-guide.md` |

### Step 3: Email provider (Better Auth only)

**Skip this step for Firebase** — Firebase handles email delivery automatically.

For Better Auth — you MUST ask the user before proceeding.
**Do NOT skip this question. Do NOT assume console-only. STOP and ASK:**

"How should auth emails be sent? (verification emails, password reset links)

A) **Resend** (Recommended) — free tier: 100 emails/day, simple API, works in 2 minutes
B) **Console only** (Development) — emails log to terminal, no real delivery
C) **Other provider** — you'll configure SendGrid/Nodemailer/etc. yourself"

**WAIT for the user's answer before writing any auth config files.**

**If A (Resend):**
1. Install: `{pm} install resend` (use package manager detected in Step 0)
2. Add to `.env.local`: `RESEND_API_KEY=re_xxxxx` and `EMAIL_FROM=onboarding@resend.dev`
3. Create `src/lib/email.ts` with the `sendAuthEmail` helper from the Better Auth guide → "Email Provider — Resend" section
4. Update `sendVerificationEmail` and `sendResetPassword` callbacks in `src/lib/auth.ts` to use `sendAuthEmail`
5. **IMPORTANT — Tell the user after setup:**
   "With Resend's free tier and `onboarding@resend.dev` as sender, emails can ONLY be delivered to the email address that owns your Resend account. To send to any email, verify your own domain at resend.com/domains and change `EMAIL_FROM` to `auth@yourdomain.com`."

**If B (Console):**
1. Keep the `console.log` stubs in auth config (already the default)
2. Tell user: "Check your terminal for verification/reset links during development"

**If C (Other):**
1. Keep the `console.log` stubs as placeholder
2. Tell user to replace the callbacks with their email service

### Step 4: Add social login

> **Currently supported:** Google OAuth only. GitHub and Apple are coming soon.

See `references/07-oauth-social-login.md` for Google setup across all providers.

### Step 5: Database schema

See `references/08-database-auth-schema.md` for Drizzle/Prisma/Supabase schemas.

### Step 6: Add UI components

**Use Step 0 discovery results:**
- If shadcn/ui already detected (0g) → skip `shadcn init`, only run `npx shadcn@2.1.0 add button input label card separator` for missing components
- If shadcn/ui NOT detected → run `npx shadcn@2.1.0 init -d` first, then add components. Remember: for Scenario D, apply inherited theme AFTER shadcn init.
- If existing auth pages detected (0e) → ⚠️ WARN user before overwriting: "Found existing {page}. Overwrite with plugin component?"
- Use detected package manager (0f) for all install commands

Components are organized by provider. Copy from the correct folder:

- **Better Auth:** `assets/components/better-auth/`
- **Firebase Auth:** `assets/components/firebase/`
- **Shared (provider-agnostic):** `assets/components/shared/`

**REQUIRED** — Core auth pages (MUST copy all of these):

| File | Source folder | Place at | Purpose |
|------|---------------|----------|---------|
| `login-page.tsx` | `{provider}/` | `app/(auth)/login/page.tsx` | Login with email + social buttons |
| `register-page.tsx` | `{provider}/` | `app/(auth)/register/page.tsx` | Registration form |
| `forgot-password.tsx` | `{provider}/` | `app/(auth)/forgot-password/page.tsx` | Password reset request (sends email) |
| `reset-password.tsx` | `{provider}/` | `app/(auth)/reset-password/page.tsx` | Complete password reset (token from email → new password) |
| `protected-layout.tsx` | `{provider}/` | `app/(protected)/layout.tsx` | Server-side session verification |
| `dashboard-client.tsx` | `{provider}/` | `app/(protected)/dashboard/dashboard-client.tsx` | Sign-out button (client component) |
| `dashboard-page.tsx` | `shared/` | `app/(protected)/dashboard/page.tsx` | Protected dashboard page |
| `icons.tsx` | `shared/` | `src/components/icons.tsx` | OAuth provider SVG icons (Google, GitHub) — required by login/register pages |
| `globals.css` | `shared/` | `app/globals.css` | Tailwind CSS directives + shadcn/ui variables |

**RECOMMENDED** — User management (copy unless user explicitly declines):

| File | Source folder | Place at | Purpose |
|------|---------------|----------|---------|
| `user-profile.tsx` | `{provider}/` | `app/(protected)/profile/page.tsx` | Profile view + update name + sign out + delete account |

**OPTIONAL**:
- `auth-provider-buttons.tsx` — Standalone OAuth buttons (already included in login/register pages)

Copy from `assets/config/`:
- `next.config.ts` — Security headers (X-Frame-Options, HSTS, etc.) — merge into existing config
- `drizzle.config.ts` — Drizzle Kit config with `dialect: "sqlite"` (Better Auth only) — copy to project root

Where `{provider}` = `better-auth` or `firebase` depending on the chosen provider.

**CRITICAL for Firebase Auth — File creation checklist:**
You MUST create ALL of these files for Firebase to work. Do NOT skip any:
1. `src/lib/firebase.ts` — Client SDK init (from `firebase.config.ts` → "Client SDK Setup")
2. `src/lib/firebase-admin.ts` — Admin SDK init (from `firebase.config.ts` → "Admin SDK Setup")
3. `src/lib/firebase-session.ts` — `createSessionCookie()` + `clearSessionAndSignOut()` helpers (from `firebase.config.ts` → "Session Cookie Helper" + "Sign-Out Helper")
4. `src/lib/auth-server.ts` — `getServerUser()` helper (from `firebase.config.ts` → "Server Component Auth Check"). Import this in BOTH `(protected)/layout.tsx` AND `(protected)/dashboard/page.tsx` — do NOT duplicate the function inline
5. `src/app/api/auth/session/route.ts` — Session API with rate limiting + CSRF (from `firebase.config.ts` → "Session Cookie API Route"). The POST handler MUST be wrapped in try/catch — return 401 on invalid token, never 500
6. `src/middleware.ts` — Route protection (from `assets/middleware/firebase/nextjs-middleware.ts`)
7. `app/globals.css` — Tailwind v3 directives (`@tailwind base; @tailwind components; @tailwind utilities;`) + shadcn/ui hsl CSS variables — `layout.tsx` imports this file. Copy from `assets/components/shared/globals.css`

**CRITICAL for Firebase Auth — Google OAuth Setup:**
If using Google sign-in with `signInWithPopup`, you MUST complete the 5-step OAuth setup checklist in `references/05-firebase-auth-guide.md` → "Google OAuth Setup Checklist". Without it, sign-in will fail with 400 Bad Request. Key points:
1. Enable Google provider in Firebase Console (not just Google Cloud Console)
2. Configure the correct OAuth client ID in Google Cloud Console (must match Firebase's Web client ID)
3. Add `https://<PROJECT>.firebaseapp.com/__/auth/handler` to Authorized redirect URIs (NOT `/api/auth/callback/google` — that's Auth.js)
4. If OAuth consent screen is in Testing mode, add test user emails
→ Read `references/05-firebase-auth-guide.md` → "Google OAuth Setup Checklist" for full steps

**CRITICAL for Firebase Auth — Session flow:**
1. After sign-in/register, call `createSessionCookie(result.user)` and await it
2. Only THEN redirect to `/dashboard`
3. On sign-out, call `clearSessionAndSignOut()` FIRST (clears server cookie + Firebase), then redirect
4. Never rely on `onAuthStateChanged` for the initial login redirect

**CRITICAL for Firebase Auth Security:**
1. Set `NEXT_PUBLIC_APP_URL` env var — required for CSRF protection on session endpoint
2. Place protected pages under `app/(protected)/` and use `protected-layout.tsx` to verify sessions server-side (middleware only checks cookie existence, NOT validity)
3. The session DELETE handler revokes Firebase refresh tokens — stolen sessions are invalidated immediately
4. Error messages use generic text — never expose Firebase error codes to users

**CRITICAL for Firebase Auth — Middleware routes:**
Only include routes in `protectedRoutes` that have actual pages. Default: `["/dashboard"]`. Add `/profile` only if `user-profile.tsx` was copied. Do NOT add `/settings` or `/profile` unless those pages exist.

**CRITICAL for Firebase Auth — Middleware security:**
The middleware runs on Edge Runtime and CANNOT use Firebase Admin SDK. It MUST only check cookie **existence** (`request.cookies.get("__session")?.value`). Do NOT attempt to decode, parse, or validate the JWT in middleware — Base64-decoding the payload without verifying the cryptographic signature gives a false sense of security. An attacker can craft a fake JWT that passes the decode check. Real verification happens in `(protected)/layout.tsx` via `adminAuth.verifySessionCookie()`.

**CRITICAL for Better Auth — File creation checklist:**
You MUST create ALL of these files for Better Auth to work. Do NOT skip any:
1. `src/db/schema.ts` — Drizzle schema with Better Auth tables (from `assets/db/better-auth-schema.ts`)
2. `src/lib/db.ts` — Drizzle client (from `assets/db/better-auth-db.ts`). MUST import and pass `schema` to `drizzle(client, { schema })`
3. `src/lib/auth.ts` — Server config (from `assets/config/better-auth.config.ts`). MUST pass `schema` to drizzleAdapter: `drizzleAdapter(db, { provider: "sqlite", schema })`
4. `src/lib/auth-client.ts` — Client setup (from `better-auth.config.ts` → "Client Setup" section)
5. `src/app/api/auth/[...all]/route.ts` — API route handler
6. `src/middleware.ts` — Route protection using cookie-based pattern (from `assets/middleware/better-auth/nextjs-middleware.ts`). Do NOT use `auth()` wrapper — that's Auth.js, not Better Auth (see pitfall #43)
7. `src/app/(protected)/layout.tsx` — Server-side session verification
8. `.env.local` — Copy from `assets/config/better-auth.env.example` and fill in values
9. `drizzle.config.ts` — Copy from `assets/config/drizzle.config.ts`. MUST use `dialect: "sqlite"` (NOT `driver: "better-sqlite"` — removed in drizzle-kit 0.21+). See pitfall #48.
10. Database migration — Create tables with `npx drizzle-kit push` (or `npx @better-auth/cli generate && npx @better-auth/cli migrate`)
11. UI components — Copy login, register, forgot-password, reset-password, dashboard from `assets/components/better-auth/` (shared components from `assets/components/shared/`)
12. `reset-password.tsx` already includes a `<Suspense>` wrapper — `useSearchParams()` requires this in Next.js 14+ App Router or the build fails. Do NOT remove the Suspense wrapper.
13. **shadcn/ui:** Use `npx shadcn@2.1.0` (NOT `@latest` or `@2`) to avoid Tailwind v4 conflicts with Next.js 14. See pitfall #44.

**CRITICAL for Better Auth — next.config.ts compatibility:**
When adding `better-sqlite3` or other native packages to `next.config.ts`:
- **Next.js 14**: Use `experimental: { serverComponentsExternalPackages: ["better-sqlite3"] }`
- **Next.js 15+**: Use `serverExternalPackages: ["better-sqlite3"]`
Check the project's Next.js version in `package.json` BEFORE writing the config. Using the wrong syntax causes: `Unrecognized key(s) in object: 'serverExternalPackages'`.

**CRITICAL for Better Auth — Session flow:**
1. Better Auth manages sessions via cookies (`better-auth.session_token`) — no manual cookie creation needed (unlike Firebase)
2. `cookieCache` is enabled by default (5 min) — session changes (role updates, email verification) take up to 5 minutes to propagate
3. In Server Components, use `auth.api.getSession({ headers: await headers() })` — this verifies the session cryptographically
4. In middleware, check the `better-auth.session_token` cookie directly — do NOT use `auth()` wrapper (that's Auth.js, see pitfall #43). Do NOT use `headers()` from `next/headers` in middleware (Edge Runtime incompatible)

**NOTE for Better Auth:** The forgot-password page sends a reset link via email. You MUST also copy `reset-password.tsx` to `app/(auth)/reset-password/page.tsx` to handle the link destination. Without it, users get a 404.

**CRITICAL for shadcn/ui Button:** If using `buttonVariants` in a Server Component (e.g., home page), extract `buttonVariants` into a separate file WITHOUT `"use client"` directive. The `Button` component needs `"use client"` but `buttonVariants` is a pure function that can run on the server.

### Step 7: Verify

Run `scripts/verify-auth-setup.ts` to confirm auth works end-to-end. The script now includes **dangerous code pattern detection** — it catches module-scope SDK instantiation, wrong middleware patterns, missing Suspense wrappers, and other pitfalls automatically.

### Step 8: Generate README

Create a README.md for the generated project. Include:

```markdown
# [Project Name]

## Authentication Setup

This project uses [Provider Name] for authentication.

### Prerequisites

- Node.js 18+
- [Provider-specific prerequisites]

### Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local`: `cp .env.example .env.local`
4. Fill in the environment variables (see below)
5. Run the development server: `npm run dev`
6. Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| [List all required env vars with descriptions and links to where to get them] |

### For Firebase Auth:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a project (or select existing)
3. Go to Project Settings → General → Your apps → Add web app
4. Copy the config values to `NEXT_PUBLIC_FIREBASE_*` vars
5. Go to Project Settings → Service accounts → Generate new private key
6. Copy `project_id`, `client_email`, `private_key` to `FIREBASE_*` vars
7. Go to Authentication → Sign-in method → Enable Email/Password and Google

### Auth Flow

- `/login` — Sign in with email/password or Google
- `/register` — Create a new account
- `/forgot-password` — Reset password via email
- `/dashboard` — Protected page (requires authentication)

### Project Structure

[List key files and their purpose]
```

## CRITICAL CODE RULES — Violating any of these causes runtime crashes

These rules are **mandatory**. They are extracted from 60 production pitfalls (`references/09-common-pitfalls.md`) and represent the most common causes of auth failures. Claude MUST follow these rules when generating ANY auth code:

**R1 — NEVER instantiate SDK clients at module scope.**
`new Resend(process.env.X)` or `new Stripe(process.env.X)` at the top of a file crashes during build/SSR because env vars aren't available at module evaluation time. Use lazy initialization (singleton getter function) or create instances inside handler functions. Copy `assets/config/email.ts` for the correct Resend pattern. (#50)

**R2 — ALWAYS await session cookie BEFORE redirect.**
`router.push("/dashboard")` without `await createSessionCookie()` first → middleware bounces user back to /login because cookie doesn't exist yet. Firebase: `await createSessionCookie(user)` then redirect. Better Auth: handled automatically via cookie. (#22)

**R3 — Sign-out: clear server cookie FIRST, then client, then redirect.**
Calling `signOut()` (client) before `DELETE /api/auth/session` (server) leaves an orphan server cookie. Order: server delete → client signOut → `window.location.href = "/login"`. (#23)

**R4 — NEVER use `auth()` wrapper in middleware for Better Auth.**
`auth()` is Auth.js (NextAuth v5), NOT Better Auth. Better Auth middleware checks `request.cookies.get("better-auth.session_token")` directly. Using `auth()` gives "auth is not a function". (#43)

**R5 — NEVER decode JWT in middleware for Firebase.**
Middleware runs on Edge Runtime — no Firebase Admin SDK. Only check `cookies.get("__session")?.value` existence. Real verification happens in `(protected)/layout.tsx` via `adminAuth.verifySessionCookie()`. Base64-decoding without crypto verification gives false security. (#28)

**R6 — ALWAYS copy email.ts from `assets/config/email.ts` template.**
Do NOT write email helper code from scratch. The template has correct lazy-init, dev fallback (console.log), and production guard. Inline code examples in guides may be simplified — the template is the source of truth.

**R7 — `useSearchParams()` requires `<Suspense>` wrapper in Next.js 14+ App Router.**
`reset-password.tsx` uses `useSearchParams()` — without Suspense, `next build` fails. The template already includes it. Do NOT remove the Suspense wrapper. (#47)

**R8 — Copy ALL files in the provider checklist.**
Skipping any file (e.g., `auth-server.ts` for Firebase, `auth-client.ts` for Better Auth) causes cascading import errors. Use the numbered checklist in the CRITICAL section above — every item is required.

Full 60 pitfalls: `references/09-common-pitfalls.md`

## Implementation Checklist

- [ ] Choose auth provider (use decision framework above)
- [ ] Install packages + set environment variables
- [ ] Configure auth server/client
- [ ] Set up database schema + run migrations
- [ ] Mount API routes/handlers
- [ ] Add OAuth providers (Google only — GitHub & Apple coming soon)
- [ ] Create login/register UI pages
- [ ] Add middleware for protected routes
- [ ] Test: sign up → verify email → sign in → sign out → reset password
- [ ] Test: OAuth sign in → account linking
- [ ] Add security headers to `next.config.ts` (use `assets/config/next.config.ts` template)
- [ ] Add protected layout for server-side session verification (Firebase)
- [ ] Set `NEXT_PUBLIC_APP_URL` for CSRF protection (Firebase)
- [ ] Enable rate limiting for production (see `05-firebase-auth-guide.md` Security Hardening section)
- [ ] Run verify-auth-setup script
