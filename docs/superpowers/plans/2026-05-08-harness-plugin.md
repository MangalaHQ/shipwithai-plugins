# shipwithai-harness Plugin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `shipwithai-harness` — a plugin that auto-detects a project's tech stack and generates a complete Claude Code harness (CLAUDE.md + settings.json + 2 safety hooks) tailored to that stack, plus a doctor skill for health checks.

**Architecture:** Two skills: `harness-setup` (detect → ask 2 questions → generate files) and `harness-doctor` (scan → score → report → fix). `harness-setup` routes to stack-specific bundles in `bundles/`; file content lives in `assets/templates/`. MVP covers Layer 1 (Memory) + Layer 3 (Permission) + partial Layer 4 (validate-command.py + protect-files.py). Phases are internal org only — never shown to user.

**Tech Stack:** Markdown (SKILL.md, bundles, references), Python 3 (hooks), JSON (config, evals). No build step. No npm dependencies. Plugin structure mirrors `plugins/auth/`.

---

## File Structure

```
plugins/harness/
├── .claude-plugin/
│   ├── plugin.json
│   └── marketplace.json
├── .claude/
│   ├── hooks/
│   │   ├── validate-command.py   ← dev-time guardrail (contributors)
│   │   └── protect-files.py      ← dev-time guardrail (contributors)
│   ├── rules/
│   │   ├── plugin.md
│   │   ├── testing.md
│   │   └── security.md
│   └── settings.json
├── skills/
│   ├── harness-setup/
│   │   ├── SKILL.md              ← router, < 200 lines
│   │   ├── bundles/
│   │   │   ├── nextjs.md         ← < 500 lines
│   │   │   ├── laravel.md        ← < 500 lines
│   │   │   └── spring-boot.md    ← < 500 lines
│   │   ├── references/
│   │   │   ├── stack-detection.md   ← < 150 lines
│   │   │   └── phase-model.md       ← < 150 lines
│   │   ├── assets/
│   │   │   ├── templates/
│   │   │   │   ├── nextjs/
│   │   │   │   │   ├── CLAUDE.md.tmpl
│   │   │   │   │   └── settings.json.tmpl
│   │   │   │   ├── laravel/
│   │   │   │   │   ├── CLAUDE.md.tmpl
│   │   │   │   │   └── settings.json.tmpl
│   │   │   │   └── spring-boot/
│   │   │   │       ├── CLAUDE.md.tmpl
│   │   │   │       └── settings.json.tmpl
│   │   │   └── hooks/
│   │   │       ├── validate-command.py   ← generated INTO user project
│   │   │       └── protect-files.py      ← generated INTO user project
│   │   └── evals/
│   │       └── evals.json
│   └── harness-doctor/
│       ├── SKILL.md              ← router, < 200 lines
│       ├── references/
│       │   └── doctor-checks.md  ← < 150 lines
│       └── evals/
│           └── evals.json
├── commands/
│   ├── setup.md
│   └── doctor.md
├── manifest.json
├── CLAUDE.md
├── README.md
└── CHANGELOG.md
```

---

## Task 1: Scaffold Plugin Directory

**Files:**
- Create: `plugins/harness/` (full tree from auth, then cleaned)

- [ ] **Step 1: Copy auth plugin as base**

```bash
cp -r plugins/auth plugins/harness
```

- [ ] **Step 2: Remove auth-specific skill content**

```bash
rm -rf plugins/harness/skills/auth-setup
rm -rf plugins/harness/skills/auth-doctor
rm -f plugins/harness/commands/setup.md
rm -f plugins/harness/commands/doctor.md
rm -f plugins/harness/docs/auth-setup-blueprint.md
rm -f plugins/harness/docs/plugin-control-flow-audit.md
rm -f plugins/harness/docs/shipwithai-auth-testing-checklist.js
rm -f plugins/harness/docs/shipwithai-auth-testing-checklist.docx
rm -f plugins/harness/docs/shipwithai-execution-plan.md
rm -f plugins/harness/tests/last-run.json
```

- [ ] **Step 3: Create skill directories**

```bash
mkdir -p plugins/harness/skills/harness-setup/{bundles,references,assets/templates/{nextjs,laravel,spring-boot},assets/hooks,evals}
mkdir -p plugins/harness/skills/harness-doctor/{references,evals}
mkdir -p plugins/harness/commands
```

- [ ] **Step 4: Verify structure**

```bash
find plugins/harness -type d | sort
```

Expected: directories matching the File Structure above.

- [ ] **Step 5: Commit scaffold**

```bash
git add plugins/harness
git commit -m "feat(harness): scaffold plugin directory from auth template"
```

---

## Task 2: Plugin Metadata Files

**Files:**
- Create: `plugins/harness/.claude-plugin/plugin.json`
- Create: `plugins/harness/.claude-plugin/marketplace.json`
- Modify: `plugins/harness/manifest.json`
- Modify: `plugins/harness/CLAUDE.md`
- Create: `plugins/harness/CHANGELOG.md`

- [ ] **Step 1: Write plugin.json**

```json
{
  "name": "shipwithai-harness",
  "description": "Generate a production-ready Claude Code harness for your project. Auto-detects stack (Next.js, Laravel, Spring Boot). Generates CLAUDE.md, settings.json, and safety hooks in one command.",
  "version": "1.0.0",
  "author": {
    "name": "ShipWithAI",
    "url": "https://shipwithai.io"
  },
  "homepage": "https://shipwithai.io/plugins/harness",
  "repository": "https://github.com/MangalaHQ/shipwithai-plugins",
  "license": "MIT",
  "keywords": ["claude-code", "harness", "setup", "nextjs", "laravel", "spring-boot", "hooks", "settings"],
  "skills": [
    "./skills/harness-setup",
    "./skills/harness-doctor"
  ]
}
```

Write to: `plugins/harness/.claude-plugin/plugin.json`

- [ ] **Step 2: Write marketplace.json**

```json
{
  "$schema": "https://anthropic.com/claude-code/marketplace.schema.json",
  "name": "shipwithai-harness",
  "description": "Generate a production-ready Claude Code harness for your project. Auto-detects stack (Next.js, Laravel, Spring Boot). Generates CLAUDE.md, settings.json, and safety hooks in one command.",
  "owner": {
    "name": "ShipWithAI",
    "email": "support@shipwithai.com"
  },
  "plugins": [
    {
      "name": "shipwithai-harness",
      "description": "Generate a production-ready Claude Code harness for your project. Auto-detects stack, generates CLAUDE.md, settings.json, and safety hooks.",
      "version": "1.0.0",
      "author": {
        "name": "ShipWithAI",
        "email": "support@shipwithai.com"
      },
      "source": "./",
      "category": "productivity",
      "tags": ["claude-code", "harness", "setup", "nextjs", "laravel", "spring-boot"]
    }
  ],
  "version": "1.0.0"
}
```

Write to: `plugins/harness/.claude-plugin/marketplace.json`

- [ ] **Step 3: Write manifest.json**

```json
{
  "lastUpdated": 1746748800000,
  "skills": [
    {
      "skillId": "harness-setup",
      "name": "harness-setup",
      "description": "Generate a Claude Code harness for your project. Auto-detects stack (Next.js, Laravel, Spring Boot). Generates CLAUDE.md, settings.json, and safety hooks. Run /shipwithai-harness:setup",
      "creatorType": "community",
      "updatedAt": "2026-05-08T00:00:00Z",
      "enabled": true
    },
    {
      "skillId": "harness-doctor",
      "name": "harness-doctor",
      "description": "Diagnose and fix your Claude Code harness. Scans CLAUDE.md, settings.json, hooks health, and stack consistency. Produces scored report with actionable fixes.",
      "creatorType": "community",
      "updatedAt": "2026-05-08T00:00:00Z",
      "enabled": true
    }
  ]
}
```

Write to: `plugins/harness/manifest.json`

- [ ] **Step 4: Write CLAUDE.md (plugin runtime config)**

```markdown
# CLAUDE.md — shipwithai-harness Plugin

> Claude Code reads this file automatically when entering this directory.
> Edit ONLY the CONFIG block below.

---

## CONFIG

```yaml
plugin_name: shipwithai-harness
plugin_version: 1.0.0
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
```

Write to: `plugins/harness/CLAUDE.md`

- [ ] **Step 5: Write CHANGELOG.md**

```markdown
# Changelog

## [1.0.0] - 2026-05-08

### Added
- `harness-setup` skill: auto-detect stack, generate CLAUDE.md + settings.json + hooks
- `harness-doctor` skill: scan harness health, produce scored report
- Support for Next.js, Laravel, Spring Boot
- Stack detection: pom.xml → Spring Boot, package.json+next → Next.js, composer.json → Laravel
- Token auto-fill: PROJECT_NAME, PORT, PKG_MANAGER, DATABASE, TEST_FRAMEWORK
- Safety hooks (user-facing): validate-command.py + protect-files.py
```

Write to: `plugins/harness/CHANGELOG.md`

- [ ] **Step 6: Verify version consistency**

```bash
grep '"version"' plugins/harness/.claude-plugin/plugin.json plugins/harness/.claude-plugin/marketplace.json
```

Expected: both show `"version": "1.0.0"`.

- [ ] **Step 7: Commit**

```bash
git add plugins/harness/.claude-plugin/ plugins/harness/manifest.json plugins/harness/CLAUDE.md plugins/harness/CHANGELOG.md
git commit -m "feat(harness): add plugin metadata — plugin.json, manifest, CLAUDE.md, CHANGELOG"
```

---

## Task 3: harness-setup SKILL.md (Router)

**Files:**
- Create: `plugins/harness/skills/harness-setup/SKILL.md`

> This is the router only. Full implementation details go in bundles/.

- [ ] **Step 1: Write SKILL.md**

```markdown
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
| `package.json` without `"next"` | Node/generic |
| None of the above | Generic |

Also auto-fill these tokens from project files:

| Token | Source |
|---|---|
| `{{PROJECT_NAME}}` | `package.json:.name` → `pom.xml:<artifactId>` → dirname |
| `{{PORT}}` | `package.json` scripts dev flag → `application.properties:server.port` → 3000/8080/8000 |
| `{{PKG_MANAGER}}` | `pnpm-lock.yaml`→pnpm, `yarn.lock`→yarn, `bun.lockb`→bun, else npm |
| `{{DATABASE}}` | detect `drizzle-orm`→Drizzle, `@prisma/client`→Prisma, `spring-data-jpa`→JPA, `eloquent`→Eloquent |
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
```

Write to: `plugins/harness/skills/harness-setup/SKILL.md`

- [ ] **Step 2: Check line count**

```bash
wc -l plugins/harness/skills/harness-setup/SKILL.md
```

Expected: < 200 lines.

- [ ] **Step 3: Commit**

```bash
git add plugins/harness/skills/harness-setup/SKILL.md
git commit -m "feat(harness): add harness-setup SKILL.md router"
```

---

## Task 4: harness-setup Bundles — Next.js

**Files:**
- Create: `plugins/harness/skills/harness-setup/bundles/nextjs.md`

- [ ] **Step 1: Write nextjs.md bundle**

```markdown
# harness-setup — Next.js Bundle

Full generation guide for Next.js projects. Read after SKILL.md routes here.

## Files to Generate

| File | Action |
|---|---|
| `CLAUDE.md` | Create from `assets/templates/nextjs/CLAUDE.md.tmpl` |
| `.claude/settings.json` | Create from `assets/templates/nextjs/settings.json.tmpl` |
| `.claude/hooks/validate-command.py` | Copy from `assets/hooks/validate-command.py` |
| `.claude/hooks/protect-files.py` | Copy from `assets/hooks/protect-files.py` |
| `docs/ARCHITECTURE.md` | Create with architecture skeleton |

## Generation Steps

### 1. Create directories

```bash
mkdir -p .claude/hooks docs
```

### 2. Generate CLAUDE.md

Read `assets/templates/nextjs/CLAUDE.md.tmpl`.
Replace all `{{TOKEN}}` placeholders with detected/user-provided values:

| Token | Value |
|---|---|
| `{{PROJECT_NAME}}` | From Step 0 detection |
| `{{PROJECT_DESCRIPTION}}` | From Q1 answer |
| `{{PKG_MANAGER}}` | From Step 0 detection |
| `{{DATABASE}}` | From Step 0 detection (or "Not configured" if none) |
| `{{PORT}}` | From Step 0 detection (default: 3000) |
| `{{TEST_FRAMEWORK}}` | From Step 0 detection (default: Jest) |
| `{{CUSTOM_CONVENTIONS}}` | From Q2 answer (or empty string if skipped) |
| `{{DATE}}` | Today's date (YYYY-MM-DD) |

Write result to `CLAUDE.md`.

**CRITICAL:** CLAUDE.md hard cap is 200 lines. If `{{CUSTOM_CONVENTIONS}}` answer is very long, truncate at 10 lines and note "see docs/CONVENTIONS.md for full list".

### 3. Generate settings.json

Read `assets/templates/nextjs/settings.json.tmpl`.
No token substitution needed — this file is stack-specific but has no variable values.
Write to `.claude/settings.json`.

**CRITICAL — settings.json goes in `.claude/`, NOT project root.**
Claude Code reads `.claude/settings.json`, not `settings.json`.

### 4. Copy hooks

```bash
cp {plugin_assets_path}/hooks/validate-command.py .claude/hooks/validate-command.py
cp {plugin_assets_path}/hooks/protect-files.py .claude/hooks/protect-files.py
chmod +x .claude/hooks/validate-command.py
chmod +x .claude/hooks/protect-files.py
```

Where `{plugin_assets_path}` is the resolved path to `skills/harness-setup/assets/`.

**Note:** The hooks must also be registered in `.claude/settings.json` under `hooks`. The settings.json template already includes this registration — do NOT add it again manually.

### 5. Generate docs/ARCHITECTURE.md

Create `docs/ARCHITECTURE.md` with this skeleton (substitute {{PROJECT_NAME}} and {{PROJECT_DESCRIPTION}}):

```markdown
# {{PROJECT_NAME}} — Architecture

> {{PROJECT_DESCRIPTION}}
> Last updated: {{DATE}}

## Stack

- Framework: Next.js 14+ App Router
- Language: TypeScript (strict)
- Database: {{DATABASE}}
- Styling: Tailwind CSS + shadcn/ui

## Project Structure

```
src/
  app/          ← App Router pages + layouts
  components/   ← Shared UI components
  lib/          ← Utilities, configs, helpers
  db/           ← Database schema + client (if using ORM)
```

## Key Decisions

- App Router (not Pages Router) — Server Components by default
- TypeScript strict mode — no implicit any
- {{DATABASE}} for data layer

## Boundaries

- API routes live in `src/app/api/`
- Server-only code must not be imported in client components
- Environment variables accessed only through typed wrappers in `src/lib/env.ts`
```
```

### 6. Wire hooks in settings.json (verify)

Read the generated `.claude/settings.json` and confirm it contains:

```json
"hooks": {
  "PreToolUse": [
    {
      "matcher": "Bash",
      "hooks": [{ "type": "command", "command": "python3 .claude/hooks/validate-command.py" }]
    }
  ],
  "PostToolUse": [
    {
      "matcher": "Write|Edit",
      "hooks": [{ "type": "command", "command": "python3 .claude/hooks/protect-files.py" }]
    }
  ]
}
```

If missing → add it. This wiring is required — settings.json alone without hooks is FRAGILE.

### 7. Validate output

Check all 4 generated files exist:

```bash
ls -la CLAUDE.md .claude/settings.json .claude/hooks/validate-command.py .claude/hooks/protect-files.py
```

Check CLAUDE.md line count ≤ 200:

```bash
wc -l CLAUDE.md
```

Check no unfilled `{{TOKEN}}` remains:

```bash
grep -c '{{' CLAUDE.md || true
```

Expected: 0. If > 0, list unfilled tokens and ask user to provide values.

Check hooks are executable:

```bash
ls -la .claude/hooks/
```

Expected: `-rwxr-xr-x` for both .py files.
```

Write to: `plugins/harness/skills/harness-setup/bundles/nextjs.md`

- [ ] **Step 2: Check line count**

```bash
wc -l plugins/harness/skills/harness-setup/bundles/nextjs.md
```

Expected: < 500 lines.

- [ ] **Step 3: Commit**

```bash
git add plugins/harness/skills/harness-setup/bundles/nextjs.md
git commit -m "feat(harness): add harness-setup Next.js bundle"
```

---

## Task 5: harness-setup Bundles — Laravel + Spring Boot

**Files:**
- Create: `plugins/harness/skills/harness-setup/bundles/laravel.md`
- Create: `plugins/harness/skills/harness-setup/bundles/spring-boot.md`

Both bundles follow the exact same structure as `nextjs.md`. Key differences:

**laravel.md differences:**

| Aspect | Laravel value |
|---|---|
| Template path | `assets/templates/laravel/CLAUDE.md.tmpl` |
| Settings path | `assets/templates/laravel/settings.json.tmpl` |
| `{{PORT}}` default | 8000 |
| `{{PKG_MANAGER}}` | composer (PHP) + npm/yarn (frontend assets) |
| `{{TEST_FRAMEWORK}}` | PHPUnit / Pest |
| Build/run commands | `php artisan serve`, `php artisan test`, `./vendor/bin/pint` |
| Architecture dirs | `app/Http/Controllers/`, `app/Models/`, `app/Services/`, `database/migrations/` |

**spring-boot.md differences:**

| Aspect | Spring Boot value |
|---|---|
| Template path | `assets/templates/spring-boot/CLAUDE.md.tmpl` |
| Settings path | `assets/templates/spring-boot/settings.json.tmpl` |
| `{{PORT}}` default | 8080 (from `server.port` in application.properties) |
| `{{PACKAGE}}` | `pom.xml:<groupId>.<artifactId>` (extra token, Spring Boot only) |
| `{{TEST_FRAMEWORK}}` | JUnit 5 + Testcontainers |
| Build/run commands | `./mvnw spring-boot:run`, `./mvnw test`, `./mvnw spotless:apply` |
| Architecture dirs | `src/main/java/`, `src/main/resources/`, `src/test/java/` |

- [ ] **Step 1: Write laravel.md**

Write `plugins/harness/skills/harness-setup/bundles/laravel.md` using the same section structure as `nextjs.md` (Files to Generate → Generation Steps → Validate output), substituting Laravel-specific values from the table above.

Laravel `docs/ARCHITECTURE.md` skeleton must reference `app/Http/Controllers/`, `app/Models/`, `app/Services/`, `database/`.

- [ ] **Step 2: Write spring-boot.md**

Write `plugins/harness/skills/harness-setup/bundles/spring-boot.md` with Spring Boot values.

Spring Boot `docs/ARCHITECTURE.md` skeleton:
```markdown
## Project Structure

```
src/
  main/
    java/{{PACKAGE}}/
      controller/   ← REST controllers (@RestController)
      service/      ← Business logic (@Service)
      repository/   ← Data access (@Repository)
      model/        ← JPA entities (@Entity)
    resources/
      application.properties
  test/
    java/{{PACKAGE}}/   ← @SpringBootTest, @WebMvcTest, Testcontainers
```
```

- [ ] **Step 3: Check line counts**

```bash
wc -l plugins/harness/skills/harness-setup/bundles/laravel.md plugins/harness/skills/harness-setup/bundles/spring-boot.md
```

Expected: both < 500 lines.

- [ ] **Step 4: Commit**

```bash
git add plugins/harness/skills/harness-setup/bundles/
git commit -m "feat(harness): add Laravel and Spring Boot bundles"
```

---

## Task 6: harness-setup References

**Files:**
- Create: `plugins/harness/skills/harness-setup/references/stack-detection.md`
- Create: `plugins/harness/skills/harness-setup/references/phase-model.md`

- [ ] **Step 1: Write stack-detection.md**

```markdown
# Stack Detection Reference

> Loaded by bundles only when detection logic needs to be consulted.
> Never loaded automatically — only when explicitly referenced.

## Detection Priority Order

Run checks in this exact order. Stop at first match.

1. `pom.xml` exists → **Spring Boot**
2. `package.json` exists AND `dependencies.next` OR `devDependencies.next` is set → **Next.js**
3. `composer.json` exists → **Laravel**
4. `package.json` exists (no `next`) → **Node/generic**
5. None of the above → **Generic**

## Token Auto-Fill Sources

### PROJECT_NAME
1. `package.json` → `.name` field (strip `@scope/` prefix)
2. `pom.xml` → `<artifactId>` value
3. Current directory basename

### PORT
1. `package.json` → scan `scripts.dev` for `-p 3000` or `--port 3000` pattern
2. `application.properties` → `server.port=8080`
3. Stack default: Next.js=3000, Laravel=8000, Spring Boot=8080

### PKG_MANAGER
| Lockfile | Manager |
|---|---|
| `pnpm-lock.yaml` | pnpm |
| `yarn.lock` | yarn |
| `bun.lockb` | bun |
| `package-lock.json` | npm |
| None | npm (default) |

For Laravel: always `composer` for PHP packages + detect JS lockfile for frontend.

### DATABASE
| Dependency | Value |
|---|---|
| `drizzle-orm` in package.json | Drizzle |
| `@prisma/client` in package.json | Prisma |
| `spring-data-jpa` in pom.xml | Spring Data JPA |
| `illuminate/database` (always in Laravel) | Eloquent |
| None detected | "Not configured" |

### TEST_FRAMEWORK
| Dependency | Value |
|---|---|
| `jest` or `@jest/core` | Jest |
| `vitest` | Vitest |
| `phpunit/phpunit` | PHPUnit |
| `pestphp/pest` | Pest |
| `junit-jupiter-api` in pom.xml | JUnit 5 |
| None | "Not configured" |

## Edge Cases

**Monorepo:** If `package.json` exists at root but `apps/web/package.json` also exists with `next`, use the app-level detection. Ask user if ambiguous.

**Multiple stacks detected:** e.g., `pom.xml` + `package.json` with `next` → Spring Boot backend + Next.js frontend monorepo. Ask user which to generate harness for. Default: whichever is in current working directory.
```

- [ ] **Step 2: Write phase-model.md**

```markdown
# Phase Model Reference

> INTERNAL — Never expose phase numbers to users.
> Used by bundles to decide which features to include.

## What Phases Mean Internally

| Phase | Includes |
|---|---|
| 0 | CLAUDE.md only (< 60 lines) |
| 1 | CLAUDE.md + settings.json |
| 2 | CLAUDE.md + settings.json + 2 hooks + docs/ARCHITECTURE.md |
| 3 | All of 2 + sub-directory CLAUDE.md + ADR + full 7-layer security |

**MVP ships Phase 2 content for all users.** There is no user-visible "phase selection".

## Phase Detection from Project Signals

```python
def suggest_phase(signals):
    if signals["has_ci"] or signals["has_docker"]:
        return 3  # Production Hardened — suggest doctor for phase-3 upgrade
    if signals["has_env_example"] or signals["contributors"] > 1:
        return 2  # Team Foundation — our standard MVP output
    if signals["has_tests"]:
        return 1  # Solo Dev Serious — still output phase 2, it's a superset
    return 0      # Zero to Working — output phase 2 anyway

signals = {
    "has_tests":       any(Path(p).exists() for p in ["test/", "tests/", "src/test/"]),
    "has_env_example": Path(".env.example").exists(),
    "has_ci":          Path(".github/workflows/").exists(),
    "has_docker":      any(Path(p).exists() for p in ["Dockerfile", "docker-compose.yml"]),
    "contributors":    len(set(run("git log --format=%ae").split("\n"))),
}
```

MVP always generates Phase 2 content regardless of signal. Phase suggestion is used only by `harness-doctor` to suggest upgrades.

## Why Phase 3 is Excluded from MVP

Phase 3 requires:
- Sub-directory CLAUDE.md files (per module)
- Initial ADR generation ("Why [stack]")
- Full 7-layer security (MCP deny rules, CI workflow, git hooks)
- SCHEMA.md token documentation

This is v1.1 work. Phase 2 content covers 90% of solo indie hacker value.
```

- [ ] **Step 3: Check line counts**

```bash
wc -l plugins/harness/skills/harness-setup/references/stack-detection.md plugins/harness/skills/harness-setup/references/phase-model.md
```

Expected: both < 150 lines.

- [ ] **Step 4: Commit**

```bash
git add plugins/harness/skills/harness-setup/references/
git commit -m "feat(harness): add stack-detection and phase-model references"
```

---

## Task 7: Assets — CLAUDE.md Templates

**Files:**
- Create: `plugins/harness/skills/harness-setup/assets/templates/nextjs/CLAUDE.md.tmpl`
- Create: `plugins/harness/skills/harness-setup/assets/templates/laravel/CLAUDE.md.tmpl`
- Create: `plugins/harness/skills/harness-setup/assets/templates/spring-boot/CLAUDE.md.tmpl`

- [ ] **Step 1: Write nextjs/CLAUDE.md.tmpl**

```markdown
# CLAUDE.md

## Project
{{PROJECT_DESCRIPTION}}

**Stack:** Next.js 14+ App Router · TypeScript · Tailwind CSS
**Package manager:** {{PKG_MANAGER}}
**Database:** {{DATABASE}}
**Port:** {{PORT}}
**Last verified:** {{DATE}}

## Commands
```bash
{{PKG_MANAGER}} run dev      # Start dev server (http://localhost:{{PORT}})
{{PKG_MANAGER}} run build    # Production build
{{PKG_MANAGER}} run test     # Run {{TEST_FRAMEWORK}} tests
{{PKG_MANAGER}} run lint     # ESLint
{{PKG_MANAGER}} run format   # Prettier
```

## Architecture
```
src/app/           ← App Router pages + layouts + API routes
src/components/    ← Shared UI components (Server by default)
src/lib/           ← Utilities, configs, helpers, auth
src/db/            ← Database schema + client
src/types/         ← Shared TypeScript types
```

## Key Conventions
- Server Components by default. Add `"use client"` only when needed (event handlers, hooks)
- Validate at API boundaries with Zod
- No raw SQL — use {{DATABASE}} query builder
- Env vars accessed through `src/lib/env.ts` (typed, validated at startup)
- Component files < 200 lines — extract when larger{{#if CUSTOM_CONVENTIONS}}

## Project-Specific Conventions
{{CUSTOM_CONVENTIONS}}{{/if}}

## Boundaries
- API routes: `src/app/api/**` — never import server-only code in client components
- Auth: session checked in Server Components via `getServerSession()` — not in middleware
- Database: client initialized once in `src/db/index.ts` — never create multiple clients
```

- [ ] **Step 2: Write laravel/CLAUDE.md.tmpl**

```markdown
# CLAUDE.md

## Project
{{PROJECT_DESCRIPTION}}

**Stack:** Laravel · PHP · {{DATABASE}}
**Package manager:** composer (PHP) + {{PKG_MANAGER}} (frontend)
**Port:** {{PORT}}
**Tests:** {{TEST_FRAMEWORK}}
**Last verified:** {{DATE}}

## Commands
```bash
php artisan serve                    # Start dev server (http://localhost:{{PORT}})
php artisan test                     # Run {{TEST_FRAMEWORK}} tests
./vendor/bin/pint                    # Format (Laravel Pint)
php artisan migrate                  # Run migrations
php artisan migrate:rollback         # Rollback last migration
php artisan make:controller Foo      # Scaffold controller
php artisan make:model Foo -m        # Scaffold model + migration
```

## Architecture
```
app/
  Http/Controllers/   ← Request handling, thin logic
  Models/             ← Eloquent models
  Services/           ← Business logic (keep controllers thin)
  Repositories/       ← Data access abstraction (optional)
database/migrations/  ← Schema changes
resources/views/      ← Blade templates (or API responses)
routes/               ← web.php, api.php
tests/                ← Feature tests, Unit tests
```

## Key Conventions
- Services handle business logic — controllers call services, not models directly
- Validate with Form Requests, not inline in controllers
- Use Eloquent relationships — avoid raw SQL
- Test with {{TEST_FRAMEWORK}} against a real SQLite test database{{#if CUSTOM_CONVENTIONS}}

## Project-Specific Conventions
{{CUSTOM_CONVENTIONS}}{{/if}}

## Boundaries
- No business logic in controllers
- No queries in views
- Migrations are append-only — never edit an existing migration after it runs
```

- [ ] **Step 3: Write spring-boot/CLAUDE.md.tmpl**

```markdown
# CLAUDE.md

## Project
{{PROJECT_DESCRIPTION}}

**Stack:** Spring Boot · Java · {{DATABASE}}
**Package:** {{PACKAGE}}
**Port:** {{PORT}}
**Tests:** {{TEST_FRAMEWORK}}
**Last verified:** {{DATE}}

## Commands
```bash
./mvnw spring-boot:run               # Start dev server (http://localhost:{{PORT}})
./mvnw test                          # Run JUnit 5 tests
./mvnw spotless:apply                # Format (Google Java Format)
./mvnw verify                        # Full build + tests + checks
./mvnw dependency:tree               # Inspect dependency tree
```

## Architecture
```
src/main/java/{{PACKAGE}}/
  controller/   ← @RestController — HTTP handling only
  service/      ← @Service — business logic
  repository/   ← @Repository — Spring Data JPA interfaces
  model/        ← @Entity — JPA entities
  dto/          ← Request/response DTOs (no entities in API layer)
src/main/resources/
  application.properties
src/test/java/{{PACKAGE}}/
  controller/   ← @WebMvcTest — slice tests
  service/      ← @ExtendWith(MockitoExtension) — unit tests
  integration/  ← @SpringBootTest + Testcontainers
```

## Key Conventions
- @Valid on @RequestBody — always validate at controller boundary
- Return DTOs from controllers, never @Entity directly
- Repository methods should be interface declarations — no JPQL unless Spring Data is insufficient
- Testcontainers for integration tests — no H2 (different SQL dialect){{#if CUSTOM_CONVENTIONS}}

## Project-Specific Conventions
{{CUSTOM_CONVENTIONS}}{{/if}}

## Boundaries
- No business logic in controllers or repositories
- No @Entity objects in API responses — always map to DTO
- Transaction boundaries at @Service layer, not @Repository
```

- [ ] **Step 4: Verify no hard-coded secrets in templates**

```bash
grep -r "sk_\|re_\|AIza\|-----BEGIN\|password.*=.*[a-zA-Z0-9]" \
  plugins/harness/skills/harness-setup/assets/templates/ || echo "Clean"
```

Expected: `Clean`

- [ ] **Step 5: Commit**

```bash
git add plugins/harness/skills/harness-setup/assets/templates/
git commit -m "feat(harness): add CLAUDE.md templates for Next.js, Laravel, Spring Boot"
```

---

## Task 8: Assets — settings.json Templates

**Files:**
- Create: `plugins/harness/skills/harness-setup/assets/templates/nextjs/settings.json.tmpl`
- Create: `plugins/harness/skills/harness-setup/assets/templates/laravel/settings.json.tmpl`
- Create: `plugins/harness/skills/harness-setup/assets/templates/spring-boot/settings.json.tmpl`

> All three are nearly identical — only stack-specific allow rules differ.
> These fix the 3 bugs from the existing templates:
> (A) curl/npx not over-blocked, (B) docs/** overlap resolved, (C) hooks wired.

- [ ] **Step 1: Write nextjs/settings.json.tmpl**

```json
{
  "permissions": {
    "deny": [
      "Bash(rm -rf /)",
      "Bash(rm -rf ~)",
      "Bash(rm -rf /*)",
      "Bash(git push --force*)",
      "Bash(git push -f *)",
      "Bash(git reset --hard*)",
      "Bash(git commit*--no-verify*)",
      "Bash(:(){*|*&*}*)",
      "Bash(nc -e*)",
      "Bash(nc -c*)",
      "Bash(*| bash)",
      "Bash(*|bash)",
      "Bash(*| sh)",
      "Bash(*|sh)",
      "Bash(base64 --decode*)",
      "Bash(base64 -d *)",
      "Bash(eval *)",
      "Bash(python* -c *)",
      "Bash(node -e *)",
      "Bash(npm publish*)"
    ],
    "allow": [
      "Bash(npm run *)",
      "Bash(npx prisma *)",
      "Bash(npx drizzle-kit *)",
      "Bash(npx shadcn*)",
      "Write(docs/decisions/DECISION-LOG.md)"
    ],
    "ask": [
      "Bash(npm install *)",
      "Bash(npm install)",
      "Bash(yarn add *)",
      "Bash(pnpm add *)",
      "Bash(bun add *)",
      "Bash(curl *)",
      "Write(docs/**)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "python3 .claude/hooks/validate-command.py"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "python3 .claude/hooks/protect-files.py"
          }
        ]
      }
    ]
  }
}
```

- [ ] **Step 2: Write laravel/settings.json.tmpl**

Same as nextjs template, but replace the `allow` block with Laravel-specific tooling:

```json
"allow": [
  "Bash(php artisan *)",
  "Bash(composer require *)",
  "Bash(composer install)",
  "Bash(./vendor/bin/pint)",
  "Bash(./vendor/bin/pest *)",
  "Write(docs/decisions/DECISION-LOG.md)"
],
"ask": [
  "Bash(composer require *)",
  "Bash(npm install *)",
  "Bash(curl *)",
  "Write(docs/**)"
]
```

- [ ] **Step 3: Write spring-boot/settings.json.tmpl**

Same base, replace allow/ask with Spring Boot tooling:

```json
"allow": [
  "Bash(./mvnw *)",
  "Bash(mvn *)",
  "Write(docs/decisions/DECISION-LOG.md)"
],
"ask": [
  "Bash(curl *)",
  "Write(docs/**)"
]
```

- [ ] **Step 4: Validate JSON syntax**

```bash
python3 -m json.tool plugins/harness/skills/harness-setup/assets/templates/nextjs/settings.json.tmpl > /dev/null && echo "nextjs: valid"
python3 -m json.tool plugins/harness/skills/harness-setup/assets/templates/laravel/settings.json.tmpl > /dev/null && echo "laravel: valid"
python3 -m json.tool plugins/harness/skills/harness-setup/assets/templates/spring-boot/settings.json.tmpl > /dev/null && echo "spring-boot: valid"
```

Expected: all 3 print `valid`.

- [ ] **Step 5: Commit**

```bash
git add plugins/harness/skills/harness-setup/assets/templates/
git commit -m "feat(harness): add settings.json templates with fixed permission rules"
```

---

## Task 9: Assets — User-Facing Safety Hooks

**Files:**
- Create: `plugins/harness/skills/harness-setup/assets/hooks/validate-command.py`
- Create: `plugins/harness/skills/harness-setup/assets/hooks/protect-files.py`

> These are generated INTO the user's project — different from .claude/hooks/ (dev-time).

- [ ] **Step 1: Write assets/hooks/validate-command.py**

```python
#!/usr/bin/env python3
"""PreToolUse hook: Block dangerous bash commands. Exit 2 to hard-block."""
import json, re, sys

BLOCKED = [
    (r"rm\s+-rf\s+[/~]", "Blocked: recursive delete at root/home"),
    (r"DROP\s+(DATABASE|TABLE)", "Blocked: destructive SQL"),
    (r":(\s*)\(\s*\)\s*\{.*\|.*&", "Blocked: fork bomb"),
    (r"\bdd\s+if=", "Blocked: raw disk access"),
    (r"git\s+push\s+(--force|-f)\b", "Blocked: force push"),
    (r"git\s+reset\s+--hard", "Blocked: hard reset"),
    (r"git\s+(commit|push)\s+.*--no-verify", "Blocked: skipping git hooks"),
    (r"curl[^|]*\|\s*(bash|sh|zsh)", "Blocked: curl pipe to shell"),
    (r"wget[^|]*\|\s*(bash|sh|zsh)", "Blocked: wget pipe to shell"),
    (r"\bnc\s+(-e|-c|--exec)", "Blocked: netcat shell"),
    (r"base64\s+(--decode|-d)\s", "Blocked: base64 decode (obfuscation risk)"),
    (r"\beval\s*\(", "Blocked: eval() execution"),
    (r"python[23]?\s+-c\s+['\"]", "Blocked: inline Python execution"),
    (r"node\s+-e\s+['\"]", "Blocked: inline Node.js execution"),
    (r"npm\s+publish\b", "Blocked: npm publish (use CI)"),
    (r"chmod\s+777", "Blocked: world-writable permissions"),
    (r"cat\s+/etc/(passwd|shadow)", "Blocked: reading system files"),
]

def main():
    try:
        data = json.load(sys.stdin)
    except Exception:
        sys.exit(0)

    if data.get("tool_name") != "Bash":
        sys.exit(0)

    command = data.get("tool_input", {}).get("command", "")

    for pattern, reason in BLOCKED:
        if re.search(pattern, command, re.IGNORECASE):
            print(f"🚫 {reason}", file=sys.stderr)
            print(f"   Command: {command[:120]}", file=sys.stderr)
            sys.exit(2)

    sys.exit(0)

if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Write assets/hooks/protect-files.py**

```python
#!/usr/bin/env python3
"""PostToolUse hook: Warn on writes to sensitive files. Exit 2 to hard-block secrets."""
import json, re, sys
from pathlib import Path

HARD_BLOCK = [
    r"\.env$",
    r"\.env\.production$",
    r"\.env\.staging$",
    r".*\.pem$",
    r".*\.key$",
    r".*id_rsa$",
    r".*id_ed25519$",
]

WARN = [
    r"\.claude/settings\.json$",
    r"CLAUDE\.md$",
    r"\.gitignore$",
    r"package\.json$",
    r"composer\.json$",
    r"pom\.xml$",
]

def main():
    try:
        data = json.load(sys.stdin)
    except Exception:
        sys.exit(0)

    tool = data.get("tool_name", "")
    if tool not in ("Write", "Edit"):
        sys.exit(0)

    file_path = data.get("tool_input", {}).get("file_path", "")

    for pattern in HARD_BLOCK:
        if re.search(pattern, file_path):
            print(f"🚫 Blocked: writing to protected file: {file_path}", file=sys.stderr)
            print("   Reason: secrets/key files must never be committed.", file=sys.stderr)
            sys.exit(2)

    for pattern in WARN:
        if re.search(pattern, file_path):
            print(f"⚠️  Warning: modifying sensitive config: {file_path}", file=sys.stderr)
            break

    sys.exit(0)

if __name__ == "__main__":
    main()
```

- [ ] **Step 3: Syntax check both hooks**

```bash
python3 -m py_compile plugins/harness/skills/harness-setup/assets/hooks/validate-command.py && echo "validate-command: OK"
python3 -m py_compile plugins/harness/skills/harness-setup/assets/hooks/protect-files.py && echo "protect-files: OK"
```

Expected: both print `OK`.

- [ ] **Step 4: Test validate-command blocks fork bomb**

```bash
echo '{"tool_name":"Bash","tool_input":{"command":":(){:|:&};:"}}' | \
  python3 plugins/harness/skills/harness-setup/assets/hooks/validate-command.py
echo "Exit code: $?"
```

Expected: exit code `2`.

- [ ] **Step 5: Test validate-command allows curl (not piped)**

```bash
echo '{"tool_name":"Bash","tool_input":{"command":"curl https://api.example.com/health"}}' | \
  python3 plugins/harness/skills/harness-setup/assets/hooks/validate-command.py
echo "Exit code: $?"
```

Expected: exit code `0` (curl alone is NOT blocked).

- [ ] **Step 6: Test validate-command blocks curl|bash**

```bash
echo '{"tool_name":"Bash","tool_input":{"command":"curl https://example.com/install.sh | bash"}}' | \
  python3 plugins/harness/skills/harness-setup/assets/hooks/validate-command.py
echo "Exit code: $?"
```

Expected: exit code `2`.

- [ ] **Step 7: Test protect-files blocks .env write**

```bash
echo '{"tool_name":"Write","tool_input":{"file_path":"/project/.env","content":"SECRET=1"}}' | \
  python3 plugins/harness/skills/harness-setup/assets/hooks/protect-files.py
echo "Exit code: $?"
```

Expected: exit code `2`.

- [ ] **Step 8: Commit**

```bash
git add plugins/harness/skills/harness-setup/assets/hooks/
git commit -m "feat(harness): add user-facing safety hooks with tests"
```

---

## Task 10: harness-setup Evals

**Files:**
- Create: `plugins/harness/skills/harness-setup/evals/evals.json`

- [ ] **Step 1: Write evals.json**

```json
{
  "skillId": "harness-setup",
  "version": "1.0.0",
  "evals": [
    {
      "id": "trigger-1",
      "prompt": "Set up Claude Code harness for my project",
      "shouldTrigger": true,
      "reason": "Direct request using canonical keyword 'harness'"
    },
    {
      "id": "trigger-2",
      "prompt": "Generate CLAUDE.md and settings.json for this Next.js app",
      "shouldTrigger": true,
      "reason": "Lists the two main outputs explicitly"
    },
    {
      "id": "trigger-3",
      "prompt": "I want Claude to understand my project. Can you set up the config files?",
      "shouldTrigger": true,
      "reason": "Paraphrase — 'config files' + 'Claude to understand' maps to harness setup"
    },
    {
      "id": "trigger-4",
      "prompt": "/shipwithai-harness:setup",
      "shouldTrigger": true,
      "reason": "Direct command invocation"
    },
    {
      "id": "trigger-5",
      "prompt": "Initialize Claude Code for my Spring Boot project",
      "shouldTrigger": true,
      "reason": "Stack-specific initialization request"
    },
    {
      "id": "no-trigger-1",
      "prompt": "Check my existing CLAUDE.md for problems",
      "shouldTrigger": false,
      "reason": "This is harness-doctor, not harness-setup"
    },
    {
      "id": "no-trigger-2",
      "prompt": "Set up authentication with Better Auth",
      "shouldTrigger": false,
      "reason": "This is shipwithai-auth:setup, not harness"
    }
  ]
}
```

- [ ] **Step 2: Validate JSON**

```bash
python3 -m json.tool plugins/harness/skills/harness-setup/evals/evals.json > /dev/null && echo "Valid JSON"
```

Expected: `Valid JSON`

- [ ] **Step 3: Verify eval counts**

```bash
python3 -c "
import json
data = json.load(open('plugins/harness/skills/harness-setup/evals/evals.json'))
evals = data['evals']
triggers = [e for e in evals if e['shouldTrigger']]
no_triggers = [e for e in evals if not e['shouldTrigger']]
print(f'Total: {len(evals)} (triggers: {len(triggers)}, no-triggers: {len(no_triggers)})')
assert len(evals) >= 5, 'Need at least 5 evals'
assert len(triggers) >= 3, 'Need at least 3 trigger evals'
assert len(no_triggers) >= 2, 'Need at least 2 no-trigger evals'
print('PASS')
"
```

Expected: `PASS`

- [ ] **Step 4: Commit**

```bash
git add plugins/harness/skills/harness-setup/evals/
git commit -m "feat(harness): add harness-setup evals (5 prompts, 3 trigger + 2 no-trigger)"
```

---

## Task 11: harness-doctor SKILL.md

**Files:**
- Create: `plugins/harness/skills/harness-doctor/SKILL.md`
- Create: `plugins/harness/skills/harness-doctor/references/doctor-checks.md`

- [ ] **Step 1: Write harness-doctor SKILL.md**

```markdown
---
name: harness-doctor
description: "Diagnose and fix your Claude Code harness. Scans CLAUDE.md, settings.json, hooks health, and stack consistency. Produces scored report. Run /shipwithai-harness:doctor"
version: 1.0.0
license: MIT
---

# Harness Doctor

Diagnostic tool for existing Claude Code harness setups. Detects missing files, misconfigured permissions, broken hook wiring, and stack mismatches. Produces a scored health report with actionable fixes.

## When to Use

- After running `harness-setup` — final validation
- Harness seems to not be working (Claude ignoring CLAUDE.md or hooks)
- After moving a project or cloning a repo — check hooks are executable
- Periodic health check

## Step 1: Detect Stack (SILENT)

Run same detection as `harness-setup` Step 0. Same token auto-fill logic.

Show scan summary before proceeding:

```
🔍 Harness Doctor — Scanning project...

Stack:    Next.js (Next.js 14.2.18)
Detected: CLAUDE.md ✓  settings.json ✓  hooks/ ✓
```

## Step 2: Run Diagnostic Checks

Run all 4 categories unless `$ARGUMENTS` specifies one. Read `references/doctor-checks.md` for full check details per category.

| Category | Key checks |
|---|---|
| **Memory** | CLAUDE.md exists, < 200 lines, no unfilled {{TOKEN}}, Last verified < 30 days old |
| **Permission** | .claude/settings.json exists, valid JSON, has deny block, curl/npx not hard-denied |
| **Hooks** | validate-command.py + protect-files.py exist, executable, wired in settings.json |
| **Stack** | detected stack matches CLAUDE.md stack line, commands exist in project |

## Step 3: Health Report

```
╔══════════════════════════════════════════════════╗
║        🛡️ Harness Doctor — Health Report          ║
╠══════════════════════════════════════════════════╣
║ Stack:   Next.js                                 ║
║ Score:   11/12 checks passed                     ║
╚══════════════════════════════════════════════════╝

Category          Status    Issues
──────────────────────────────────
1. Memory           ✅       0
2. Permission       ⚠️        1 warning
3. Hooks            ❌       1 critical
4. Stack            ✅       0

──── CRITICAL ────────────────────

❌ .claude/hooks/validate-command.py not executable
   Fix: chmod +x .claude/hooks/validate-command.py

──── WARNINGS ────────────────────

⚠️  CLAUDE.md Last verified: 2026-01-15 (114 days ago)
   Recommendation: Review and update to reflect current project state
```

## Step 4: Offer to Fix

```
Found 1 critical, 1 warning.

A) Fix all — apply all safe fixes automatically
B) Fix critical only
C) Show me the fixes first
D) Skip
```

Safe auto-fixes (no user confirmation needed):
- `chmod +x` on hooks
- JSON formatting fixes in settings.json

Always ask before:
- Modifying CLAUDE.md content
- Changing settings.json deny/allow rules
```

- [ ] **Step 2: Write references/doctor-checks.md**

```markdown
# Harness Doctor — Check Reference

> Loaded by harness-doctor Step 2 only.

## Category 1: Memory Checks

| Check | Pass condition | Severity |
|---|---|---|
| CLAUDE.md exists | File present at project root | CRITICAL |
| CLAUDE.md line count | ≤ 200 lines | WARNING |
| No unfilled tokens | `grep -c '{{'` CLAUDE.md = 0 | CRITICAL |
| Last verified date | < 90 days old (parse `Last verified:` line) | WARNING |
| docs/ARCHITECTURE.md exists | File present | WARNING |

## Category 2: Permission Checks

| Check | Pass condition | Severity |
|---|---|---|
| .claude/settings.json exists | File at `.claude/settings.json` | CRITICAL |
| Valid JSON | `python3 -m json.tool` succeeds | CRITICAL |
| Has deny block | `permissions.deny` array present + non-empty | WARNING |
| curl not hard-denied | `deny` array does NOT contain `Bash(curl *)` | WARNING |
| npx not hard-denied | `deny` array does NOT contain `Bash(npx *)` | WARNING |
| docs/** conflict | `allow` has specific docs path AND `ask` has `docs/**` — flag overlap | WARNING |

## Category 3: Hooks Checks

| Check | Pass condition | Severity |
|---|---|---|
| validate-command.py exists | `.claude/hooks/validate-command.py` present | CRITICAL |
| protect-files.py exists | `.claude/hooks/protect-files.py` present | CRITICAL |
| validate-command.py executable | `os.access(..., os.X_OK)` = True | CRITICAL |
| protect-files.py executable | `os.access(..., os.X_OK)` = True | CRITICAL |
| Hooks wired in settings.json | `hooks.PreToolUse` contains validate-command.py | CRITICAL |
| PostToolUse wired | `hooks.PostToolUse` contains protect-files.py | WARNING |

## Category 4: Stack Consistency Checks

| Check | Pass condition | Severity |
|---|---|---|
| Stack line in CLAUDE.md | `**Stack:**` line present | WARNING |
| Detected stack matches | CLAUDE.md stack keyword matches file-based detection | WARNING |
| Commands exist in project | `scripts.dev` in package.json / `./mvnw` exists / `artisan` exists | WARNING |

## Fix Reference

| Issue | Safe auto-fix |
|---|---|
| Hook not executable | `chmod +x .claude/hooks/*.py` |
| JSON syntax error | Show diff, ask before applying |
| Missing hooks | Copy from harness-setup assets |
| docs/** conflict | Remove `ask Write(docs/**)` if `allow Write(docs/decisions/DECISION-LOG.md)` exists |
```

- [ ] **Step 3: Check line counts**

```bash
wc -l plugins/harness/skills/harness-doctor/SKILL.md plugins/harness/skills/harness-doctor/references/doctor-checks.md
```

Expected: SKILL.md < 200, doctor-checks.md < 150.

- [ ] **Step 4: Commit**

```bash
git add plugins/harness/skills/harness-doctor/
git commit -m "feat(harness): add harness-doctor skill and doctor-checks reference"
```

---

## Task 12: harness-doctor Evals

**Files:**
- Create: `plugins/harness/skills/harness-doctor/evals/evals.json`

- [ ] **Step 1: Write evals.json**

```json
{
  "skillId": "harness-doctor",
  "version": "1.0.0",
  "evals": [
    {
      "id": "trigger-1",
      "prompt": "Check my Claude Code harness health",
      "shouldTrigger": true,
      "reason": "Direct request for health check using 'harness'"
    },
    {
      "id": "trigger-2",
      "prompt": "Something is wrong with my CLAUDE.md or hooks, can you diagnose?",
      "shouldTrigger": true,
      "reason": "Diagnose keyword + mentions harness components"
    },
    {
      "id": "trigger-3",
      "prompt": "/shipwithai-harness:doctor",
      "shouldTrigger": true,
      "reason": "Direct command invocation"
    },
    {
      "id": "trigger-4",
      "prompt": "Are my Claude hooks configured correctly?",
      "shouldTrigger": true,
      "reason": "Hooks health check = harness-doctor"
    },
    {
      "id": "trigger-5",
      "prompt": "Validate my project's Claude Code setup",
      "shouldTrigger": true,
      "reason": "Validate existing setup = doctor, not setup"
    },
    {
      "id": "no-trigger-1",
      "prompt": "Set up Claude Code for my project",
      "shouldTrigger": false,
      "reason": "This is harness-setup (new setup), not doctor (diagnose existing)"
    },
    {
      "id": "no-trigger-2",
      "prompt": "Check my auth configuration for errors",
      "shouldTrigger": false,
      "reason": "Auth check = shipwithai-auth:doctor, not harness-doctor"
    }
  ]
}
```

- [ ] **Step 2: Validate**

```bash
python3 -c "
import json
data = json.load(open('plugins/harness/skills/harness-doctor/evals/evals.json'))
evals = data['evals']
triggers = [e for e in evals if e['shouldTrigger']]
no_triggers = [e for e in evals if not e['shouldTrigger']]
assert len(evals) >= 5 and len(triggers) >= 3 and len(no_triggers) >= 2
print(f'PASS: {len(evals)} evals, {len(triggers)} trigger, {len(no_triggers)} no-trigger')
"
```

Expected: `PASS`

- [ ] **Step 3: Commit**

```bash
git add plugins/harness/skills/harness-doctor/evals/
git commit -m "feat(harness): add harness-doctor evals"
```

---

## Task 13: Commands + README

**Files:**
- Create: `plugins/harness/commands/setup.md`
- Create: `plugins/harness/commands/doctor.md`
- Create: `plugins/harness/README.md`

- [ ] **Step 1: Write commands/setup.md**

```markdown
---
description: "Generate a Claude Code harness for your project. Auto-detects stack, generates CLAUDE.md, settings.json, and safety hooks."
argument-hint: "[stack] (nextjs | laravel | spring-boot — optional, auto-detected)"
---

# Harness Setup

You are a Claude Code harness engineer. Set up a production-ready harness for the user's project.

**BEFORE ANYTHING ELSE:** Read `skills/harness-setup/SKILL.md` for the full detection framework and generation instructions.

Run the full harness-setup workflow: detect stack → ask 2 questions → generate files → validate output.
```

- [ ] **Step 2: Write commands/doctor.md**

```markdown
---
description: "Diagnose and fix your Claude Code harness. Scans CLAUDE.md, settings.json, hooks health, stack consistency."
argument-hint: "[category] (memory | permission | hooks | stack — optional, runs all if omitted)"
---

# Harness Doctor

You are a Claude Code harness diagnostician. Analyze the user's existing harness and produce a health report.

**BEFORE ANYTHING ELSE:** Read `skills/harness-doctor/SKILL.md` for the full diagnostic workflow.

Run the full doctor workflow: detect stack → run 4 check categories → produce scored report → offer fixes.
```

- [ ] **Step 3: Write README.md**

```markdown
# shipwithai-harness

Generate a production-ready Claude Code harness for your project in under 2 minutes.

## What It Does

Scans your project, detects the tech stack, and generates:

- **`CLAUDE.md`** — Filled with your project's description, commands, architecture, and conventions
- **`.claude/settings.json`** — Balanced permission rules (deny dangerous, ask before install, allow dev tools)
- **`.claude/hooks/validate-command.py`** — Blocks fork bombs, curl|bash, force push, and other dangerous patterns
- **`.claude/hooks/protect-files.py`** — Hard-blocks writes to `.env`, `.pem`, `.key` files
- **`docs/ARCHITECTURE.md`** — Architecture skeleton for your stack

## Supported Stacks

| Stack | Detection |
|---|---|
| Next.js | `package.json` with `next` dependency |
| Laravel | `composer.json` |
| Spring Boot | `pom.xml` |

## Install

```bash
/plugin install shipwithai-harness@shipwithai
```

## Usage

```bash
/shipwithai-harness:setup    # Generate harness for current project
/shipwithai-harness:doctor   # Diagnose existing harness health
```

## What It Asks You

Only 2 things:
1. Describe your project in one sentence
2. Any custom conventions? (optional)

Everything else is auto-detected from your project files.
```

- [ ] **Step 4: Verify README exists and reads well**

```bash
wc -l plugins/harness/README.md && head -5 plugins/harness/README.md
```

- [ ] **Step 5: Commit**

```bash
git add plugins/harness/commands/ plugins/harness/README.md
git commit -m "feat(harness): add commands and README"
```

---

## Task 14: Copy Dev-Time Hooks for Contributors

**Files:**
- Modify: `plugins/harness/.claude/hooks/validate-command.py` (already scaffolded from auth — verify content is correct)
- Modify: `plugins/harness/.claude/hooks/protect-files.py` (same)
- Modify: `plugins/harness/.claude/settings.json` (dev-time rules for contributors)

- [ ] **Step 1: Verify dev hooks are present (scaffolded from auth)**

```bash
ls -la plugins/harness/.claude/hooks/
```

Expected: `validate-command.py` and `protect-files.py` present.

- [ ] **Step 2: Verify dev settings.json blocks npm publish**

```bash
grep "npm.*publish" plugins/harness/.claude/settings.json
```

Expected: `"Bash(npm publish*)"` appears in deny list.

- [ ] **Step 3: Commit if any changes needed**

```bash
git add plugins/harness/.claude/
git commit -m "feat(harness): verify dev-time hooks and settings for contributors"
```

---

## Task 15: Quality Gate

- [ ] **Step 1: Check all line count limits**

```bash
echo "=== SKILL.md line counts (limit: 200) ===" && \
wc -l plugins/harness/skills/*/SKILL.md && \
echo "=== Bundle line counts (limit: 500) ===" && \
wc -l plugins/harness/skills/harness-setup/bundles/*.md && \
echo "=== Reference line counts (limit: 150) ===" && \
wc -l plugins/harness/skills/*/references/*.md
```

Expected: SKILL.md files < 200, bundles < 500, references < 150.

- [ ] **Step 2: Validate all JSON files**

```bash
for f in $(find plugins/harness -name "*.json" | grep -v node_modules); do
  python3 -m json.tool "$f" > /dev/null && echo "✅ $f" || echo "❌ $f"
done
```

Expected: all `✅`.

- [ ] **Step 3: Check no hardcoded secrets**

```bash
grep -rn "sk_live\|sk_test\|re_[a-zA-Z0-9]\|AIza\|-----BEGIN\|password.*=.*[a-zA-Z0-9]" \
  plugins/harness/ --include="*.md" --include="*.json" --include="*.py" \
  --exclude-dir=".git" || echo "Clean"
```

Expected: `Clean`

- [ ] **Step 4: Verify eval counts across all skills**

```bash
python3 -c "
import json, pathlib
for p in pathlib.Path('plugins/harness/skills').glob('*/evals/evals.json'):
    data = json.loads(p.read_text())
    evals = data['evals']
    t = sum(1 for e in evals if e['shouldTrigger'])
    n = sum(1 for e in evals if not e['shouldTrigger'])
    status = 'PASS' if len(evals)>=5 and t>=3 and n>=2 else 'FAIL'
    print(f'{status}: {p.parent.parent.name} — {len(evals)} evals ({t} trigger, {n} no-trigger)')
"
```

Expected: all `PASS`.

- [ ] **Step 5: Verify plugin.json and marketplace.json version match**

```bash
python3 -c "
import json
p = json.load(open('plugins/harness/.claude-plugin/plugin.json'))
m = json.load(open('plugins/harness/.claude-plugin/marketplace.json'))
assert p['version'] == m['version'], f'Version mismatch: {p[\"version\"]} vs {m[\"version\"]}'
print(f'PASS: both at v{p[\"version\"]}')
"
```

Expected: `PASS`.

- [ ] **Step 6: Final commit**

```bash
git add plugins/harness
git commit -m "feat(harness): v1.0.0 complete — harness-setup + harness-doctor for Next.js, Laravel, Spring Boot"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Layer 1 Memory: CLAUDE.md templates (Task 7) + docs/ARCHITECTURE.md (Task 4)
- ✅ Layer 3 Permission: settings.json templates (Task 8) — curl/npx bugs fixed
- ✅ Layer 4 Hooks partial: validate-command.py + protect-files.py (Task 9) — wired in settings.json
- ✅ Stack detection: Next.js, Laravel, Spring Boot (Task 3 + references Task 6)
- ✅ Token auto-fill: documented in stack-detection.md (Task 6)
- ✅ UX: only 2 questions (Task 3 SKILL.md)
- ✅ Phase numbers internal only (Task 3 SKILL.md + phase-model.md)
- ✅ harness-doctor: scan → score → report → fix (Task 11)
- ✅ Evals: both skills have ≥5 prompts, ≥3 trigger, ≥2 no-trigger (Tasks 10, 12)
- ✅ Quality limits: all checks in Task 15

**Layer 2 (Tools) and Layer 5 (Observability) intentionally deferred to v1.1.**
