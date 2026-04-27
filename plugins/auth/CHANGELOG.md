# Changelog

All notable changes to the shipwithai-auth plugin will be documented in this file.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.7.1] - 2026-04-26

### Added
- **Provider-specific README templates** — `assets/templates/providers/firebase/README.md.tmpl` and `assets/templates/providers/better-auth/README.md.tmpl`. Each is a self-contained scaffold with prerequisites, step-by-step provider configuration (Firebase Console walkthrough / Better Auth secret generation + DB migration), env var table with "Where to get it" links, OAuth setup, troubleshooting, and production checklist. Uses `{{PLACEHOLDER}}` substitution and `<!-- IF key=value -->` conditional blocks for OAuth/email branches. Single source of truth: deep-links back to `references/05-firebase-auth-guide.md`, `references/02-better-auth-guide.md`, `references/07-oauth-social-login.md`, and `references/09-common-pitfalls.md` instead of duplicating content.
- **`SKILL.md` Step 8 — Existing README guard** — Setup wizard now checks for an existing `README.md` at project root in Step 0, and Step 8 calls `AskUserQuestion` offering append / overwrite (with `.bak` backup) / save-separately. Eliminates silent overwrite of user-authored content.
- **`SKILL.md` Step 8 — Placeholder fallback chain** — Spec for `{{PROJECT_NAME}}` resolution: `package.json` `name` → strip `@scope/` → `basename(cwd)` → literal `My App`. Prevents broken titles when `package.json` is missing or contains scoped/special-char names.
- **Conditional block processor** — `<!-- IF oauth=google -->...<!-- /IF -->`, `<!-- IF email=resend -->...<!-- /IF -->`, etc. Step 8 keeps blocks that match user answers and deletes the rest (including the marker comments themselves) to avoid orphan markup.
- **`scripts/verify-auth-setup.ts` — README assertions** — 5 new checks: README exists, no unresolved `{{PLACEHOLDERS}}`, no orphan `<!-- IF -->` markers, every env var in `.env.example` is documented in the README env table, and provider-mismatch detection (e.g., Firebase env vars in a Better Auth README signals wrong template selected).
- **5 new evals** — `eval-14`/`eval-15` (Firebase + Better Auth README generation happy paths), `eval-16` (existing README → must prompt), `eval-17`/`eval-18` (negative cases — README generation must NOT trigger when user opts out or asks for a focused fix).

### Changed
- **`SKILL.md` Step 8** — Replaced 50-line inline boilerplate (with placeholder text like `[List all required env vars...]`) by a 65-line spec that points to the `.tmpl` files, documents the placeholder/conditional/fallback contract, and adds a verification checklist (no raw `{{`, no orphan markers, env vars cross-checked, provider console linked).
- **`commands/setup.md` Step 2m** — Fixed off-by-one bug (referenced "SKILL.md Step 7" — Verify — instead of Step 8 — Generate README). Step 2m now lists the four sub-steps explicitly and is marked `CRITICAL — do not skip, even after compaction` so README generation can't be silently skipped.
- **`commands/setup.md` Step 0 (item 6)** — Auto-discovery now also detects existing `README.md` at project root (used by Step 8a guard).
- **`manifest.json`** — `auth-setup` description now mentions README generation; `updatedAt` bumped to 2026-04-26.

### Fixed
- **Sparse generated README** — Previous Step 8 produced a generic 30-line README without provider-config steps, env-var sources, or OAuth setup. Users (especially indie hackers new to Firebase/Better Auth) had no path from "wizard finished" to "app actually authenticates a user". The new templates walk through every external dashboard step and link the deep references for the 5-step Google OAuth checklist and 60 production pitfalls.
- **Silent README overwrite** — Plugin no longer destroys an existing project README when run on a project scaffolded by `create-next-app` (or any project with prior README content).

## [1.7.0] - 2026-04-18

### Added
- **CLAUDE.md Framework Phase 2 adoption** — applied `shipwithai-claude-md-framework` Phase 2 templates, adapted for the plugin domain (no DB, no HTTP API). Decision recorded in [docs/decisions/ADR-0004-framework-adoption.md](docs/decisions/ADR-0004-framework-adoption.md).
- **`.claude/rules/`** — per-domain rule files (`security.md`, `testing.md`, `plugin.md`). `plugin.md` is a pointer to `QUALITY-STANDARDS.md` (SOT).
- **`.claude/hooks/`** — added `validate-command.py` (blocks destructive bash patterns) and `protect-files.py` (protects `CLAUDE.md`, `.claude/settings.json`, `.claude/hooks/*`, `.github/**`, lockfiles, secret files). Existing `npm-audit-check.sh` and `post-install-audit.sh` preserved.
- **`docs/behavioral-guidelines.md`**, **`docs/plan-before-execute.md`**, **`docs/update-protocol.md`** — detailed sections extracted from `CLAUDE.md` so the root file can stay under the 200-line cap.
- **`docs/PLUGIN-ARCHITECTURE.md`** — plugin-specific layer boundaries (Commands → Skills → References/Assets). Replaces the stock framework's `ARCHITECTURE.md` which targets HTTP apps.
- **`docs/decisions/`** — ADR system. Seeded with ADR-0001 (blueprints SOT), ADR-0002 (plan-before-execute), ADR-0003 (update protocol), ADR-0004 (this framework adoption). Plus `DECISION-LOG.md` for lightweight Y-statements.
- **`.github/pull_request_template.md`** — SOT + plugin quality + testing checklist for every PR.
- **`CLAUDE.local.md`** — template for personal overrides; gitignored. Hosts per-contributor `blueprint_path`.

### Changed
- **`CLAUDE.md`** — refactored from 295 → 197 lines. Detailed rules moved to linked docs under `docs/` and `.claude/rules/`. CONFIG block no longer includes a hardcoded `blueprint_path` (now in `CLAUDE.local.md`). CONFIG `plugin_version` corrected from stale `1.0.1` to current `1.7.0`.
- **`.claude/settings.json`** — added `permissions` (deny / allow / ask). Existing `npm-audit-check.sh` and `post-install-audit.sh` hook entries preserved; `validate-command.py` and `protect-files.py` added alongside them.
- **`.gitignore`** — added `CLAUDE.local.md`, `.claude/settings.local.json`, `.claude/worktrees/`, `.claude/logs/`.

### Contributor Impact
- First checkout: create your own `CLAUDE.local.md` (use the committed example as a starting point and edit locally — the file itself is gitignored).
- Cannot edit `CLAUDE.md`, `.claude/settings.json`, `.claude/hooks/*`, or `.github/**` from within Claude Code — these require human edits.
- `npm publish` is now blocked by `validate-command.py`. Run it from a terminal outside Claude Code when releasing companion packages.

## [1.6.1] - 2026-04-16

### Added
- **Step 0: Auto-Discover Project Stack** — Silent project scan before asking any questions. Detects framework (Next.js version, App Router vs Pages Router), ORM (Drizzle/Prisma), existing auth, existing pages/routes, package manager, UI library (shadcn/MUI/Chakra), and version compatibility (React ≥18, Node ≥18). Blocks setup if critical issues found (Next.js < 14, no App Router). Warns if existing auth detected and suggests `/doctor` first.
- **Smart question skipping** — Setup questions now leverage Step 0 results: auto-fills ORM if detected, skips Q5 (project context) if shadcn/ui already present (Scenario A), pre-fills package manager for all install commands, warns before overwriting existing auth pages.
- **`/doctor` command** — Health check for existing auth setups. Runs 8 diagnostic categories: environment variables, file structure, dependencies, security, dangerous code patterns (R1–R8), middleware validation, OAuth configuration, and database checks. Produces scored report (✅/⚠️/❌) with actionable fixes ordered by severity. Supports focused checks via arguments (e.g., `/doctor middleware`, `/doctor env`). Offers to auto-fix with user confirmation.
- **`skills/auth-doctor/` skill** — Complete diagnostic guide with per-provider check criteria, pass/fail thresholds, var quality validation (key format, length, test vs prod), import resolution verification, and post-fix re-verification loop. Shares discovery logic with setup Step 0 for consistency.
- **Scenario D: Cross-project theme inheritance** — When creating a new auth app inside/alongside an existing project (e.g., Next.js app inside Astro/Starlight site), the plugin now detects the parent project's design tokens and generates matching shadcn/ui CSS variables. Fixes the "default shadcn theme doesn't match parent project" problem discovered during dogfooding.
- **`--context` flag for `detect-theme.ts`** — New CLI flag: `npx ts-node detect-theme.ts /new-app --context /parent-project`. Scans the parent project's CSS files, extracts design tokens (backgrounds, text, accents, borders, fonts, radii), and maps them to shadcn/ui variables with automatic hex→HSL conversion.
- **Question 5 in `setup.md`** — New mandatory question: "Is this new app part of an existing project?" Ensures Claude always asks about parent project context before generating theme.

### Changed
- **SKILL.md Step 1b** — Renamed from "Detect existing theme (existing projects only)" to "Detect theme context". No longer skipped for new projects. Now covers 4 scenarios (A/B/C/D) including cross-project inheritance.
- **`references/10-existing-project-integration.md`** — Added Scenario D documentation with example token mapping (Astro/Starlight → shadcn/ui), detection steps, and manual verification checklist.

### Fixed
- **Root cause of style mismatch bug** — Phase 3 (v1.6.0) told Claude to "skip this step if creating a new project from scratch", which meant new apps inside existing projects got default themes. The 3 blind spots: (1) "new project" = skip, (2) script only scanned target directory, (3) no concept of "context project".
- **Missing `icons.tsx` in plugin assets** — Login/register components import `{ Icons } from "@/components/icons"` but no icons file shipped with the plugin, causing build failures. Added `assets/components/shared/icons.tsx` with Google and GitHub SVG icons.
- **Missing `drizzle.config.ts` template** — Without a template, Claude would generate drizzle config from memory and often use the deprecated `driver: "better-sqlite"` instead of `dialect: "sqlite"` (removed in drizzle-kit 0.21+). Added `assets/config/drizzle.config.ts`.
- **shadcn init overwrites Scenario D theme** — `npx shadcn@2.1.0 init -d` replaces `globals.css` with default variables. If the inherited theme was applied first, it got destroyed. SKILL.md now specifies: run shadcn init FIRST, then apply Scenario D theme override.
- **SKILL.md component table missing `icons.tsx`** — Added to REQUIRED components table and Better Auth file creation checklist.

## [1.6.0] - 2026-04-16

### Added
- **Theme Detection & Adaptation** — New Step 1b in SKILL.md for existing projects. Auto-detects project's design system (shadcn/ui, Tailwind, or none) and adapts auth components to match.
- **`scripts/detect-theme.ts`** — Standalone detection script that scans globals.css, tailwind.config.ts, components.json, and package.json. Classifies into Scenario A (skip), B (merge), or C (generate) with actionable recommendations.
- **`references/10-existing-project-integration.md`** — Guide for integrating auth into existing projects. Covers CSS variable mapping, Tailwind color→HSL conversion, dark mode compatibility, and conflict resolution with Chakra/Mantine/MUI.
- **`assets/config/email.ts`** — Correct Resend email template with lazy-init pattern. Prevents "Missing API key" crash during build/SSR (pitfall #50). Includes dev fallback (console.log) and production guard.
- **CRITICAL CODE RULES section in SKILL.md** — 8 mandatory rules (R1–R8) extracted from top production pitfalls. Inline in SKILL.md so Claude reads them on every setup, not buried in a 270-line pitfalls file.
- **Dangerous code pattern detection in `verify-auth-setup.ts`** — New `checkDangerousPatterns()` validates: module-scope SDK instantiation (R1), wrong middleware patterns (R4/R5), missing Suspense wrappers (R7), session cookie ordering (R2).
- **Post-write validation hook** — `hooks/post-write-check.sh` runs after Claude writes/edits auth files. Catches pitfalls #50, #43, #28, #47 at write time before the code even runs.
- **2 new eval prompts** (#12, #13) — Existing project integration scenarios for Better Auth and Firebase.

### Changed
- **SKILL.md** — Added Step 1b (theme detection), CRITICAL CODE RULES section, updated description.
- **`references/02-better-auth-guide.md`** — Email utility section now references `assets/config/email.ts` template instead of inline code.
- **plugin.json, marketplace.json** — v1.6.0, descriptions updated.

## [1.5.0] - 2026-04-15

### Changed
- **Provider selection restricted to Better Auth + Firebase Auth** — Clerk, Auth.js, and Supabase Auth are marked as "coming soon" and disabled from user selection. Their guides, configs, and bundles remain in the repo for future re-enablement.
- **SKILL.md** — Decision framework, Step 1 questions, Step 2 guide table, and Step 3 email section updated to reflect 2-provider support. Component/middleware paths updated to reference provider-specific folders.
- **references/01-choosing-provider.md** — Decision tree and recommendations updated for Better Auth + Firebase only.
- **evals.json** — Disabled-provider evals (Clerk, Supabase) updated with `status: "disabled-provider"`. Auth.js eval redirected to Better Auth.
- **plugin.json, manifest.json** — Description updated to reflect supported providers.

### Added
- **Provider-specific component folders** — Split multi-provider components into `assets/components/better-auth/` (8 files), `assets/components/firebase/` (8 files), and `assets/components/shared/` (2 files). Each component is production-ready with no commented-out provider blocks.
- **Provider-specific middleware folders** — Split multi-provider middleware into `assets/middleware/better-auth/` and `assets/middleware/firebase/`, each containing nextjs-middleware.ts, express-middleware.ts, and hono-middleware.ts. Code is uncommented and ready to use.
- **CONTRIBUTING.md** — Updated project structure tree and added component/middleware editing guidelines for new folder layout.

## [1.4.1] - 2026-04-08

### Added
- **Pitfall #60** in `09-common-pitfalls.md` — Forgot-password email link → 404 because reset-password page was never created.

### Fixed
- **Stale pitfall counts** — SKILL.md (55→60), `02-better-auth-guide.md` (51→60), `09-common-pitfalls.md` header (59→60) now all reflect the actual 60 pitfalls.

## [1.4.0] - 2026-03-21

### Added
- **`reset-password.tsx` component** — Completes the forgot-password → reset-password flow. Extracts token from URL, validates new password (8-128 chars, uppercase, number), calls provider API, redirects to /login on success. Supports all 5 providers with commented blocks.
- **Better Auth file creation checklist in SKILL.md** — 7-item checklist matching Firebase's style. Lists every file Claude must create for Better Auth to work, with source references.
- **Better Auth session flow documentation in SKILL.md** — Documents cookieCache behavior, server-side session verification, and Edge Runtime middleware warning.
- **Better Auth-specific OAuth section** in `02-better-auth-guide.md` — Google and GitHub OAuth setup with Better Auth's `socialProviders` config and exact callback URLs.
- **Security hardening section** in `02-better-auth-guide.md` — Documents CSRF (built-in), rate limiting, session management, and security headers for Better Auth.
- **5 new Better Auth pitfalls** (#31-#35) in `09-common-pitfalls.md` — Edge Runtime middleware, cookieCache stale data, open redirect, schema generation, URL mismatch.
- **3 new eval prompts** (#08-#10) — Better Auth password reset flow, production security config, and 404 edge case.
- **`TODOS.md`** — Tracks deferred work from design doc and discovery plan.

### Changed
- **`02-better-auth-guide.md` rewritten** (150 → 292 lines) — Production-ready guide with server config matching `better-auth.config.ts`, correct middleware pattern (cookie-based, not headers()), email verification flow, complete password reset flow, security hardening, and file creation checklist. All broken code fences fixed.
- **`SKILL.md`** — Added `reset-password.tsx` to REQUIRED components table. Added note linking forgot-password to reset-password for Better Auth/Auth.js/Supabase users.
- **Open redirect prevention** — Better Auth `forgetPassword({ redirectTo })` uses hardcoded `/reset-password` value. Guide warns against deriving from user input (matches Supabase fix from v1.1.1).

### Fixed
- **10+ broken code fences** in `02-better-auth-guide.md` — All closing fences used ` ```bash ` or ` ```ts ` instead of ` ``` `
- **Middleware pattern inconsistency** — Guide previously used `headers()` from `next/headers` in middleware (Edge Runtime incompatible). Now uses `auth()` wrapper pattern from `nextjs-middleware.ts` Option A.
- **Guide/config contradiction** — Guide showed minimal server config missing email verification, session caching, and rate limiting. Now matches `better-auth.config.ts` exactly.

## [1.3.0] - 2026-03-15

### Added
- **Email verification on register (#14)** — Firebase register flow now calls `sendEmailVerification()` after account creation. Users receive a verification email in the background without blocking the redirect. Prevents spam accounts and ensures email ownership per OWASP best practices.
- **Rate limiting on session endpoint (#15)** — Session POST handler (`/api/auth/session`) now includes an in-memory rate limiter (5 req/min per IP) by default. Prevents brute-force token attacks and quota exhaustion. Includes comment pointing to `@upstash/ratelimit` for serverless deployments.

### Changed
- `register-page.tsx` — Added `sendEmailVerification` to Firebase imports and register handler
- `05-firebase-auth-guide.md` — Added `sendEmailVerification` in register example + integrated rate limiting into session route code block
- `firebase.config.ts` — Added `sendEmailVerification` in register usage + rate limiter helper and integration in session POST handler

## [1.2.0] - 2026-03-12

### Security (Firebase Auth Hardening)
- **HIGH — CSRF protection on session endpoint (#6)** — Session POST handler now validates `Origin` header against `NEXT_PUBLIC_APP_URL`. Prevents cross-site session hijacking.
- **HIGH — Token revocation on sign-out (#7)** — Session DELETE handler now verifies session cookie and calls `revokeRefreshTokens()` before clearing cookie. Stolen sessions are invalidated immediately.
- **HIGH — Server-side session verification layout (#8)** — New `protected-layout.tsx` component wraps protected routes with `getServerUser()` verification. Middleware cookie-existence check is no longer sufficient alone.
- **MEDIUM — Silent session refresh failure (#10)** — Token refresh listener now checks `response.ok` and logs errors instead of silently ignoring failures.
- **MEDIUM — Security headers template (#11)** — New `assets/config/next.config.ts` ships pre-configured security headers (X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy, Permissions-Policy).
- **MEDIUM — Rate limiting guidance (#12)** — Firebase auth guide now includes complete rate limiting section with Upstash (serverless) and in-memory (self-hosted) implementations.
- **LOW — User enumeration prevention (#9)** — Login, register, and forgot-password pages now use generic error messages instead of exposing raw Firebase error codes.

### Added
- `assets/config/next.config.ts` — Security headers template
- `assets/components/protected-layout.tsx` — Server-side session verification layout
- `NEXT_PUBLIC_APP_URL` env var in `env.example` for CSRF protection
- `FIREBASE_PRIVATE_KEY` production secrets management note in `env.example`
- Security Hardening section in `05-firebase-auth-guide.md` (CSRF, server verification, rate limiting, headers)
- Firebase-specific CSRF guidance in `09-common-pitfalls.md` pitfall #29
- 4 new security checklist items in SKILL.md

### Changed
- Session POST handler template includes Origin validation
- Session DELETE handler template verifies session + revokes refresh tokens
- Error messages in login/register/forgot-password use generic text (no Firebase error codes)
- Token refresh listener checks response status
- SKILL.md lists `protected-layout.tsx` and `next.config.ts` in component/config inventory

## [1.1.1] - 2026-03-10

### Security (OWASP compliance)
- **CRITICAL — Open redirect fix (A01)** — Supabase OAuth callback now validates redirect path before use (`safeNext` pattern rejects absolute URLs and backslash tricks)
- **HIGH — Email verification enabled by default (A07)** — Better Auth config template now ships with `requireEmailVerification: true` and stub `sendVerificationEmail`/`sendResetPassword` handlers
- **HIGH — Rate limiting enabled by default (A07)** — Better Auth config template now ships with rate limiting active (10 req/60s per IP), no longer commented out
- **HIGH — Firebase cookie-only WARNING (A07)** — Middleware template now includes explicit 5-line WARNING that Edge runtime can only check cookie existence; server-side `verifySessionCookie()` is mandatory
- **MEDIUM — Password complexity (A07)** — Register page template now enforces max 128 chars, requires uppercase letter + number
- **MEDIUM — Security headers guidance (A05)** — Middleware template now includes commented security headers block (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS) for next.config.js
- **MEDIUM — Token encryption guidance (A02)** — Drizzle and Prisma schema templates now include `SECURITY: Consider encrypting tokens at rest` comments on OAuth token fields
- **MEDIUM — Root .env removed** — Deleted `.env` template from plugin root (secrets should never exist in plugin repos)

## [1.1.0] - 2026-03-10

### Fixed
- **Login redirect race condition** — Login/register pages now await session cookie creation before redirecting (Firebase). Previously, `window.location.href` fired before the session cookie POST completed, causing middleware to bounce users back to `/login`
- **Logout not redirecting** — Sign-out now clears server-side session cookie (`DELETE /api/auth/session`) before Firebase client sign-out and redirect
- **Register/Forgot-password not functional** — Added clear `CRITICAL` comments requiring providers to be uncommented. Added `createSessionCookie()` helper pattern for Firebase
- **Build failure: buttonVariants server/client mismatch** — Added documentation in SKILL.md, firebase guide, and pitfalls about extracting `buttonVariants` from `"use client"` file for Server Component use
- **No button click effects** — All UI component templates now include loading spinners (`animate-spin`), disabled states, and `active:scale-[0.98]` press effect with `transition-all duration-200`
- **Firebase config template** — Replaced `onAuthStateChanged` listener pattern with explicit `createSessionCookie()` and `clearSessionAndSignOut()` helpers. Added complete login/register/sign-out usage examples
- **Poor README** — Added README template in SKILL.md Step 7 with step-by-step setup guide including env var table and Firebase Console instructions

### Added
- 3 new pitfalls in `09-common-pitfalls.md`: redirect race condition (#22), sign-out redirect (#23), buttonVariants build error (#24)
- `createSessionCookie()` helper pattern in firebase config template
- `clearSessionAndSignOut()` helper pattern in firebase config template
- Session cookie flow documentation in `05-firebase-auth-guide.md`
- README template with provider-specific setup instructions
- Step 2j (Generate README) in setup wizard
- `useRouter` + `router.push` pattern replacing `window.location.href` for login/register redirect
- Error message display from caught errors (shows actual error, not generic message)

### Changed
- `09-common-pitfalls.md` now has 55 pitfalls (was 27)
- Firebase auth guide now leads with session cookie helper pattern instead of `onAuthStateChanged`
- `onAuthStateChanged` listener marked as OPTIONAL (for token refresh only)
- Setup wizard Step 4 summary now includes full test flow instructions

## [1.0.1] - 2026-03-04

### Added
- `manifest.json` — skills registry (blueprint compliance)
- `CHANGELOG.md` — change history tracking
- `skills/auth-setup/evals/evals.json` — 7 test prompts for skill evaluation
- `keywords` and `skills` array in plugin.json

### Fixed
- `CLAUDE.md` CONFIG: filled empty `plugin_name`, updated `auth` field to list all 5 providers
- `README.md`: fixed 4 closing code fences (used ` ```bash `/` ```text ` instead of ` ``` `)
- `hooks/hooks.json`: corrected script path from `node_modules/...` to `skills/auth-setup/scripts/...`
- `plugin.json` version bump to 1.0.1

## [1.0.0] - 2026-02-28

### Added
- Initial release of shipwithai-auth plugin
- `auth-setup` skill with decision framework for 5 auth providers
- Provider guides: Better Auth, Clerk, Auth.js, Firebase Auth, Supabase Auth
- OAuth social login guide (Google, GitHub, Apple) across all providers
- Database schema templates: Drizzle ORM, Prisma, Supabase SQL
- UI components: login, register, forgot-password, user-profile, auth-provider-buttons
- Middleware templates: Next.js, Express, Hono
- Config templates for all 5 providers
- Interactive setup wizard (`/shipwithai-auth:setup`)
- 27+ common auth pitfalls from production
- Automated test suite (86 tests)
- Pre-commit hook for auth verification
