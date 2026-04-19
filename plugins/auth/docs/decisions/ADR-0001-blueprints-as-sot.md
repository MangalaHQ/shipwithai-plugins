# ADR-0001 — Adopt external blueprints as plugin workflow SOT

- **Status:** accepted
- **Date:** 2026-03-09
- **Supersedes:** none

## Context

We build many plugins (auth, payment, blog, ...). Every plugin re-derives structure, naming, evals, testing — resulting in drift and inconsistency. A single canonical set of "blueprints" would let every plugin inherit the same skeleton.

## Decision

All plugins in the shipwithai ecosystem read from a central blueprint directory (`~/shipwithai-blueprints` by default, configurable per contributor). Blueprint files include:

- `en/plugin-blueprint-standard.md` — structure, specs, file formats
- `en/plugin-blueprint-advanced.md` — prompt engineering, testing, errors
- `en/UPDATE-WORKFLOW.md` — update protocol
- `en/shipwithai-product-strategy.md`, `en/shipwithai-vision-strategy.md`
- Templates (e.g., `PLAN.md.template`)

Before writing any code, Claude reads the relevant blueprint(s).

## Alternatives Considered

- **Inline everything in CLAUDE.md.** Rejected: CLAUDE.md would balloon beyond the 200-line practical cap, and different plugins would drift.
- **Duplicate blueprints per repo.** Rejected: updates don't propagate; drift is worse.

## Consequences

- Contributors must clone the blueprint repo (or symlink) before working.
- `blueprint_path` is personal → lives in `CLAUDE.local.md` (see ADR-0004).
- Updates to blueprints affect all plugins — coordinate via the blueprints repo's CHANGELOG.
