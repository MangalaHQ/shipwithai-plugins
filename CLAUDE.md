# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## What This Repo Is

A **monorepo** for ShipWithAI's Claude Code plugins. Each plugin lives in `plugins/<name>/` and is independently publishable to the Claude plugin marketplace. There is no build step — plugins are skill-based (markdown + templates), not compiled code.

---

## Commands

```bash
# Install the marketplace (users — no repo cloning needed)
/plugin marketplace add ShipWithAI/shipwithai-plugins

# Or register a local clone as marketplace (contributors)
/plugin marketplace add /absolute/path/to/shipwithai-plugins

# Install a plugin from the marketplace
/plugin install shipwithai-auth@shipwithai

# Load a single plugin for one session (contributor testing)
claude --plugin-dir ./plugins/auth

# Validate and dry-run publish a plugin
./scripts/publish-plugin.sh auth --dry-run

# Publish a plugin (checks structure + version consistency, syncs marketplace.json)
./scripts/publish-plugin.sh auth

# Run a plugin's test suite (if it has one)
cd plugins/auth && node tests/run-all.js
```

**CI triggers automatically:**
- PRs touching `plugins/**` → `validate-plugin.yml` (structure, version consistency, quality limits)
- Push to `main` with a version bump in `plugin.json` → `publish-plugin.yml` (creates GitHub Release)

---

## Plugin Structure

Every plugin must contain:

| File | Purpose |
|---|---|
| `.claude-plugin/plugin.json` | Plugin identity (name, version, author, skills list) |
| `manifest.json` | Skills registry with skillId, version, enabled flag |
| `skills/<name>/SKILL.md` | Slim router + decision framework — **< 200 lines** |
| `skills/<name>/bundles/*.md` | Provider-specific complete guides — **< 500 lines each** |
| `skills/<name>/references/*.md` | Cross-cutting guides, lazy-loaded — **< 150 lines each** |
| `skills/<name>/assets/` | Copy-paste code templates |
| `skills/<name>/evals/evals.json` | Test prompts: ≥ 5 total (≥ 3 trigger, ≥ 2 must-not-trigger) |
| `CLAUDE.md` | Runtime config for Claude Code |
| `README.md` | User-facing docs |
| `CHANGELOG.md` | Version history |

Reference implementation: `plugins/auth/`

---

## Architecture

**Skill flow:** User runs command → Claude reads `SKILL.md` (router) → routes to `bundles/` or `references/` → generates code from `assets/`

**Key constraints:**
- `SKILL.md` is a router, not a guide. Full implementation details go in `bundles/`.
- Plugins are **self-contained** — no cross-plugin imports.
- No HTTP server, no database, no runtime process. The plugin runs inside Claude Code.
- `hooks/` (plugin root) ships to end users and runs in their project. `.claude/hooks/` are dev-time guardrails for contributors to this repo. Never conflate them.

---

## Quality Limits (enforced by CI)

| File type | Line limit |
|---|---|
| `SKILL.md` | 200 |
| Bundle files | 500 |
| Reference files | 150 |
| Code examples inline in `SKILL.md` | 20 (full code → `assets/`) |

Skill description: < 200 characters, must include trigger phrases.

---

## Versioning & Publishing

- Version is the source of truth in `.claude-plugin/plugin.json`.
- If `marketplace.json` exists, its version must match `plugin.json` — CI blocks mismatches.
- A version bump in `plugin.json` on `main` triggers automatic GitHub Release creation.
- Commands: `shipwithai-<plugin>:<command>` (e.g., `shipwithai-auth:setup`).

---

## Working on a Plugin

1. **Audit first** — read all `SKILL.md` files, `manifest.json`, `CHANGELOG.md` before changing anything.
2. **Plan before coding** — create `PLAN.md` (gitignored) and get approval before writing code.
3. **Read before write** — always read a file before editing it; edit sections, don't rewrite whole files.
4. **After changes** — update `CHANGELOG.md`, bump version in `plugin.json` (and `marketplace.json` if it exists), update `manifest.json` if skills were added/removed.

## Creating a New Plugin

```bash
cp -r plugins/auth plugins/my-new-plugin
# Edit .claude-plugin/plugin.json, manifest.json, CLAUDE.md, README.md, CHANGELOG.md
# Replace auth-specific skill content
```

---

## Security Hard Rules

- `npm install` must always use `--ignore-scripts --save-exact`.
- Never hardcode secrets, API keys, or tokens in any file.
- Never commit `.env`, `*.pem`, `*.key`.
- Ask before installing any package with < 1,000 weekly downloads or first published within 30 days.
- `npm publish` is blocked by `.claude/hooks/validate-command.py` — publish from outside Claude Code.