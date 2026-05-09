---
name: harness-setup
description: "Generate a Claude Code harness for your project. Auto-detects stack (Next.js, Laravel, Spring Boot). Generates CLAUDE.md, settings.json, hooks. Run /shipwithai-harness:setup"
version: 1.0.0
license: MIT
---

# Harness Setup

Generate a production-ready Claude Code harness for your project in under 2 minutes.
Detects your stack automatically, fills in tokens from your project files, and generates CLAUDE.md, settings.json, and two safety hooks.

## When to Use

- Starting a new project and want Claude Code to understand it immediately
- Existing project missing CLAUDE.md or with a generic one
- Need settings.json with balanced permission rules
- Want validate-command.py and protect-files.py safety hooks

## Step 0: Detect Stack (SILENT — no user interaction)

Before asking ANY questions, scan these files:

| File to check | Detected stack |
|---|---|
| `pom.xml` | Spring Boot |
| `package.json` with `"next"` in deps | Next.js |
| `composer.json` | Laravel |
| `requirements.txt` or `pyproject.toml` with `fastapi` dep | FastAPI |
| `package.json` without `"next"` | Node/generic |
| None of the above | Generic |

Also auto-fill these tokens from project files:

| Token | Source |
|---|---|
| `{{PROJECT_NAME}}` | `package.json:.name` → `pom.xml:<artifactId>` → dirname |
| `{{PORT}}` | `package.json` scripts dev flag → `application.properties:server.port` → 3000/8080/8000 |
| `{{PKG_MANAGER}}` | `pnpm-lock.yaml`→pnpm, `yarn.lock`→yarn, `bun.lockb`→bun, else npm |
| `{{DATABASE}}` | detect `drizzle-orm`→Drizzle, `@prisma/client`→Prisma, `spring-data-jpa`→JPA, `illuminate/database`→Eloquent |
| `{{TEST_FRAMEWORK}}` | detect `jest`/`vitest`/`phpunit`/`junit` in deps |
| `{{DATE}}` | today's date (YYYY-MM-DD) |

**Check if CLAUDE.md already exists:**
- If `CLAUDE.md` exists and is non-empty → ⚠️ WARN: "Found existing CLAUDE.md. Overwrite or update?"
  - A) Overwrite with new harness
  - B) Keep existing, skip setup
- If `CLAUDE.md` does not exist → proceed silently

**Show detection summary:**
```
🔍 Project scan complete

Stack:        Next.js (Next.js 14.2.18)
Package mgr:  npm
Database:     Drizzle (drizzle-orm@0.30.10)
Tests:        Jest
Port:         3000

Tokens auto-filled: PROJECT_NAME, PKG_MANAGER, DATABASE, PORT, TEST_FRAMEWORK
Tokens needed from you: PROJECT_DESCRIPTION, CUSTOM_CONVENTIONS (optional)
```

## Step 1: Ask 2 Questions

Ask both questions using `AskUserQuestion`. Keep this short.

**Q1 (required):** "Describe your project in one sentence."
*(e.g. "A SaaS invoicing app for freelancers" — used to fill CLAUDE.md project context)*

**Q2 (optional):** "Any coding conventions or rules Claude should follow? Leave blank to skip."
*(e.g. "Always use repository pattern. No raw SQL." — appended to CLAUDE.md conventions section)*

## Step 2: Route to Stack Bundle

After detection and Q1/Q2, route to the stack-specific bundle:

| Stack | Bundle |
|---|---|
| Next.js | `bundles/nextjs.md` |
| Laravel | `bundles/laravel.md` |
| Spring Boot | `bundles/spring-boot.md` |
| FastAPI | `bundles/fastapi.md` |
| Generic/unknown | use `bundles/nextjs.md` as closest default, ask user to confirm |

The bundle contains the full generation instructions: exactly which files to create, their content, and validation steps.

## Output Summary

After generation, show:

```
✅ Harness generated for Next.js project

Files created:
  CLAUDE.md               ← project context + conventions
  .claude/settings.json   ← permission rules
  .claude/hooks/validate-command.py   ← blocks dangerous commands
  .claude/hooks/protect-files.py      ← protects sensitive files

Next:
  chmod +x .claude/hooks/*.py   ← make hooks executable (or run: /shipwithai-harness:setup --fix-perms)
  Run /shipwithai-harness:doctor to verify health
```
