# Decision Records — shipwithai-auth

This folder tracks important architectural and policy decisions for the plugin.

## Decision Types

| Type | When to use | Location |
|------|-------------|----------|
| **ADR** (Architecture Decision Record) | Significant decisions affecting structure, dependencies, or workflow | `ADR-NNNN-short-title.md` (this folder) |
| **Y-Statement** (lightweight decision) | Micro-decisions made during coding | Appended to [DECISION-LOG.md](DECISION-LOG.md) |

## When to Create an ADR

Answer YES to ≥ 2 of these:

- Does it affect many skills or the plugin skeleton?
- Is it hard to reverse (> 1 day to revert)?
- Does it change an external contract (SKILL.md structure, manifest schema, hook API)?
- Do contributors need to know to work correctly?
- Does it change an important dependency or convention?

## How to Create an ADR

1. Copy an existing ADR as a template → `ADR-<next-number>-short-title.md`
2. Fill every section — **Context** and **Alternatives Considered** are the most important.
3. Status flow: `proposed` → team review → `accepted` (or `rejected` / `superseded`).
4. Add an entry to the Decision Index below.
5. If this supersedes an older ADR, cross-reference both directions.

## Decision Index

| ID | Title | Status | Date |
|----|-------|--------|------|
| ADR-0001 | Adopt external blueprints as plugin workflow SOT | accepted | 2026-03-09 |
| ADR-0002 | Mandatory Plan-Before-Execute for non-trivial work | accepted | 2026-03-09 |
| ADR-0003 | Separate Update Protocol for existing plugins | accepted | 2026-04-07 |
| ADR-0004 | Adopt `shipwithai-claude-md-framework` Phase 2 | accepted | 2026-04-18 |
