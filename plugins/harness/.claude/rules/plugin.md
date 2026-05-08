# Plugin Rules — shipwithai-auth

> Loaded by Claude Code automatically.
> This file is a **pointer** to the SOT — not the SOT itself.

## Source of Truth

Full ship/no-ship criteria with scoring live in [`QUALITY-STANDARDS.md`](../../QUALITY-STANDARDS.md).
Do NOT duplicate content here — update the SOT and link.

## Must-Know Summary (for every edit)

**SKILL.md:**
- < 500 lines (ideal < 300).
- Description < 200 characters, must include trigger phrases.
- Code examples < 20 lines inline; full templates go in `assets/`.

**References (`skills/<name>/references/*.md`):**
- < 300 lines each.
- Lazy-loaded only when the skill's step explicitly says to read them.
- Never import / reference from another skill's folder.

**Assets (`skills/<name>/assets/**`):**
- User-facing code templates. Kept copy-paste ready.
- No placeholders that look like instructions to Claude (avoid phrases like "Claude should ...").

**Evals (`skills/<name>/evals/evals.json`):**
- ≥ 5 prompts per skill (see `.claude/rules/testing.md`).
- ≥ 3 must trigger; ≥ 2 must NOT trigger.

**Naming:**
- Skill directories: `lowercase-with-dashes` (e.g., `auth-setup`, `auth-doctor`).
- `SKILL.md`: always uppercase.
- Reference files: `lowercase-with-dashes.md`.

## What this plugin does NOT have

- No HTTP API → see `docs/PLUGIN-ARCHITECTURE.md` for layers.
- No database → DB-related rules in the stock framework don't apply.
- No runtime server process → the plugin runs inside Claude Code.

## Separation of Hooks

- `hooks/` (repo root) — shipped to end users; runs in **their** project.
- `.claude/hooks/` — dev-time guardrails for contributors to **this** repo.

Never conflate. Never cross-reference.

## Further Reading

- [`../../QUALITY-STANDARDS.md`](../../QUALITY-STANDARDS.md) — scoring matrix and ship decision
- [`../../docs/PLUGIN-ARCHITECTURE.md`](../../docs/PLUGIN-ARCHITECTURE.md) — layer boundaries
- [`../../docs/update-protocol.md`](../../docs/update-protocol.md) — update workflow
- [`../../docs/plan-before-execute.md`](../../docs/plan-before-execute.md) — planning workflow
