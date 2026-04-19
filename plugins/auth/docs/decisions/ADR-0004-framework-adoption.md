# ADR-0004 — Adopt `shipwithai-claude-md-framework` Phase 2

- **Status:** accepted
- **Date:** 2026-04-18
- **Supersedes:** none

## Context

Plugin repo was accumulating ad-hoc rules, scattered docs, and inconsistent security guardrails. The `shipwithai-claude-md-framework` (released internally) defines a 5-phase adoption roadmap for structured CLAUDE.md + SOT + guardrails. Phase 2 ("Team Foundation") targets teams of 2-5 shipping to production, which matches `shipwithai-auth` today.

The framework's stock templates assume a typical web app (Next.js / FastAPI / Express). This plugin is a Claude Code plugin with no HTTP API and no database — so a straight copy would leave irrelevant rules and miss plugin-specific ones.

## Decision

Adopt Phase 2 with three plugin-specific adaptations:

1. **Replace `docs/DATA-MODELS.md`** — skipped. No DB.
2. **Replace `.claude/rules/api.md` with `.claude/rules/plugin.md`** — pointer to `QUALITY-STANDARDS.md` + Claude-readable rules about SKILL.md / references / assets. Avoids duplication (Y-statement 2026-04-18).
3. **Replace `docs/ARCHITECTURE.md` with `docs/PLUGIN-ARCHITECTURE.md`** — document the Commands → Skills → References/Assets layering, not HTTP layering.

Additional hardening decisions recorded:

- `blueprint_path` moves from root `CLAUDE.md` to `CLAUDE.local.md` (personal, gitignored).
- `CLAUDE.md` refactored to 197 lines (under 200-line cap) by extracting behavioral / plan / update detail to `docs/`.
- Security hooks (`validate-command.py`, `protect-files.py`) installed AFTER the CLAUDE.md refactor, because `protect-files.py` marks `CLAUDE.md` read-only once active.
- `npm publish` remains blocked by `validate-command.py`. Publishing happens outside Claude Code.
- `tests/last-run.json` is NOT added to protected globs — it's a regenerable test artifact.

Version bump: `1.6.1 → 1.7.0` (minor — added tooling and docs, no breaking behavior change for plugin consumers).

## Alternatives Considered

- **Phase 3 (Production Hardened).** Deferred. Phase 3 adds gitleaks, lefthook, GH Actions. Valuable but 1-2 hrs extra and bigger contributor onboarding cost. Will revisit after Phase 2 stabilizes.
- **Phase 1 (Solo Dev Serious).** Rejected. Plugin ships publicly; Phase 2's decision log + PR template + hooks are load-bearing.
- **Leave existing ad-hoc CLAUDE.md.** Rejected. It was 295 lines, mixed guidance with rules, and had no enforceable guardrails.

## Consequences

- Contributors can no longer edit root `CLAUDE.md`, `.claude/settings.json`, or `.claude/hooks/*` from within Claude Code — edits to these four require human hands.
- `CLAUDE.local.md` must be created by every contributor on first checkout.
- `QUALITY-STANDARDS.md` remains the SOT for ship/no-ship scoring; `.claude/rules/plugin.md` references it.
- Phase 3 is a future upgrade path; additive and reversible.

## Follow-ups

- After 2 weeks with Phase 2 active, run a post-mortem: did the guardrails block any legitimate work? Adjust `permissions` in `.claude/settings.json` as needed (human edit).
- Evaluate Phase 3 for the 2026-05 release cycle.
