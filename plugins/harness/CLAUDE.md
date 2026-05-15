# CLAUDE.md — shipwithai-harness Plugin

> Claude Code reads this file automatically when entering this directory.
> Edit ONLY the CONFIG block below.

---

## CONFIG

```yaml
plugin_name: shipwithai-harness
plugin_version: 2.0.0
domain: Harness (Claude Code project setup)
target_user: Indie hackers and small teams using Next.js, Laravel, or Spring Boot
language: TypeScript / PHP / Java (generates for all 3)
```

---

## What This Plugin Does

Generates a Claude Code harness for a user's project:
- **Layer 1 Memory:** CLAUDE.md (auto-filled) + docs/ARCHITECTURE.md
- **Layer 3 Permission:** settings.json with balanced deny/allow/ask rules
- **Layer 4 Hooks (partial):** validate-command.py + protect-files.py

Phase numbers (0→2) are INTERNAL ONLY. Never show them to users.

---

## Behavioral Guidelines

1. **Detect silently** — scan project files before asking any questions
2. **Ask only 2 things** — project description + custom conventions (optional)
3. **Opinionated defaults** — generate the best harness for the detected stack, no tier selection
4. **Never overwrite** without asking — always check if CLAUDE.md already exists

---

## Security Hard Rules

- NEVER hardcode secrets in templates or assets
- NEVER generate code that disables safety features
- ALWAYS use `--ignore-scripts --save-exact` for any npm install
- Generated hooks must use `sys.exit(2)` to block dangerous commands

---

## Workflow

**NEVER without a plan:** new skill, modify SKILL.md, add reference file, change structure, add dependencies.
**OK without a plan:** fix typos, update version, add comments, read/analyze files.

**After every change:**
1. Check SKILL.md line count < 200
2. Check bundle line counts < 500
3. Check reference line counts < 150
4. Update CHANGELOG.md
5. Update manifest.json if skills changed
