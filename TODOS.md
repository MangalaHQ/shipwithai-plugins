# TODOS

Deferred work captured from `/plan-eng-review` sessions. Each item has full context so a future contributor can pick it up cold.

---

## TODO-001: auth-doctor README quality check

**What:** Extend `plugins/auth/skills/auth-doctor/` to scan the user's project README for missing/outdated sections after env vars or middleware changes.

**Why:** README is generated once at `/shipwithai-auth:setup` time. If a user later adds a new env var (e.g., adds GitHub OAuth), the README still says "Google only" — silent rot. Doctor is the natural place to detect this.

**Pros:**
- Catches silent documentation drift
- Reuses existing doctor skill infrastructure
- Low surface area — only scans README structure

**Cons:**
- Scope creep on doctor skill (currently focused on runtime auth health)
- May produce false positives if user customized README

**Context:**
- Triggered by /plan-eng-review on 2026-04-26 during scope-down of README quality fix PR
- Templates being added to `plugins/auth/skills/auth-setup/assets/templates/providers/{firebase,better-auth}/README.md.tmpl`
- Doctor would diff generated section markers (e.g., `<!-- shipwithai-auth:env-vars -->`) against `.env.example`
- Where to start: add new check in doctor's pipeline; reuse `references/05-firebase-auth-guide.md` as authoritative reference

**Depends on / blocked by:**
- Templates from current PR must ship first (need stable section markers)
- Should wait at least 1 month after template ships to gather real-world drift patterns

**Filed:** 2026-04-26 by /plan-eng-review on branch `fix/ci/publish-permissions`

---

## TODO-002: Fix `checkSecurity()` false-positive pass message in verify-auth-setup.ts

**What:** In `plugins/auth/skills/auth-setup/scripts/verify-auth-setup.ts:246`, the line `pass("No hardcoded secrets detected in checked files")` runs unconditionally — even after a `fail()` was emitted for a matching secret pattern. Output then shows both ❌ and ✅ for the same check.

**Why:** Output is misleading. CI catches it via non-zero exit (because `hasErrors` was set), but a human reading the log can miss the real finding when a green ✅ appears two lines later. Surfaced by security-reviewer agent on 2026-04-26.

**Pros:**
- Trivial one-token fix (guard `pass()` behind a local `foundSecrets` boolean)
- Makes verify script output trustworthy

**Cons:**
- None — pure UX bug

**Context:**
- Pre-existing bug discovered during validation of the README-quality PR (1.7.1)
- Filed as separate TODO because it's outside the scope of that PR (CONTRIBUTING.md "stay in scope")
- Where to start: `verify-auth-setup.ts:235-246` — wrap the loop in `let foundSecrets = false;` and only call `pass()` when the loop ends with `foundSecrets === false`

**Depends on / blocked by:** none.

**Filed:** 2026-04-26 by autopilot Phase 4 validation review

---

## TODO-003: v1.7.2 — Tighten README generation LLM compliance

**What:** Even with v1.7.1 templates, real-world generated READMEs sometimes (a) collapse sections (Provider Configuration walkthrough stripped), (b) auto-link plain hostnames creating nested `[[host](url)](url)` markdown bugs, (c) drop deep links to `references/*.md` in Resources section, (d) drop `(pitfall #N)` cross-references in Common Issues table.

**Why:** v1.7.1 added high-quality templates but did not enforce that the LLM **preserves** them verbatim during Step 8 generation. Two end-user examples reviewed: one Better Auth README was collapsed (pitfalls #43/#38/#47 lost — the very issues v1.7.1 was meant to surface), one Firebase README mostly preserved but had 5 nested-link rendering bugs.

**Pros:**
- Closes the "great template, mediocre output" gap
- Verifier-enforced — catches regressions at generation time
- Aligns generated README quality with template quality

**Cons:**
- Touching SKILL.md Step 8 again so soon (just rewrote in v1.7.1)
- More verifier assertions = more false-positive risk

**Context:**
- Three concrete fixes:
  1. Add anti-auto-link rule in SKILL.md Step 8: domain names (`firebaseapp.com`, `localhost`) MUST stay plain or inline-code, never `[host](url)`. Add Step 8d regex: `/\[[\w.]+\.com\]\(http/` should match zero times.
  2. Force Resources section preservation: instruction "Resources section MUST include all deep links from template verbatim — do NOT replace with generic external links." Verifier asserts presence of `references/02-better-auth-guide.md`, `references/05-firebase-auth-guide.md`, `references/07-oauth-social-login.md`, `references/09-common-pitfalls.md` in generated README based on provider.
  3. Force pitfall reference preservation: "When copying Common Issues table, preserve `(pitfall #N)` references." Verifier asserts at least 2 `(pitfall #` occurrences in generated README.
- Plus user-onboarding fixes from second review:
  4. Quick Start: explicit `cp .env.example .env.local` step (not "fill in .env.local")
  5. Step 3 Firebase Service Account: concrete `.env.local` example showing quotes + `\n` escapes
  6. Step 6 OAuth: clarify `<PROJECT>` = same value as `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  7. Add committed-secret recovery instructions

**Depends on / blocked by:**
- v1.7.1 ships first (this PR)
- Gather 2-3 more real-world generated READMEs to confirm pattern frequency

**Filed:** 2026-04-26 by post-ship code review of generated README artifacts

---
