# ADR-0002 — Mandatory Plan-Before-Execute for non-trivial work

- **Status:** accepted
- **Date:** 2026-03-09
- **Supersedes:** none

## Context

Earlier plugin work showed two failure modes:

1. **Silent assumptions** — Claude picked an auth provider or design pattern without surfacing tradeoffs, leading to rework.
2. **Scope creep** — requests like "fix login" grew into refactors of unrelated middleware.

Both wasted time and produced PRs that didn't trace to requests.

## Decision

For any non-trivial task (new skill, SKILL.md edit, new reference, structural change, dependency add), Claude MUST:

1. Analyze the request and surface assumptions.
2. Create `PLAN.md` using the blueprint template, covering Objective / Assumptions / Scope / Success Criteria / Testing.
3. Wait for user approval.
4. Execute step by step, updating PLAN.md after each step.

Trivial changes bypass the plan: typo fixes (< 3 chars), version bumps, comment edits, read-only analysis.

## Alternatives Considered

- **Optional planning.** Rejected: skipped in practice, original failure modes recurred.
- **Inline plan in chat.** Rejected: no persistence, hard to review in PRs.

## Consequences

- Slower start to any substantive task, but net faster because rework drops.
- PRs can attach or reference PLAN.md for reviewer context.
- Full detail captured in `docs/plan-before-execute.md`.
