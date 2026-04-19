# Auth-Setup Skill — Detailed Blueprint

> Author: Ethan | Date: 2026-02-25
> Status: Draft v1.0
> Part of: ShipWithAI Skills Kit

---

## I. Design Overview

### Problem Statement

Every new project, developers lose 1-3 days setting up auth. There are 5+ popular auth providers, each with different setup, thousands of pages of documentation. Developers don't know which one to choose, how to set it up correctly, and there are dozens of pitfalls that are only discovered after deploying to production.

### Solution

1 skill where a developer says "setup auth for my app" → Claude asks a few questions → recommends provider → complete setup in 30-45 minutes, including UI components, middleware, schema, and production-ready config.

### Scope — 5 Auth Providers

| Provider | Type | Price | When to Choose |
|----------|------|-------|----------------|
| **Better Auth** | Open-source library | Free forever | Want full control, self-hosted, TypeScript-first |
| **Clerk** | Managed SaaS | Free < 10K MAU | Want fastest, pre-built UI, Next.js |
| **Auth.js** | Open-source library | Free forever | Budget-conscious, lightweight, learn auth deeply |
| **Firebase Auth** | Managed (Google) | Free < 50K MAU | Google ecosystem, mobile-first, KMP |
| **Supabase Auth** | Managed/Self-host | Free < 50K MAU | Full-stack Postgres, RLS, cost-effective |

### Phase Breakdown

```
Phase 1 — Starter Kit ($49)
├── auth-setup/          Core skill: 2 providers (Better Auth, Firebase) × Web platform
│                        Email/password, Google + GitHub OAuth
│                        Session, middleware, protected routes
│                        Login/Register UI components (shadcn/ui)
│                        Decision framework "which provider"
│                        Real-world pitfalls & gotchas
│
Phase 2 — Pro Kit ($99)
├── auth-advanced/       Passkey, 2FA/TOTP, SSO/SAML, Magic Link
│                        RBAC, Multi-tenant/Organizations
│                        Enterprise patterns
│
├── auth-mobile/         KMP auth (Android/iOS/Desktop)
│                        Firebase Auth for KMP
│                        Supabase Auth for mobile
│                        Secure token storage per platform
```

---

## II. Phase 1: auth-setup skill — Detailed

### 2.1 Directory Structure

```
auth-setup/
├── SKILL.md                              # < 150 lines. Decision framework + Quick Start
│
├── references/
│   ├── 01-choosing-provider.md           # Compare providers by use case (2 supported, 3 coming soon)
│   ├── 02-better-auth-guide.md           # Better Auth: setup → production
│   ├── 03-clerk-guide.md                 # Clerk: setup → production
│   ├── 04-authjs-guide.md               # Auth.js: setup → production
│   ├── 05-firebase-auth-guide.md         # Firebase Auth: setup → production
│   ├── 06-supabase-auth-guide.md         # Supabase Auth: setup → production
│   ├── 07-oauth-social-login.md          # Cross-provider: Google, GitHub, Apple OAuth
│   ├── 08-database-auth-schema.md        # Schema patterns for Drizzle + Prisma
│   └── 09-common-pitfalls.md             # Real bugs, edge cases, production gotchas
│
├── assets/
│   ├── components/
│   │   ├── login-page.tsx                # shadcn/ui login (email + social buttons)
│   │   ├── register-page.tsx             # shadcn/ui register
│   │   ├── forgot-password.tsx           # Password reset form
│   │   ├── user-profile.tsx              # Profile management
│   │   └── auth-provider-buttons.tsx     # Google/GitHub/Apple OAuth buttons
│   │
│   ├── middleware/
│   │   ├── nextjs-middleware.ts          # Next.js middleware template
│   │   ├── hono-middleware.ts            # Hono middleware template
│   │   └── express-middleware.ts         # Express middleware template
│   │
│   ├── schemas/
│   │   ├── drizzle-auth-schema.ts        # Drizzle ORM schema
│   │   ├── prisma-auth-schema.prisma     # Prisma schema
│   │   └── supabase-migration.sql        # Supabase SQL migration
│   │
│   └── config/
│       ├── env.example                   # All required environment variables
│       ├── better-auth.config.ts         # Better Auth config template
│       ├── clerk.config.ts               # Clerk config template
│       ├── authjs.config.ts              # Auth.js config template
│       ├── firebase.config.ts            # Firebase config template
│       └── supabase.config.ts            # Supabase config template
│
└── scripts/
    ├── auth-init.ts                      # Interactive: choose provider → generate config
    └── verify-auth-setup.ts              # Verify auth setup is correct
```

### 2.2 SKILL.md — Detailed Content

```markdown
---
name: auth-setup
description: Set up authentication for web apps. Supports Better Auth, Clerk, Auth.js,
  Firebase Auth, Supabase Auth. Handles email/password, OAuth (Google, GitHub, Apple),
  sessions, middleware, protected routes. Includes ready-to-use UI components.
version: 1.0.0
license: MIT
---

# Auth Setup Skill

Set up production-ready authentication for any web app in under 45 minutes.
Supports 2 auth providers (Better Auth, Firebase Auth), 3 OAuth providers, and includes copy-paste UI components.

## When to Use

- Starting a new project that needs user authentication
- Adding auth to an existing app
- Migrating between auth providers
- Setting up OAuth social login (Google, GitHub, Apple)
- Need login/register pages with UI components

## Decision Framework — Which Provider?

| Your situation | Best choice | Why |
|---|---|---|
| Next.js SaaS, want speed | **Clerk** | 15-min setup, pre-built UI, free < 10K users |
| Full control, no vendor lock-in | **Better Auth** | Open-source, self-hosted, most flexible |
| Already using Supabase/Postgres | **Supabase Auth** | Native RLS, free < 50K MAU, best cost |
| Google ecosystem, mobile + web | **Firebase Auth** | Best KMP/mobile support, free < 50K MAU |
| Lightweight, learning auth | **Auth.js** | Minimal, educational, zero cost |

## Quick Start (All Providers)

### Step 1: Choose your provider
Ask the user which auth provider they want. If unsure, ask:
- "Do you need mobile support?" → Firebase Auth or Supabase Auth
- "Do you want pre-built UI components?" → Clerk
- "Do you want full control and self-hosting?" → Better Auth
- "Are you already using Supabase?" → Supabase Auth
- "Do you want the simplest setup?" → Auth.js

### Step 2: Follow the provider guide
- Better Auth → `references/02-better-auth-guide.md`
- Clerk → `references/03-clerk-guide.md`
- Auth.js → `references/04-authjs-guide.md`
- Firebase Auth → `references/05-firebase-auth-guide.md`
- Supabase Auth → `references/06-supabase-auth-guide.md`

### Step 3: Add OAuth social login
- See `references/07-oauth-social-login.md` for Google, GitHub, Apple setup

### Step 4: Set up database schema
- See `references/08-database-auth-schema.md` for Drizzle/Prisma/Supabase schemas

### Step 5: Add UI components
Copy from `assets/components/`:
- `login-page.tsx` — Login form with social buttons
- `register-page.tsx` — Registration form
- `forgot-password.tsx` — Password reset
- `user-profile.tsx` — Profile management

### Step 6: Verify setup
Run `scripts/verify-auth-setup.ts` to check everything works.

## Common Pitfalls
See `references/09-common-pitfalls.md` for real production bugs and how to avoid them.

## Implementation Checklist
- [ ] Choose auth provider
- [ ] Install packages + set env vars
- [ ] Configure auth server/client
- [ ] Set up database schema + migration
- [ ] Mount API routes/handlers
- [ ] Add OAuth providers (Google, GitHub)
- [ ] Create login/register pages
- [ ] Add middleware for protected routes
- [ ] Test: sign up → verify email → sign in → sign out → reset password
- [ ] Test: OAuth sign in → account linking
- [ ] Enable rate limiting for production
- [ ] Verify auth-setup script passes
```

### 2.3 References — Content of Each File

---

#### `01-choosing-provider.md` — WRITE NEW (core differentiator)

This is the most important file — ClaudeKit DOES NOT have this.

**Content:**

```
# Choosing Your Auth Provider

## Decision Tree

                    ┌─ Need mobile (KMP/RN)? ──── YES ──→ Firebase Auth / Supabase Auth
                    │
Start ──→ New project? ──→ YES ──┤
                    │            ├─ Using Supabase DB? ──── YES ──→ Supabase Auth
                    │            │
                    │            ├─ Want pre-built UI? ──── YES ──→ Clerk
                    │            │
                    │            ├─ Want self-hosted? ───── YES ──→ Better Auth
                    │            │
                    │            └─ Want simplest? ──────── YES ──→ Auth.js
                    │
                    └─ Migrating? ──→ See migration section below

## Detailed Comparison

### Cost at Scale

| MAU      | Better Auth | Auth.js | Firebase | Supabase | Clerk    |
|----------|-------------|---------|----------|----------|----------|
| 1,000    | $0          | $0      | $0       | $0       | $0       |
| 10,000   | $0          | $0      | $0       | $0       | $0       |
| 50,000   | $0          | $0      | $0       | $0       | $800/mo  |
| 100,000  | $0          | $0      | ~$5/mo   | $25/mo   | $1,800/mo|
| 500,000  | $0          | $0      | ~$25/mo  | $25/mo   | $9,800/mo|

→ At scale, managed services (Clerk) get expensive fast.
→ Better Auth/Auth.js = free forever but you maintain infrastructure.
→ Firebase/Supabase = sweet spot (generous free tier + reasonable scaling).

### Feature Matrix

| Feature              | Better Auth | Clerk | Auth.js | Firebase | Supabase |
|----------------------|-------------|-------|---------|----------|----------|
| Email/Password       | ✅ Built-in  | ✅     | ✅       | ✅        | ✅        |
| OAuth Social Login   | ✅ Built-in  | ✅ 20+ | ✅       | ✅        | ✅        |
| Email Verification   | ✅           | ✅     | ✅       | ✅        | ✅        |
| Password Reset       | ✅           | ✅     | ✅       | ✅        | ✅        |
| Session Management   | ✅           | ✅     | ✅       | ✅ Token  | ✅ JWT    |
| Pre-built UI         | ❌ Headless  | ✅ Best| ❌       | ⚠️ Old   | ❌        |
| 2FA/MFA              | ✅ Plugin    | ✅ $$$  | ⚠️      | ✅ Free   | ✅        |
| Passkeys             | ✅ Plugin    | ✅     | ⚠️       | ⚠️       | ❌        |
| SSO/SAML             | ✅ Plugin    | ✅ $$$  | ❌       | ✅ $$    | ⚠️ OIDC  |
| Magic Link           | ✅ Plugin    | ✅     | ✅       | ✅        | ✅        |
| Multi-tenant/Orgs    | ✅ Plugin    | ✅     | ❌       | ❌        | ❌ (RLS)  |
| RBAC                 | ✅           | ✅     | ⚠️ Manual| ✅ Claims | ✅ RLS    |
| Mobile SDK (native)  | ❌ Web only  | ✅ RN  | ❌       | ✅ Best   | ✅        |
| KMP Support          | ❌           | ❌     | ❌       | ✅ Best   | ⚠️ REST  |
| Self-hostable        | ✅           | ❌     | ✅       | ❌        | ✅        |
| Vendor lock-in       | None         | High  | None    | Medium   | Low      |

### Stack Compatibility

| Auth Provider | Next.js | Nuxt | SvelteKit | Hono | Express | KMP |
|---------------|---------|------|-----------|------|---------|-----|
| Better Auth   | ✅       | ✅    | ✅         | ✅    | ✅       | ❌   |
| Clerk         | ✅ Best  | ✅    | ⚠️        | ⚠️   | ✅       | ❌   |
| Auth.js       | ✅       | ✅    | ✅         | ⚠️   | ⚠️      | ❌   |
| Firebase Auth | ✅       | ✅    | ✅         | ✅    | ✅       | ✅   |
| Supabase Auth | ✅       | ✅    | ✅         | ✅    | ✅       | ⚠️   |

### Ethan's Recommendation (from real production experience)

**For indie SaaS (web only):** Better Auth
→ Zero cost, full control, great DX. You own your auth forever.

**For SaaS that might go mobile later:** Firebase Auth
→ Best KMP support. Free < 50K MAU. Proven at scale (Google infrastructure).

**For "I need auth in 15 minutes":** Clerk
→ Fastest setup, but watch costs as you scale.

**For Supabase projects:** Supabase Auth
→ No-brainer if you're already using Supabase. Native RLS integration.

**Avoid Auth.js for new projects:**
→ Auth.js is now part of Better Auth Inc. Better Auth is the clear successor.
   Use Auth.js only if you have an existing NextAuth/Auth.js project.
```

Estimated: ~120-140 lines. Just under < 150 line limit.

---

#### `02-better-auth-guide.md` — ADAPT FROM ClaudeKit

**Source:** ClaudeKit `better-auth/SKILL.md` + `references/email-password-auth.md`
**Changes:**
- Reduce from 600+ lines → ~140 lines (keep only actionable steps)
- Add gotchas from production
- Focus Next.js App Router (primary framework)
- Remove less-used frameworks (Astro, Remix)

**Structure:**
```
1. Installation (5 lines)
2. Environment Variables (10 lines)
3. Server Setup — auth.ts (20 lines)
4. Database Config — Drizzle/Prisma (15 lines)
5. Schema Generation + Migration (10 lines)
6. API Route Handler — Next.js (10 lines)
7. Client Setup — auth-client.ts (10 lines)
8. Sign Up / Sign In / Sign Out (15 lines)
9. Session Management (10 lines)
10. Protected Routes + Middleware (15 lines)
11. Email Verification (10 lines)
12. Password Reset (10 lines)
13. Gotchas & Edge Cases (15 lines)
    - CSRF token issues with App Router
    - Session cookie domain mismatch
    - OAuth callback URL must match exactly
    - Database connection pooling in serverless
```

---

#### `03-clerk-guide.md` — WRITE NEW

**Structure:**
```
1. Create Clerk Application (dashboard)
2. Install @clerk/nextjs
3. Environment Variables (CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY)
4. ClerkProvider setup in layout.tsx
5. Middleware — clerkMiddleware() config
6. Pre-built Components: <SignIn/>, <SignUp/>, <UserButton/>
7. Custom Pages — if you want custom UI
8. useAuth(), useUser() hooks
9. Server-side: auth() helper in Server Components
10. Webhook setup to sync user → database
11. Gotchas:
    - Clerk webhook signature verify
    - User data sync timing issues
    - Rate limits on free tier
    - Middleware matcher patterns
```

---

#### `04-authjs-guide.md` — WRITE NEW

**Structure:**
```
1. Install next-auth@beta (v5)
2. auth.ts config
3. API Route: app/api/auth/[...nextauth]/route.ts
4. Providers: Google, GitHub, Credentials
5. Database Adapters: Drizzle, Prisma
6. Session strategy: JWT vs Database
7. Middleware: auth() wrapper
8. Client: useSession(), signIn(), signOut()
9. Server Components: auth() helper
10. Callbacks: jwt, session, signIn
11. Gotchas:
    - v4 → v5 breaking changes
    - Credentials provider limitations
    - Session type augmentation for TypeScript
```

---

#### `05-firebase-auth-guide.md` — WRITE NEW (from Ethan's experience)

**This is your strongest skill** — you've already used Firebase Auth in a real money tracking app.

**Structure:**
```
1. Firebase Project Setup (console)
2. Install firebase + firebase-admin
3. Client-side Setup: initializeApp, getAuth
4. Server-side Setup: Firebase Admin SDK
5. Email/Password: createUserWithEmailAndPassword, signInWithEmailAndPassword
6. Google OAuth: GoogleAuthProvider, signInWithPopup/Redirect
7. Session Management:
   - Option A: Firebase ID Token + verify server-side
   - Option B: Session cookies (firebase-admin)
8. Next.js Integration:
   - Middleware: verify token in headers
   - Server Components: admin.auth().verifyIdToken()
   - API Routes: authenticate requests
9. User Management: updateProfile, updateEmail, deleteUser
10. Security Rules (if using Firestore/RTDB)
11. Gotchas FROM MONEY TRACKING APP:
    - Token refresh timing in serverless
    - Firebase Auth emulator quirks in development
    - Google OAuth redirect URI configuration pitfalls
    - Session persistence across browser tabs
    - Cost tracking: Auth is free but Firestore calls from auth triggers cost money
    - [Add real bugs you encountered]
```

---

#### `06-supabase-auth-guide.md` — WRITE NEW

**Structure:**
```
1. Supabase Project Setup
2. Install @supabase/supabase-js + @supabase/ssr
3. Client Setup: createBrowserClient
4. Server Setup: createServerClient (cookies)
5. Email/Password: signUp, signInWithPassword
6. OAuth: signInWithOAuth (Google, GitHub)
7. Session: getSession, getUser, onAuthStateChange
8. Next.js App Router Integration:
   - middleware.ts with updateSession
   - Server Components: createServerComponentClient
   - Route Handlers: createRouteHandlerClient
9. Row Level Security (RLS) basics:
   - auth.uid() in policies
   - Protect tables automatically
10. Gotchas:
    - @supabase/ssr vs @supabase/auth-helpers (deprecated)
    - Cookie chunking for large JWTs
    - RLS pitfalls: forgetting to enable
    - Email rate limits on free tier (4 emails/hour)
```

---

#### `07-oauth-social-login.md` — ADAPT + EXPAND FROM ClaudeKit

**Source:** ClaudeKit `references/oauth-providers.md`
**Changes:**
- Focus 3 main providers: Google, GitHub, Apple
- Cross-provider guide (same flow for all auth providers)
- Add Apple Sign-In (ClaudeKit doesn't have detailed coverage)

**Structure:**
```
1. Google OAuth Setup
   - Google Cloud Console → Create OAuth Client
   - Authorized redirect URIs per provider
   - Scopes: email, profile
   - Config for: Better Auth / Clerk / Auth.js / Firebase / Supabase

2. GitHub OAuth Setup
   - GitHub Settings → Developer Settings → OAuth Apps
   - Config for each provider

3. Apple Sign-In Setup
   - Apple Developer → Certificates, IDs & Profiles
   - Service ID setup (tricky part)
   - Key generation + download
   - Config for each provider

4. Account Linking
   - User signs in with Google, later with GitHub (same email)
   - How each provider handles this differently
   - Pitfalls: duplicate accounts

5. Common OAuth Gotchas
   - Redirect URI must match EXACTLY (no trailing slash)
   - localhost vs 127.0.0.1 difference
   - HTTPS required in production for most providers
   - Token expiration handling
```

---

#### `08-database-auth-schema.md` — ADAPT FROM ClaudeKit

**Source:** ClaudeKit `references/database-integration.md`
**Changes:** Reduce, add Supabase SQL, focus Drizzle + Prisma

---

#### `09-common-pitfalls.md` — WRITE NEW (biggest differentiator)

**This is what NO ONE ELSE has.** Every other auth skill is just docs rewrite. This file is real production experience.

**Structure:**
```
# Common Auth Pitfalls — From Production

## Session & Cookie Issues
1. Cookie domain mismatch between dev/staging/prod
2. SameSite=Lax blocks OAuth callbacks in iframes
3. Session cookie too large for serverless (>4KB)
4. Token refresh race condition when multiple tabs open

## OAuth Gotchas
5. Google OAuth: "redirect_uri_mismatch" — trailing slash matters
6. GitHub OAuth: scope "user:email" vs "read:user" confusion
7. Apple Sign-In: private relay email breaks your email workflows
8. OAuth callback race: user clicks "Sign in with Google" twice quickly

## Database Issues
9. Prisma/Drizzle migration fails if auth tables already exist
10. Foreign key constraint on user delete (cascade vs restrict)
11. Connection pool exhaustion from auth middleware on every request

## Next.js Specific
12. Middleware runs on EVERY request including static assets
13. Server Component vs Client Component auth state mismatch
14. Edge runtime doesn't support all auth libraries
15. ISR/SSG pages can't access session (use client-side check)

## Production Surprises
16. Email verification links expire + user complains
17. Rate limiting: too aggressive blocks legitimate users
18. Password reset token leaked in email preview snippets
19. OAuth token stored in database grows table size fast

## Firebase Specific (from Ethan's money tracking app)
20. [Bugs you encountered — fill real experience here]
21. [Real edge cases]
22. [Real performance issues]

## Security
23. CSRF protection: some auth libs disable it by default
24. JWT in localStorage = XSS vulnerable (use httpOnly cookies)
25. OAuth state parameter: skip it → open redirect vulnerability
```

---

### 2.4 Assets — UI Components

#### `login-page.tsx` — shadcn/ui

```
Layout:
┌─────────────────────────────────┐
│         Logo / App Name         │
│                                 │
│  ┌───────────────────────────┐  │
│  │ Email    [_____________]  │  │
│  │ Password [_____________]  │  │
│  │                           │  │
│  │ [      Sign In        ]   │  │
│  │                           │  │
│  │ ─── or continue with ─── │  │
│  │                           │  │
│  │ [G Google] [  GitHub  ]   │  │
│  │ [       Apple       ]     │  │
│  │                           │  │
│  │ Don't have account?       │  │
│  │ Sign up | Forgot password │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘

Tech: React + shadcn/ui + Tailwind
Adaptive: Detect auth provider → import correct hooks
Props: provider ("better-auth" | "clerk" | "authjs" | "firebase" | "supabase")
```

Create similar for each file: register, forgot-password, user-profile, auth-provider-buttons.

---

### 2.5 Scripts

#### `auth-init.ts` — Interactive Setup

```
Flow:
1. "Which auth provider?" → Better Auth / Clerk / Auth.js / Firebase / Supabase
2. "Which OAuth providers?" → Google / GitHub / Apple (multi-select)
3. "Which ORM?" → Drizzle / Prisma / None (Supabase/Firebase)
4. "Which framework?" → Next.js / Nuxt / SvelteKit / Hono

Output:
- Generate config file (auth.ts / auth.config.ts)
- Generate .env.example with all required vars
- Generate schema file (if ORM selected)
- Print "Next steps" checklist
```

#### `verify-auth-setup.ts` — Verification

```
Checks:
1. ✅ Auth config file exists
2. ✅ Environment variables set
3. ✅ Database tables created
4. ✅ API route mounted
5. ✅ Can create test user
6. ✅ Can sign in test user
7. ✅ Can get session
8. ✅ Can sign out
9. ✅ Protected route returns 401 without auth
10. ✅ Protected route returns 200 with auth
```

---

## III. Sourcing from ClaudeKit — Specific Mapping

| File you need to create | Source from ClaudeKit | % newly written | Note |
|---|---|---|---|
| SKILL.md | better-auth/SKILL.md (skeleton) | 70% new | Add decision framework, 2 providers (3 coming soon) |
| 01-choosing-provider.md | NOT IN ClaudeKit | 100% new | Core differentiator |
| 02-better-auth-guide.md | better-auth/references/* | 40% new | Reduce + add gotchas |
| 03-clerk-guide.md | NOT IN ClaudeKit | 100% new | |
| 04-authjs-guide.md | NOT IN ClaudeKit | 100% new | |
| 05-firebase-auth-guide.md | NOT IN ClaudeKit | 100% new | From Ethan's experience |
| 06-supabase-auth-guide.md | NOT IN ClaudeKit | 100% new | |
| 07-oauth-social-login.md | better-auth/references/oauth-providers.md | 50% new | Add Apple, cross-provider |
| 08-database-auth-schema.md | better-auth/references/database-integration.md | 40% new | Add Supabase SQL |
| 09-common-pitfalls.md | NOT IN ClaudeKit | 100% new | Biggest differentiator |
| assets/ (5 components) | NOT IN ClaudeKit | 100% new | |
| scripts/ (2 files) | better_auth_init.py (concept) | 80% new | Rewrite in TypeScript |

**Total: ~65% newly written, ~35% adapted from ClaudeKit.**

---

## IV. Effort Estimate

| Section | Time | Note |
|------|-----------|------|
| SKILL.md | 2-3 hours | Decision framework needs careful thinking |
| 01-choosing-provider.md | 3-4 hours | Research + compare + decision tree |
| 02-better-auth-guide.md | 2-3 hours | Adapt from ClaudeKit, reduce |
| 03-clerk-guide.md | 3-4 hours | Write new, need real testing |
| 04-authjs-guide.md | 2-3 hours | Write new |
| 05-firebase-auth-guide.md | 2-3 hours | From experience, faster |
| 06-supabase-auth-guide.md | 3-4 hours | Write new, need real testing |
| 07-oauth-social-login.md | 2-3 hours | Adapt + add Apple |
| 08-database-auth-schema.md | 1-2 hours | Adapt from ClaudeKit |
| 09-common-pitfalls.md | 2-3 hours | From experience, very important |
| assets/ (5 components) | 4-6 hours | shadcn/ui, need testing |
| scripts/ (2 files) | 3-4 hours | auth-init + verify |
| **Real project testing** | **4-6 hours** | **Critical — test full flow** |
| **Total** | **~35-48 hours** | **~5-7 days (part-time)** |

---

## V. Build Order (Day by Day)

```
Day 1: Foundation
  ├── Create folder structure
  ├── Write SKILL.md (decision framework)
  ├── Write 01-choosing-provider.md
  └── Setup ClaudeKit better-auth files for reference

Day 2: Better Auth + Auth.js
  ├── Write 02-better-auth-guide.md (adapt from ClaudeKit)
  ├── Write 04-authjs-guide.md
  └── Write 08-database-auth-schema.md (adapt from ClaudeKit)

Day 3: Firebase + Supabase
  ├── Write 05-firebase-auth-guide.md (FROM REAL EXPERIENCE)
  ├── Write 06-supabase-auth-guide.md
  └── Test both on real project

Day 4: Clerk + OAuth + Pitfalls
  ├── Write 03-clerk-guide.md
  ├── Write 07-oauth-social-login.md (adapt from ClaudeKit + Apple)
  └── Write 09-common-pitfalls.md (REAL EXPERIENCE)

Day 5: Assets + Scripts
  ├── Build 5 UI components (login, register, forgot, profile, oauth buttons)
  ├── Build auth-init.ts script
  └── Build verify-auth-setup.ts script

Day 6-7: Test + Polish
  ├── Test entire skill on new project (ship micro-SaaS)
  ├── Fix issues, polish wording
  ├── Verify all code snippets run
  └── Final review: < 150 lines per file
```

---

## VI. Comparison with ClaudeKit better-auth

| Criterion | ClaudeKit better-auth | ShipWithAI auth-setup |
|---|---|---|
| Providers | 1 (Better Auth only) | 5 (Better Auth, Clerk, Auth.js, Firebase, Supabase) |
| Decision framework | None | Has (choosing-provider.md) |
| UI Components | None | 5 components shadcn/ui |
| Real gotchas | None | 25+ production pitfalls |
| Database schemas | Has (4 ORMs) | Has (Drizzle, Prisma, Supabase SQL) |
| OAuth guide | 1 file (430 lines, verbose) | 1 file (< 150 lines, actionable) + Apple |
| Interactive setup | Python script | TypeScript script (modern) |
| Verification | None | verify-auth-setup.ts |
| Framework support | 7 frameworks | Focus 3 (Next.js, Hono, Express) |
| Mobile/KMP | No | Phase 2 planned |
| Total size | ~2,700 lines | ~1,800 lines (leaner, more actionable) |
| Price | Within kit $99 (64 skills) | Within kit $49 (8 skills) |

**Conclusion: Your skill covers more broadly (5 vs 1 provider), more practical (real pitfalls), and more usable (UI components + scripts). ClaudeKit is deeper on Better Auth, but you're deeper on cross-provider comparison + production experience.**

---

*Next step: Begin Day 1 — create folder structure + SKILL.md + choosing-provider.md*
