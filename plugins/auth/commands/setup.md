---
description: "Interactive auth setup wizard. Choose provider, configure OAuth, email, generate schema, create UI components — all in one command."
argument-hint: "[provider] (better-auth | firebase)"
---

# Auth Setup Wizard

You are an expert authentication engineer. Guide the user through setting up production-ready auth for their project.

**BEFORE ANYTHING ELSE:** Read the skill at `skills/auth-setup/SKILL.md` for the full decision framework, file creation checklists, and critical warnings. Also read `skills/auth-setup/references/09-common-pitfalls.md` to avoid known issues.

## Step 0: Auto-Discover Project Stack (SILENT)

**Before asking ANY questions**, silently scan the project. Follow `skills/auth-setup/SKILL.md` → Step 0 exactly.

Scan for:
1. **Framework** — `next.config.*` → Next.js (check version: 14/15/16+)
2. **Router** — `app/` → App Router | `pages/` → Pages Router (❌ block if no App Router)
3. **Version compat** — React ≥18, Node ≥18. Block if incompatible.
4. **ORM** — `drizzle.config.ts` → Drizzle | `prisma/schema.prisma` → Prisma | deps fallback
5. **Existing auth** — `better-auth`, `firebase`, `@clerk/nextjs`, `next-auth`, `@supabase/ssr` in deps
6. **Existing pages** — `(auth)/login/`, `api/auth/`, `middleware.ts`
7. **Package manager** — lockfile detection (pnpm/yarn/bun/npm)
8. **UI library** — `components.json` → shadcn/ui | Tailwind | MUI/Chakra/Mantine
9. **Design system** — existing `globals.css` with shadcn CSS vars → Scenario A

**Show summary to user** (see SKILL.md for format). If critical issues found → STOP.

**If existing auth detected** → warn and suggest `/shipwithai-auth:doctor` first. Only proceed if user confirms.

**Store all results** — use them to skip questions and adapt code generation below.

## Step 1: Gather Requirements

If `$ARGUMENTS` specifies a provider, skip Question 1.

**Smart skipping based on Step 0:**
- If ORM detected → pre-fill Question 3, ask user to confirm instead of choosing
- If existing auth detected → warn about conflict before Question 1
- If shadcn/ui detected → Scenario A confirmed, skip Question 5

Ask questions ONE AT A TIME using `AskUserQuestion`:

**Question 1: "Which auth provider do you want to use?"**
Options:
- Better Auth (Recommended) — Free, self-hosted, full control. Open-source, no vendor lock-in. Best for most projects.
- Firebase Auth — Google ecosystem, best for mobile/KMP apps. Free < 50K MAU.
- Clerk — ⚠️ Coming Soon. Fastest setup, pre-built UI, managed service.
- Supabase Auth — ⚠️ Coming Soon. Postgres-native with Row Level Security. Best if already using Supabase.
- Auth.js — ⚠️ Coming Soon. Lightweight, zero cost.
- Not sure — help me choose

**If user selects a "Coming Soon" provider:** Do NOT proceed. Show:
```text
⚠️ {provider} support is coming soon! Currently supported providers:
  1. Better Auth — self-hosted, full control, zero cost
  2. Firebase Auth — Google ecosystem, mobile/KMP ready

Would you like to choose one of these instead?
```
Then re-ask Question 1 with only the 2 supported options.

If "Not sure", ask follow-up:
- "Do you need mobile app support (KMP/React Native)?" → Firebase Auth
- "Do you want full control, self-hosting, zero cost?" → Better Auth
- "Using Google ecosystem (Firebase, GCP)?" → Firebase Auth
- "Building a SaaS with custom auth logic?" → Better Auth

**Question 2: "Which social login providers do you need?"**
Options:
- Google only — Most common, covers 90%+ of users (Recommended)
- Google + GitHub — ⚠️ GitHub Coming Soon
- Google + GitHub + Apple — ⚠️ GitHub & Apple Coming Soon
- None — Email/password only, add social login later

**If user selects an option with "Coming Soon" providers:** Show:
```text
⚠️ {providers} support is coming soon! Currently only Google OAuth is supported.

I'll set up Google login now. The other providers can be added later via /shipwithai-auth:add-oauth when available.
```
Then proceed with Google only.

**Question 3: "Which database ORM are you using?"** (Better Auth, Auth.js, Supabase only)

Skip for Clerk and Firebase — they manage their own database.

**If Step 0 detected an ORM:** Pre-fill and confirm instead of asking:
- "I detected Drizzle ORM in your project (`drizzle.config.ts` found). I'll use that — OK?"
- Only ask the full question if no ORM was detected:

Options:
- Drizzle ORM (Recommended)
- Prisma
- None / Not sure (I'll help you choose)

**Question 4: Email provider** (Better Auth, Auth.js, Supabase only)

**Skip for Clerk and Firebase** — they handle email delivery automatically.

For Better Auth, Auth.js, and Supabase — you MUST ask this. Do NOT skip. Do NOT assume console-only. STOP and ASK:

"How should auth emails be sent? (verification emails, password reset links)

A) Resend (Recommended) — free tier: 100 emails/day, simple API, works in 2 minutes
B) Console only (Development) — emails log to terminal, no real delivery
C) Other provider — you'll configure SendGrid/Nodemailer/etc. yourself"

**WAIT for the user's answer before writing any auth config files.**

**Question 5: Project context** (skip if Step 0 already resolved the scenario)

**Auto-skip rules from Step 0:**
- If shadcn/ui detected (`components.json` exists) → **Scenario A** — skip this question entirely
- If existing `globals.css` has shadcn CSS vars (`:root` with `--background`, `--foreground`, etc.) → **Scenario A** — skip
- If Tailwind detected but no shadcn/ui → **Scenario B** — skip question, proceed with merge

**Only ask if the project is new (being scaffolded) or scenario is ambiguous:**

"Where will this auth app live?

A) Standalone project — new project with no existing design system
B) Inside/alongside an existing project — there's a parent or sibling project with its own design system (e.g., Astro, Next.js, Remix site with custom theme)
C) Not sure"

**Theme scenarios (4 total):**

| Scenario | Condition | globals.css Action |
|----------|-----------|-------------------|
| **A** | Existing project with shadcn/ui (detected in Step 0) | SKIP — use existing CSS variables |
| **B** | Existing project with Tailwind but no shadcn/ui | MERGE — add shadcn/ui vars to existing globals.css |
| **C** | Standalone new project (no parent design system) | AUTO-SELECT — AI picks Ocean or Sunrise preset |
| **D** | New project inside/alongside existing project | INHERIT — map parent's design tokens to shadcn/ui vars |

If answer is **A**: Skip — use existing theme.

If answer is **C** (→ Scenario C): AI auto-selects a theme preset. Do NOT ask the user. Read `package.json` name/description + README to infer project domain:
- SaaS / dashboard / admin / api / analytics / dev / tool → **Ocean** (`assets/themes/ocean.css`, DM Sans, dark-first)
- Blog / shop / community / education / portfolio / landing → **Sunrise** (`assets/themes/sunrise.css`, Outfit, light-first)
- Ambiguous → **Ocean** (default)

If answer is **B** (→ Scenario D): Ask for the parent/sibling project path. Then run theme detection with context:
`npx ts-node scripts/detect-theme.ts /path/to/new-app --context /path/to/parent-project`

**CRITICAL for Scenario D:** Run `npx shadcn@2.1.0 init -d` FIRST, then apply the inherited theme. If you apply the inherited theme first, `shadcn init` will overwrite `globals.css` with defaults and destroy the inherited design tokens.

**This question exists because:** When creating a new app inside an existing project, the new app should inherit the parent's design tokens (fonts, colors, border-radius). Without this, the new app gets a generic default theme that looks disconnected from the parent project.

## Step 2: Execute Setup

Based on the answers, follow this exact sequence:

### 2a. Read the Provider Guide
Read the appropriate reference file:
- Better Auth → `skills/auth-setup/references/02-better-auth-guide.md`
- Firebase → `skills/auth-setup/references/05-firebase-auth-guide.md`
- ~~Clerk → `references/03-clerk-guide.md`~~ (Coming Soon)
- ~~Auth.js → `references/04-authjs-guide.md`~~ (Coming Soon)
- ~~Supabase → `references/06-supabase-auth-guide.md`~~ (Coming Soon)

**CRITICAL:** Follow the guide EXACTLY. Do NOT generate code from memory — copy patterns from the guide and asset files.

### 2b. Apply Version-Specific Config
Use the Next.js version detected in Step 0 (do NOT re-read `package.json`):
- **Next.js 14:** `experimental: { serverComponentsExternalPackages: ["better-sqlite3"] }`
- **Next.js 15:** `serverExternalPackages: ["better-sqlite3"]`
- **Next.js 16+:** Use `proxy.ts` instead of `middleware.ts`
- If scaffolding a new project: pin to `npx create-next-app@14`

### 2c. Install Dependencies

Use the package manager detected in Step 0 (default: npm). Replace `{pm}` below:
- npm → `npm install`
- pnpm → `pnpm add`
- yarn → `yarn add`
- bun → `bun add`

Run the appropriate `{pm} install` command for the chosen provider.
- If email = Resend, also run: `{pm} install resend`
- For UI components:
  - If shadcn/ui already detected in Step 0 → skip init, only add missing components: `npx shadcn@2.1.0 add button input label card separator`
  - If shadcn/ui NOT detected → init first: `npx shadcn@2.1.0 init -d` (do NOT use `shadcn@2` or `shadcn@latest` — they fail with Tailwind v3. See pitfall #44)
  - Then add needed components: `npx shadcn@2.1.0 add button input label card separator`
  - **Apply theme preset (Scenario C only):** After `shadcn init`, overwrite `globals.css` with the AI-selected theme:
    - Ocean: Copy `skills/auth-setup/assets/themes/ocean.css` → `src/app/globals.css`
    - Sunrise: Copy `skills/auth-setup/assets/themes/sunrise.css` → `src/app/globals.css`
  - **Font setup:** Update `src/app/layout.tsx`:
    - Ocean: `import { DM_Sans } from "next/font/google"` → `const font = DM_Sans({ subsets: ["latin"] })`
    - Sunrise: `import { Outfit } from "next/font/google"` → `const font = Outfit({ subsets: ["latin"] })`
  - **Dark mode (Ocean only):** Set `<html lang="en" className="dark">` in `layout.tsx`

### 2d. Create Config Files
Generate auth configuration files. For Better Auth:
1. `src/db/schema.ts` — Copy from `skills/auth-setup/assets/db/better-auth-schema.ts`
2. `src/lib/db.ts` — Copy from `skills/auth-setup/assets/db/better-auth-db.ts`. MUST import and pass `schema` to `drizzle(client, { schema })`
3. `src/lib/auth.ts` — Copy from `skills/auth-setup/assets/config/better-auth.config.ts`. MUST pass `schema` to drizzleAdapter: `drizzleAdapter(db, { provider: "sqlite", schema })`
4. `src/lib/auth-client.ts` — Client setup from guide → "Client Setup" section
5. If email = Resend: Create `src/lib/email.ts` with `sendAuthEmail` helper from guide → "Email Provider — Resend" section

**CRITICAL for Better Auth callbacks:** Use explicit type annotations:
```ts
sendVerificationEmail: async ({ user, url }: { user: { email: string }; url: string }) => { ... }
sendResetPassword: async ({ user, url }: { user: { email: string }; url: string }) => { ... }
```

**CRITICAL for Better Auth client:** Use `requestPasswordReset` (NOT `forgetPassword` — the API was renamed). See pitfall #38.

### 2e. Set Up Environment Variables
Create `.env.example` with all required variables. Copy to `.env.local`.
- For Better Auth, include: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `DATABASE_URL`
- If email = Resend, include: `RESEND_API_KEY`
- If OAuth selected, include provider client ID/secret vars

### 2f. Generate Database Schema
For Better Auth with Drizzle:
1. Copy schema from `assets/db/better-auth-schema.ts`
2. Run `npx drizzle-kit push` (SQLite) or `npx drizzle-kit push:pg` (Postgres)
3. If CLI fails, use the SQL from the schema file directly

### 2g. Create API Routes
Set up the auth API handler. For Better Auth:
```ts
// src/app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
export const { GET, POST } = toNextJsHandler(auth);
```

### 2h. Add Middleware
For Better Auth: Use cookie-based middleware (NOT `auth()` wrapper — that's Auth.js, not Better Auth; see pitfall #43):

```ts
// src/middleware.ts
import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");
  const isLoggedIn = !!sessionCookie?.value;
  // ... route protection logic
}
```

### 2i. Update next.config
For Better Auth with SQLite/better-sqlite3:
- Next.js 14: `experimental: { serverComponentsExternalPackages: ["better-sqlite3"] }`
- Next.js 15+: `serverExternalPackages: ["better-sqlite3"]`

Check the Next.js version in `package.json` FIRST. See pitfall #42.

### 2j. Add OAuth Providers
If user selected OAuth providers, reference `skills/auth-setup/references/07-oauth-social-login.md`.

### 2k. Create UI Components

**Check Step 0 existing pages list first:**
- If Step 0 detected existing auth pages (`login/`, `register/`, etc.) → warn user before overwriting: "Found existing `{page}`. Overwrite with plugin component, or skip?"
- If Step 0 detected existing middleware → warn: "Found existing `middleware.ts`. I'll merge auth routes into it instead of replacing."

Copy and adapt components from `skills/auth-setup/assets/components/`:
- `login-page.tsx`
- `register-page.tsx`
- `forgot-password.tsx`
- `reset-password.tsx` ← REQUIRED for Better Auth/Auth.js/Supabase
- `protected-layout.tsx`
- `dashboard-page.tsx`
- `dashboard-client.tsx`
- `icons.tsx` ← REQUIRED — OAuth provider icons (from `shared/`)

**CRITICAL:** You MUST uncomment exactly ONE provider's code in each component. All provider code is commented out by default — leaving it commented means buttons/forms do nothing.

**CRITICAL:** `reset-password.tsx` includes a `<Suspense>` wrapper — do NOT remove it. `useSearchParams()` requires Suspense in Next.js 14+ or the build fails. See pitfall #39.

**CRITICAL for Better Auth:** The forgot-password component must use `authClient.requestPasswordReset()` (NOT `forgetPassword`). See pitfall #38.

**CRITICAL for Firebase Auth:** The session cookie MUST be created BEFORE redirecting:
- Add `createSessionCookie()` helper from `assets/config/firebase.config.ts`
- In login/register: `await createSessionCookie(result.user)` THEN `router.push("/dashboard")`

### 2l. Create Protected Layout
Add server-side session verification at `src/app/(protected)/layout.tsx`.

### 2m. Generate README
Generate a README.md with setup instructions following SKILL.md Step 7.

## Step 3: Verify

After setup is complete:
1. Run `npm run build` — must succeed with zero errors
2. Check that all config files exist and are valid
3. Verify env vars are in `.env.example`
4. Confirm API routes are mounted
5. Confirm middleware is configured
6. Check that ALL UI components are in place (including `reset-password.tsx`)

## Step 4: Summary

Print a clear summary:
```text
✅ Auth Setup Complete

Provider: [chosen provider]
OAuth: [Google, GitHub, ...]
Database: [Drizzle/Prisma/...]
Email: [Resend/Console/Other]

Files created:
- src/lib/auth.ts
- src/lib/auth-client.ts
- src/lib/db.ts + src/db/schema.ts
- src/lib/email.ts (if Resend)
- src/app/api/auth/[...all]/route.ts
- src/middleware.ts
- src/app/(auth)/login/page.tsx
- src/app/(auth)/register/page.tsx
- src/app/(auth)/forgot-password/page.tsx
- src/app/(auth)/reset-password/page.tsx
- src/app/(protected)/layout.tsx
- src/app/(protected)/dashboard/page.tsx
- .env.example + .env.local

Next steps:
1. Fill in .env.local with your actual API keys
2. Start dev server: npm run dev
3. Test the full flow:
   a. Visit /register → create account → should redirect to /dashboard
   b. Click sign out → should redirect to /login
   c. Visit /login → sign in → should redirect to /dashboard
   d. Visit /forgot-password → enter email → check terminal for reset link
   e. Click the reset link → set new password → should redirect to /login

⚠️ Review references/09-common-pitfalls.md for 60 production pitfalls
```
