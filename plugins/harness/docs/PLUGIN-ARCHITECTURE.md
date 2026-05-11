# Plugin Architecture — shipwithai-auth

> Adapted from the framework's `docs/ARCHITECTURE.md` template for the plugin domain
> (no HTTP API, no database — different layers apply).

---

## Overview

`shipwithai-auth` is a **Claude Code plugin**. It does not run as a server or import into a consuming app. Instead, it ships:

- **Skills** — Markdown-driven procedures that Claude Code follows to scaffold auth in a user's project.
- **Commands** — Slash-command entry points (`/setup`, `/doctor`) that invoke skills.
- **Hooks** — Scripts Claude Code runs on tool events in the user's project (`post-write-check.sh`).
- **Tests & Evals** — JS harness that verifies plugin output against fixtures.
- **References & Assets** — Lazy-loaded content that skills pull in on demand.

The plugin's "runtime" is Claude Code itself. Treat this document as describing information flow, not process flow.

---

## Layers

```
┌─────────────────────────────────────────────────────────┐
│  Commands (commands/*.md)                                │
│  Entry points — minimal, delegate to skills              │
└─────────────────────────────────────────────────────────┘
              │ invokes
              ▼
┌─────────────────────────────────────────────────────────┐
│  Skills (skills/<name>/SKILL.md)                         │
│  Orchestration — the "what Claude should do" doc         │
└─────────────────────────────────────────────────────────┘
              │ lazy-loads
              ▼
┌──────────────────────┐        ┌──────────────────────────┐
│ References           │        │ Assets                    │
│ (skills/*/references)│        │ (skills/*/assets)         │
│ Deep-dive content    │        │ Templates, code snippets  │
└──────────────────────┘        └──────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Hooks (hooks/*.sh, hooks.json)                          │
│  Guardrails on user-project events (runs in user repo)   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Tests & Evals (tests/, skills/*/evals/)                 │
│  Regression + trigger quality                            │
└─────────────────────────────────────────────────────────┘
```

---

## Layer Boundaries (hard)

| From → To | Allowed? | Why |
|---|---|---|
| Command → Skill | ✅ | Commands are thin entry points |
| Skill → Reference (own) | ✅ | Lazy-load deep content |
| Skill → Asset (own) | ✅ | Pull in code templates |
| Skill → Skill (cross) | ⚠️ Only by reference, not inclusion | Keeps skills independent |
| Skill → Hook | ❌ | Hooks live in user's project, not ours |
| Reference → Skill | ❌ | References are leaves |
| Hook → Skill | ❌ | Hooks don't invoke skills |
| Test → Skill | ✅ | Tests validate skill output |
| Test → Reference | ⚠️ Only via skill output | Don't test references directly |

### Rules Claude must not cross

- A `SKILL.md` never includes another `SKILL.md`.
- References under `skills/<A>/references/` are not read from inside `skills/<B>/`.
- Commands do not contain business logic — they call skills.
- Hooks in `hooks/` (shipped to end users) are NEVER conflated with `.claude/hooks/` (dev-time guardrails for this repo).

---

## Dependency Direction

```
Commands → Skills → References / Assets
           Skills ← (consumed by) Tests
```

Never import upward:
- References must not know about Skills.
- Assets must not know about Skills.
- Tests don't modify any skill file at runtime.

---

## Two Kinds of Hooks — DO NOT confuse

| Path | Audience | Purpose |
|---|---|---|
| `hooks/` (repo root) | End users who install the plugin | Runs in the user's project (e.g., `post-write-check.sh`) |
| `.claude/hooks/` | Contributors to this repo | Runs in THIS repo during dev (e.g., `validate-command.py`, `protect-files.py`) |

These are separately versioned, separately audited, and MUST NEVER cross-reference.

---

## Where things live

| Concern | Location |
|---|---|
| Plugin entry commands | `commands/*.md` |
| Skill orchestration | `skills/<name>/SKILL.md` |
| Deep content for a skill | `skills/<name>/references/*.md` |
| Templates / code for a skill | `skills/<name>/assets/**` |
| Trigger evals | `skills/<name>/evals/evals.json` |
| Plugin manifest | `manifest.json` |
| Quality SOT | `QUALITY-STANDARDS.md` |
| Product strategy / vision | `docs/shipwithai-*.md` |
| Control-flow audit | `docs/plugin-control-flow-audit.md` |
| Setup blueprint | `docs/auth-setup-blueprint.md` |
| Decisions | `docs/decisions/` |

---

## When to split a skill

Split a single skill into two if any of these are true:

- `SKILL.md` exceeds 500 lines.
- Two distinct triggers exist (e.g., "set up auth" vs "diagnose broken auth") with non-overlapping flows.
- Different target users (developer setup vs ops diagnostic).

Current split: `auth-setup` (new project scaffold) vs `auth-doctor` (diagnose existing).
