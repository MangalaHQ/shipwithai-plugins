# ShipWithAI Harness — Quality Standards & Evaluation Criteria

> This document defines the quality standards that plugins must meet before shipping to market.
> Each criterion has 3 levels: **Must Have** (mandatory), **Should Have** (should have), **Nice to Have** (nice to have).

---

## 1. Functional Completeness — Does the plugin work?

### Must Have
- [ ] `/shipwithai-harness:setup` runs, scans project silently, asks exactly 2 questions, generates CLAUDE.md + settings.json + 2 hooks + docs/ARCHITECTURE.md
- [ ] Works on Next.js, Spring Boot, Laravel, FastAPI projects (4 reference stacks)
- [ ] Works on unlisted stacks (Go, Rust, Rails) without crashing — falls back to generic scan
- [ ] Generated CLAUDE.md contains no unfilled `{{TOKEN}}` placeholders
- [ ] Generated CLAUDE.md is ≤ 200 lines
- [ ] Generated hooks are executable (`chmod +x` applied automatically)
- [ ] `validate-command.py` blocks fork bomb pattern (`:(){:|:&};:`)
- [ ] `protect-files.py` blocks writes to `.env`
- [ ] `/shipwithai-harness:doctor` runs health check and produces scored report

### Should Have
- [ ] Detects existing CLAUDE.md and warns before overwriting
- [ ] Scan summary shown before asking questions
- [ ] settings.json allow rules customized per detected toolchain (bun vs npm, pytest vs jest)

### Nice to Have
- [ ] Suggests harness-doctor after setup completes
- [ ] Detects monorepo structure and asks which sub-project to generate for

**Evaluation method:** Tester runs `/shipwithai-harness:setup` in a real project, verifies all 5 files generated, hooks are executable, no unfilled tokens. Time to complete: < 2 minutes.

---

## 2. Code Quality — Is the code trustworthy?

### Must Have
- [ ] All .ts/.tsx files pass syntax check (`node tests/run-all.js` section 2 = 0 failures)
- [ ] No hardcoded secrets in any file (section 4 = 0 failures)
- [ ] Each component has `"use client"` directive
- [ ] Each component has `export default`
- [ ] Each config file uses `process.env` for all secrets
- [ ] Cookies have `httpOnly: true` and `secure` flag in production
- [ ] Session cookies have `sameSite: "lax"` minimum

### Should Have
- [ ] Do not use `any` type more than 5 times per file
- [ ] Error handling for all async operations (try/catch)
- [ ] Loading states for all form submissions
- [ ] TypeScript strict mode compiles without errors (excluding module resolution)

### Nice to Have
- [ ] Type exports for User, Session, Account
- [ ] JSDoc comments for public functions
- [ ] Consistent naming convention across files

**Evaluation method:** `node tests/run-all.js --verbose`. Section 2 + 4 + 7 must be 100% pass.

---

## 3. Documentation Accuracy — Is the guide correct?

### Must Have
- [ ] All code snippets are copy-paste and **work** (no changes needed except env vars)
- [ ] Package names match current npm registry (check with `npm info <package>`)
- [ ] Import paths correct for Next.js App Router (`@/lib/...`, `@/app/...`)
- [ ] Env var names in guide match env.example
- [ ] No reference to deprecated APIs (Auth.js v4 patterns, @supabase/auth-helpers)
- [ ] Code blocks have language tag (`typescript`, `bash`, `sql`, `prisma`)

### Should Have
- [ ] Each guide has "Gotchas" section with real bugs
- [ ] Redirect URIs for OAuth providers accurate for each auth provider
- [ ] Cost comparison table updated (Clerk, Supabase, Firebase pricing)
- [ ] Migration notes between providers

### Nice to Have
- [ ] Video/GIF demo for setup flow
- [ ] Troubleshooting FAQ
- [ ] Comparison matrix with competitors (ClaudeKit, etc.)

**Evaluation method:** Choose random 5 code snippets from each guide, paste into real project, compile. If > 1 snippet errors → guide FAILS.

---

## 4. User Experience — Is it easy to use?

### Must Have
- [ ] **Zero-to-auth < 10 minutes:** From fresh project to working login page
- [ ] **Clear decision framework:** User finishes reading knowing which provider to choose
- [ ] **Copy-paste workflow:** No need to write code from scratch, just uncomment + paste
- [ ] **Clear env vars:** Know where to get each env var (console/dashboard link)
- [ ] **Helpful error messages:** When config is missing, guide clearly states what needs fixing
- [ ] Setup command asks 3-4 correct questions, not too many

### Should Have
- [ ] UI components look good by default (shadcn/ui), responsive
- [ ] Dark mode compatible
- [ ] Middleware template works immediately after uncomment
- [ ] verify script runs before deploy, catches common errors

### Nice to Have
- [ ] One-click setup (run 1 command, automatically everything)
- [ ] Interactive provider comparison tool
- [ ] Auto-detect existing project setup

**Evaluation method:** Have 1 person unfamiliar with guide try setup. Measure time + number of times stuck. Target: < 10 minutes, stuck < 2 times.

---

## 5. Market Readiness — Is it sellable?

### Must Have
- [ ] **README.md** clear: what it does, quick start, file structure
- [ ] **Differentiation statement:** Why buy this instead of using free? (2 providers + coming soon, 60 pitfalls, UI components)
- [ ] **No legal issues:** No code copied entirely from ClaudeKit or other projects
- [ ] **Works on macOS + Linux + Windows (WSL2)**
- [ ] **Works with npm, pnpm, yarn**
- [ ] **License file** (MIT or custom commercial)
- [ ] Landing page has: demo, pricing, feature list, testimonials (after team testing)

### Should Have
- [ ] Changelog for each version
- [ ] GitHub Issues template (bug report, feature request)
- [ ] npm/pnpm/yarn compatibility tested
- [ ] Clear pricing tier: Free (1 provider) vs Pro (2 providers + UI + pitfalls + coming soon providers)

### Nice to Have
- [ ] Product Hunt launch page
- [ ] X/Twitter thread content ready
- [ ] Affiliate/referral program
- [ ] Discord/community support channel

**Evaluation method:** Have 3 people outside team (know nothing about project) read landing page + README. Ask: "Would you buy this? Why?". If < 2/3 say yes → need to improve messaging.

---

## 6. Reliability — Is it stable?

### Must Have
- [ ] Automated test suite pass ≥ 90% (`node tests/run-all.js`)
- [ ] Doesn't crash when missing env vars (graceful error message)
- [ ] Doesn't crash when DB not migrated (clear error)
- [ ] OAuth redirect doesn't infinite loop
- [ ] Session expired → redirect to login (no white screen)

### Should Have
- [ ] E2E test pass for 2/2 providers (`node tests/e2e-provider.js --provider=better-auth,firebase`)
- [ ] Works with Next.js 14 and 15
- [ ] Works with both App Router and Pages Router (or clearly document App Router only support)
- [ ] Rate limiting documented/configured

### Nice to Have
- [ ] Load test: 100 concurrent logins without errors
- [ ] Chaos test: kill DB mid-session → graceful recovery
- [ ] Uptime monitoring for demo site

**Evaluation method:** Run `node tests/run-all.js` + `node tests/e2e-provider.js --provider=all`. Combined pass rate ≥ 90%.

---

## Scoring & Ship Decision

| Category | Weight | Score (0-10) | Weighted |
|----------|--------|-------------|----------|
| 1. Functional Completeness | 30% | ___ | ___ |
| 2. Code Quality | 20% | ___ | ___ |
| 3. Documentation Accuracy | 20% | ___ | ___ |
| 4. User Experience | 15% | ___ | ___ |
| 5. Market Readiness | 10% | ___ | ___ |
| 6. Reliability | 5% | ___ | ___ |
| **TOTAL** | **100%** | | **___** |

### Ship Decision Matrix

| Score | Decision | Action |
|-------|----------|--------|
| **≥ 8.0** | **Ship it** | Push to marketplace, start marketing |
| **7.0 – 7.9** | **Soft launch** | Share with select beta users, collect feedback |
| **6.0 – 6.9** | **Internal only** | Team testing only, fix critical issues |
| **< 6.0** | **Not ready** | Major rework needed |

### Minimum Thresholds (any below this level → do not ship)

- Functional Completeness ≥ 7 (both 2/2 providers work end-to-end)
- Code Quality ≥ 8 (no security issues)
- Documentation Accuracy ≥ 7 (code snippets must work)
- Automated tests pass rate ≥ 85%

---

## Current Status

**Date:** _______________
**Tester:** _______________
**Automated test result:** 75/86 passed (87%)

| Category | Score | Notes |
|----------|-------|-------|
| Functional Completeness | /10 | Haven't tested with real OAuth credentials yet |
| Code Quality | /10 | 75/86 automated, security passed |
| Documentation Accuracy | /10 | Code blocks missing language tags |
| User Experience | /10 | Haven't tested with external users |
| Market Readiness | /10 | No landing page yet, no license |
| Reliability | /10 | No E2E test with real DB yet |
| **TOTAL** | **/10** | |
| **Decision** | | |

---

## Review Checklist For Team Lead

Before approving ship:

1. [ ] Ran `node tests/run-all.js` and pass rate ≥ 85%
2. [ ] At least 3 developers tested 3 different providers successfully
3. [ ] At least 1 developer tested on macOS, 1 on Linux/WSL
4. [ ] No security issues (section 4 = 100% pass)
5. [ ] README + landing page reviewed by non-developer
6. [ ] Pricing set on Polar/Gumroad
7. [ ] License file added
8. [ ] Git repo clean (no .env files committed)
