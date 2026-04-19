## What

[1-3 sentences: what changed and why]

## Changes

- [Key change 1]
- [Key change 2]

## SOT Checklist (plugin-specific)

- [ ] `CLAUDE.md` is still accurate after this change (or unchanged)
- [ ] `docs/PLUGIN-ARCHITECTURE.md` updated if layer boundaries changed
- [ ] ADR created (under `docs/decisions/`) if this is an architectural decision (≥ 2 YES on the checklist in `docs/decisions/README.md`)
- [ ] Y-Statement appended to `docs/decisions/DECISION-LOG.md` if this is a micro-decision
- [ ] No secrets, tokens, or `.env` files included
- [ ] `CLAUDE.local.md` NOT committed

## Plugin Quality Checklist

- [ ] `manifest.json` updated if skills added / removed / renamed
- [ ] `CHANGELOG.md` entry added (Keep-a-Changelog format, correct version bump)
- [ ] Every changed / new `SKILL.md` is < 500 lines
- [ ] Every new skill has `evals/evals.json` with ≥ 5 prompts
- [ ] References and assets lazy-loaded (not inlined in `SKILL.md`)
- [ ] Plugin version in `CLAUDE.md` CONFIG matches `CHANGELOG.md` latest entry

## Testing

- [ ] `node tests/run-all.js` passes (attach pass rate if < 100%)
- [ ] `node tests/e2e-provider.js` passes for affected providers
- [ ] New test prompts added if new behavior was introduced
- [ ] Edge cases covered

## Plan

- [ ] `PLAN.md` was created before execution (or this is a trivial change — see CLAUDE.md "OK without a plan")
- [ ] For UPDATES: audit + impact analysis captured in PLAN.md
