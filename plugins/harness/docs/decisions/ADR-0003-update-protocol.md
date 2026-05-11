# ADR-0003 — Separate Update Protocol for existing plugins

- **Status:** accepted
- **Date:** 2026-04-07
- **Supersedes:** none

## Context

Plan-Before-Execute (ADR-0002) works well for new work. Updates to existing skills have different risks:

- Breaking other skills that depend on the one being changed.
- Silent regressions not caught because the old behavior wasn't re-tested.
- Version bumps skipped or incorrectly classified (patch vs minor vs major).

## Decision

When a request is UPDATE / FIX / IMPROVE / MODIFY, follow a dedicated 6-step protocol INSTEAD of the new-creation workflow:

1. **AUDIT** — read every SKILL.md, `manifest.json`, `CHANGELOG.md`, root `CLAUDE.md`.
2. **IMPACT ANALYSIS** — modified / created / not-touched; affected skills; backward-compat judgment.
3. **CREATE UPDATE PLAN** — PLAN.md including regression tests + new-feature tests + explicit version bump classification.
4. **Wait for approval.**
5. **Execute with 7 safety rules** — read before write, edit don't rewrite, one file at a time, test each change, stay in scope, match existing style, trace every line.
6. **Post-update verification** — run regression + new-feature tests, update CHANGELOG, bump version, show diff.

## Alternatives Considered

- **Reuse Plan-Before-Execute.** Rejected: it lacks audit + impact + regression emphasis.
- **Ad-hoc edits.** Rejected: reintroduces the failure modes from ADR-0002.

## Consequences

- Updates take longer to start but avoid regressions.
- `docs/update-protocol.md` captures the full detail; root CLAUDE.md shows the 6-step summary.
- Every update PR must demonstrate the audit happened (usually via PLAN.md content).
