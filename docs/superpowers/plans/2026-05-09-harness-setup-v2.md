# harness-setup v2.0 — Intelligence-Based Redesign

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the template-engine (detect stack → fill tokens) with an analysis-driven approach (deep scan → synthesize → write from scratch), so any stack works and output reflects the actual project.

**Architecture:** SKILL.md becomes an analysis orchestrator: run parallel reads on root config files + directory glob + source samples, synthesize findings, then write all harness files from scratch. Two new references guide the scan (`analysis-guide.md`) and settings customization (`toolchain-rules.md`). A single `base-settings.json` replaces 4 stack-specific templates. The 4 bundle files and 8 template files are deleted — they are no longer needed.

**Tech Stack:** Markdown (skill files), JSON (settings, evals). No compiled code.

---

## File Map

**Rewrite:**
- `plugins/harness/skills/harness-setup/SKILL.md`

**Create:**
- `plugins/harness/skills/harness-setup/references/analysis-guide.md`
- `plugins/harness/skills/harness-setup/references/toolchain-rules.md`
- `plugins/harness/skills/harness-setup/assets/base-settings.json`

**Delete:**
- `plugins/harness/skills/harness-setup/bundles/nextjs.md`
- `plugins/harness/skills/harness-setup/bundles/laravel.md`
- `plugins/harness/skills/harness-setup/bundles/spring-boot.md`
- `plugins/harness/skills/harness-setup/bundles/fastapi.md`
- `plugins/harness/skills/harness-setup/assets/templates/nextjs/CLAUDE.md.tmpl`
- `plugins/harness/skills/harness-setup/assets/templates/nextjs/settings.json.tmpl`
- `plugins/harness/skills/harness-setup/assets/templates/laravel/CLAUDE.md.tmpl`
- `plugins/harness/skills/harness-setup/assets/templates/laravel/settings.json.tmpl`
- `plugins/harness/skills/harness-setup/assets/templates/spring-boot/CLAUDE.md.tmpl`
- `plugins/harness/skills/harness-setup/assets/templates/spring-boot/settings.json.tmpl`
- `plugins/harness/skills/harness-setup/assets/templates/fastapi/CLAUDE.md.tmpl`
- `plugins/harness/skills/harness-setup/assets/templates/fastapi/settings.json.tmpl`
- `plugins/harness/skills/harness-setup/references/stack-detection.md` (absorbed into analysis-guide.md)

**Update:**
- `plugins/harness/skills/harness-setup/evals/evals.json` — add any-stack prompts, bump version
- `plugins/harness/CHANGELOG.md`
- `plugins/harness/.claude-plugin/plugin.json`

---

## Task 1: Rewrite SKILL.md

**Files:**
- Modify: `plugins/harness/skills/harness-setup/SKILL.md`

- [ ] **Step 1: Read the current SKILL.md**

```bash
cat plugins/harness/skills/harness-setup/SKILL.md
```

- [ ] **Step 2: Overwrite with the new analysis-driven content**

Write the following to `plugins/harness/skills/harness-setup/SKILL.md` exactly:

```markdown
---
name: harness-setup
description: "Generate a Claude Code harness for any project. Scans your actual code to create tailored CLAUDE.md, settings.json, and safety hooks. Run /shipwithai-harness:setup"
version: 2.0.0
license: MIT
---

# Harness Setup

Analyze your project and generate a production-ready Claude Code harness.
Works for **any stack** — reads your actual code instead of filling templates.

## When to Use

- Project missing a CLAUDE.md, or existing one is generic/outdated
- Need settings.json with balanced permission rules
- Want validate-command.py + protect-files.py safety hooks

## Step 0: Check for Existing CLAUDE.md

If `CLAUDE.md` exists and has content:

Ask: "Found existing CLAUDE.md. **Overwrite** with new harness, or **skip**?"
- Skip → stop
- Overwrite → continue

## Step 1: Deep Project Scan (parallel reads)

Read `references/analysis-guide.md` for extraction instructions. Then run all reads **simultaneously**.

**Read whichever of these exist:**
- Root config files: `package.json`, `pom.xml`, `pyproject.toml`, `go.mod`, `Cargo.toml`,
  `composer.json`, `Gemfile`, `build.gradle`
- `Makefile` (if exists)
- `.env.example` (if exists)
- Directory structure: glob `**` to depth 2
- One representative source file (entry point or a typical service/controller)
- One test file (look in `tests/`, `test/`, `spec/`, `src/test/`, `__tests__/`)

**After reading, extract answers to:**

| Question | Source |
|---|---|
| Stack | Config files + deps (see analysis-guide.md §Stack Identification) |
| Run/build/test/lint commands | `scripts` in package.json, Makefile targets, pom.xml goals |
| Directory structure | Glob result — top 3–5 meaningful dirs |
| ORM/database | Deps + schema file location |
| Env vars needed | `.env.example` or grep `process.env.`/`os.getenv(` in source |
| Test framework + location | Test file imports + directory name |
| Package manager | Lockfile presence: `bun.lockb`→bun, `pnpm-lock.yaml`→pnpm, `yarn.lock`→yarn, else npm |
| Port | Dev script, `application.properties:server.port`, or stack default |

**Show summary before asking questions:**

```
🔍 Scan complete

Stack:     Go (Gin framework)
Commands:  run: go run ./cmd/... | test: go test ./... | lint: golangci-lint run
Structure: cmd/, internal/, pkg/, migrations/
Database:  GORM — models in internal/models/
Tests:     Go testing (testify) in *_test.go files
Port:      8080
Env vars:  DATABASE_URL, JWT_SECRET, PORT
```

## Step 2: Ask 2 Questions

**Q1 (required):** "Describe your project in one sentence."

**Q2 (optional):** "Any conventions Claude should follow that aren't visible in the code?
Leave blank to skip."

## Step 3: Generate Harness Files

**Write all content from your scan findings. Do not use templates.**

### 3a. CLAUDE.md

Write from scratch using what you found. Include only verified facts:
- **Header:** project name (from config or dirname), description (Q1 answer), stack, date
- **Commands:** exact commands found — never assume defaults
- **Architecture:** actual directory names with one-line descriptions
- **Database:** ORM name + schema file path (omit if none detected)
- **Environment:** env var names from .env.example or source scan (omit if none found)
- **Conventions:** Q2 answer (omit entire section if Q2 was left blank)

**Hard cap: 200 lines. Zero unfilled placeholders.**

### 3b. .claude/settings.json

1. Read `assets/base-settings.json`
2. Read `references/toolchain-rules.md` — add the rows that match your scan findings
3. Merge and write to `.claude/settings.json`

### 3c. Safety hooks

```bash
mkdir -p .claude/hooks
```

Copy `assets/hooks/validate-command.py` → `.claude/hooks/validate-command.py`
Copy `assets/hooks/protect-files.py` → `.claude/hooks/protect-files.py`

```bash
chmod +x .claude/hooks/validate-command.py .claude/hooks/protect-files.py
```

### 3d. docs/ARCHITECTURE.md

Write from scan findings (30–50 lines):
- Stack + key dependency versions detected
- Directory map with one-line descriptions per dir
- Entry point(s)
- Data layer summary

## Step 4: Validate and Show Output

```bash
grep -c '{{' CLAUDE.md || true   # Must be 0 — no unfilled placeholders
wc -l CLAUDE.md                   # Must be ≤ 200
ls -la .claude/hooks/             # Must show -rwxr-xr-x for both .py files
```

Show:

```
✅ Harness generated

Files created:
  CLAUDE.md               ← tailored to your project
  .claude/settings.json   ← customized for your toolchain
  .claude/hooks/validate-command.py
  .claude/hooks/protect-files.py
  docs/ARCHITECTURE.md    ← architecture snapshot

Run /shipwithai-harness:doctor to verify health
```
```

- [ ] **Step 3: Verify line count**

```bash
wc -l plugins/harness/skills/harness-setup/SKILL.md
```
Expected: ≤ 200 lines.

- [ ] **Step 4: Commit**

```bash
git add plugins/harness/skills/harness-setup/SKILL.md
git commit -m "feat(harness): rewrite SKILL.md — analysis-driven v2.0, any-stack support"
```

---

## Task 2: Create analysis-guide.md

**Files:**
- Create: `plugins/harness/skills/harness-setup/references/analysis-guide.md`

- [ ] **Step 1: Write the file**

Create `plugins/harness/skills/harness-setup/references/analysis-guide.md` with this content:

```markdown
# Analysis Guide

> Read by SKILL.md Step 1 before scanning, and Step 3a when writing CLAUDE.md.

## Stack Identification

Stop at first match. For multiple matches, ask the user which is primary.

| Signal | Stack |
|---|---|
| `pom.xml` | Spring Boot |
| `package.json` + `"next"` in deps | Next.js |
| `package.json` (no `"next"`) | Node.js / generic JS |
| `composer.json` | Laravel |
| `pyproject.toml` or `requirements.txt` + `fastapi` | FastAPI |
| `pyproject.toml` or `requirements.txt` + `django` | Django |
| `pyproject.toml` or `requirements.txt` + `flask` | Flask |
| `go.mod` | Go |
| `Cargo.toml` | Rust |
| `Gemfile` + `gem 'rails'` | Ruby on Rails |
| `pubspec.yaml` | Flutter |
| `build.gradle` (no `pom.xml`) | Kotlin / Gradle |
| None of the above | Generic |

## Extracting Commands

Check in this order. Stop when you find the command.

1. `package.json` → `scripts` object keys: `dev`, `build`, `test`, `lint`, `format`
2. `Makefile` → targets: `make dev`, `make build`, `make test`, `make lint`
3. `pyproject.toml` → `[tool.taskipy]` or `[tool.poe.tasks]`
4. Stack fallbacks (use only if nothing found above):
   - Spring Boot: `./mvnw spring-boot:run` / `./mvnw test` / `./mvnw checkstyle:check`
   - Go: `go run ./cmd/...` / `go test ./...` / `golangci-lint run`
   - Rust: `cargo run` / `cargo test` / `cargo clippy`
   - Laravel: `php artisan serve` / `php artisan test` / `./vendor/bin/pint`
   - FastAPI/Django/Flask: `uvicorn main:app` or `python -m flask run` / `pytest`

**Write only commands you found evidence for. Omit types (build/lint) with no evidence.**

## Extracting Directory Structure

From the depth-2 glob, pick the 3–5 most meaningful directories. Infer purpose:
- `src/app/` with `.tsx` → Next.js App Router pages
- `internal/` in Go project → domain logic (Go convention)
- `app/Http/Controllers/` → Laravel MVC controllers
- `src/main/java/` → Java source root
- `cmd/` → Go entry points (one binary per subdirectory)
- `tests/` or `spec/` → test suite root

Describe each in one line. Skip `node_modules/`, `.git/`, build artifacts.

## Extracting Database / ORM

| Evidence | Write |
|---|---|
| `drizzle-orm` dep + `schema.ts` found | `Drizzle ORM — schema at <path>` |
| `@prisma/client` dep | `Prisma — schema at prisma/schema.prisma` |
| `sqlalchemy` dep | `SQLAlchemy — models in <detected path>` |
| `tortoise-orm` dep | `Tortoise ORM — models in <detected path>` |
| `spring-data-jpa` in pom.xml | `Spring Data JPA — entities in <detected path>` |
| `gorm.io/gorm` | `GORM — models in <detected path>` |
| `diesel` in Cargo.toml | `Diesel ORM` |
| `illuminate/database` (Laravel) | `Eloquent ORM — models in app/Models/` |
| None detected | Omit database section entirely |

## Writing CLAUDE.md — Minimum Viable Sections

Every generated CLAUDE.md must have at least these sections:

```markdown
# <Project Name>

> <One-sentence description from Q1>. Stack: <detected>. Last updated: <YYYY-MM-DD>.

## Commands

- **Dev:** `<actual command from scan>`
- **Test:** `<actual command from scan>`

## Architecture

<2–3 sentences about actual structure. Reference real directory names.>
```

Add conditional sections only when evidence exists:
- `## Database` — only if ORM detected
- `## Environment` — only if `.env.example` found or env vars detected in source
- `## Conventions` — only if user answered Q2
```

- [ ] **Step 2: Verify line count**

```bash
wc -l plugins/harness/skills/harness-setup/references/analysis-guide.md
```
Expected: ≤ 150 lines.

- [ ] **Step 3: Commit**

```bash
git add plugins/harness/skills/harness-setup/references/analysis-guide.md
git commit -m "feat(harness): add analysis-guide — scan methodology for any-stack support"
```

---

## Task 3: Create toolchain-rules.md

**Files:**
- Create: `plugins/harness/skills/harness-setup/references/toolchain-rules.md`

- [ ] **Step 1: Write the file**

Create `plugins/harness/skills/harness-setup/references/toolchain-rules.md` with this content:

```markdown
# Toolchain Rules

> Read by SKILL.md Step 3b when generating settings.json.
> Start from `assets/base-settings.json`, then ADD the entries below that match your scan.

## Add to `permissions.allow`

| Signal detected | Entries to add |
|---|---|
| `bun.lockb` | `"Bash(bun run *)"`, `"Bash(bun add *)"`, `"Bash(bun install)"` |
| `pnpm-lock.yaml` | `"Bash(pnpm run *)"`, `"Bash(pnpm add *)"`, `"Bash(pnpm install)"` |
| `yarn.lock` | `"Bash(yarn *)"` |
| `pom.xml` | `"Bash(./mvnw *)"`, `"Bash(mvn *)"` |
| `go.mod` | `"Bash(go run *)"`, `"Bash(go build *)"`, `"Bash(go test *)"`, `"Bash(go mod *)"` |
| `Cargo.toml` | `"Bash(cargo build)"`, `"Bash(cargo test)"`, `"Bash(cargo run)"`, `"Bash(cargo clippy)"` |
| `composer.json` | `"Bash(php artisan *)"`, `"Bash(composer *)"`, `"Bash(./vendor/bin/pest)"`, `"Bash(./vendor/bin/pint)"` |
| `pytest` in deps | `"Bash(pytest *)"` |
| `uvicorn` in deps | `"Bash(uvicorn *)"` |
| `ruff` in deps | `"Bash(ruff check *)"`, `"Bash(ruff format *)"` |
| `alembic` in deps | `"Bash(alembic *)"` |
| `Gemfile` + `rails` gem | `"Bash(rails *)"`, `"Bash(bundle exec *)"` |
| `Makefile` present | `"Bash(make *)"` |
| `@prisma/client` dep | `"Bash(npx prisma *)"` |
| `drizzle-orm` dep | `"Bash(npx drizzle-kit *)"` |
| `@shadcn/ui` or `shadcn` dep | `"Bash(npx shadcn*)"` |

## Add to `permissions.ask`

| Signal detected | Entries to add |
|---|---|
| `package.json` (npm lockfile or none) | `"Bash(npm install *)"` |
| `pyproject.toml` or `requirements.txt` | `"Bash(pip install *)"`, `"Bash(uv add *)"`, `"Bash(poetry add *)"` |
| `go.mod` | `"Bash(go get *)"` |
| `Cargo.toml` | `"Bash(cargo add *)"` |
| `docker-compose.yml` | `"Bash(docker compose *)"`, `"Bash(docker-compose *)"` |

## Notes

- The `hooks` block in base-settings.json is universal — do not modify it.
- `Write(docs/**)` and `Write(docs/decisions/DECISION-LOG.md)` are already in base-settings.json.
- `Bash(curl *)` is already in `ask` — bare curl is allowed, piped curl is blocked by validate-command.py hook.
```

- [ ] **Step 2: Verify line count**

```bash
wc -l plugins/harness/skills/harness-setup/references/toolchain-rules.md
```
Expected: ≤ 150 lines.

- [ ] **Step 3: Commit**

```bash
git add plugins/harness/skills/harness-setup/references/toolchain-rules.md
git commit -m "feat(harness): add toolchain-rules — per-stack settings.json customization"
```

---

## Task 4: Create base-settings.json

**Files:**
- Create: `plugins/harness/skills/harness-setup/assets/base-settings.json`

This is the universal starting point for settings.json generation. It contains deny rules (universal), the minimal allow list, ask rules for package managers, and the hooks wiring. Toolchain-specific additions come from toolchain-rules.md.

- [ ] **Step 1: Write the file**

Create `plugins/harness/skills/harness-setup/assets/base-settings.json` with this content:

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
      "Bash(npm publish*)",
      "Bash(chmod -R 777 *)",
      "Bash(sudo rm *)"
    ],
    "allow": [
      "Write(docs/decisions/DECISION-LOG.md)"
    ],
    "ask": [
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

- [ ] **Step 2: Validate JSON**

```bash
python3 -m json.tool plugins/harness/skills/harness-setup/assets/base-settings.json > /dev/null && echo "valid"
```
Expected: `valid`

- [ ] **Step 3: Commit**

```bash
git add plugins/harness/skills/harness-setup/assets/base-settings.json
git commit -m "feat(harness): add base-settings.json — universal settings starting point"
```

---

## Task 5: Remove Old Bundles, Templates, and stack-detection.md

**Files:**
- Delete: 4 bundle files, 8 template files, stack-detection.md

These are no longer needed. The analysis-driven approach replaces all of them.

- [ ] **Step 1: Remove the files from git**

```bash
git rm plugins/harness/skills/harness-setup/bundles/nextjs.md \
       plugins/harness/skills/harness-setup/bundles/laravel.md \
       plugins/harness/skills/harness-setup/bundles/spring-boot.md \
       plugins/harness/skills/harness-setup/bundles/fastapi.md \
       plugins/harness/skills/harness-setup/assets/templates/nextjs/CLAUDE.md.tmpl \
       plugins/harness/skills/harness-setup/assets/templates/nextjs/settings.json.tmpl \
       plugins/harness/skills/harness-setup/assets/templates/laravel/CLAUDE.md.tmpl \
       plugins/harness/skills/harness-setup/assets/templates/laravel/settings.json.tmpl \
       plugins/harness/skills/harness-setup/assets/templates/spring-boot/CLAUDE.md.tmpl \
       plugins/harness/skills/harness-setup/assets/templates/spring-boot/settings.json.tmpl \
       plugins/harness/skills/harness-setup/assets/templates/fastapi/CLAUDE.md.tmpl \
       plugins/harness/skills/harness-setup/assets/templates/fastapi/settings.json.tmpl \
       plugins/harness/skills/harness-setup/references/stack-detection.md
```

- [ ] **Step 2: Verify deletion**

```bash
ls plugins/harness/skills/harness-setup/bundles/ 2>&1
ls plugins/harness/skills/harness-setup/assets/templates/ 2>&1
```
Expected: `No such file or directory` or empty for both.

- [ ] **Step 3: Clean up empty dirs**

```bash
rmdir plugins/harness/skills/harness-setup/bundles \
      plugins/harness/skills/harness-setup/assets/templates/nextjs \
      plugins/harness/skills/harness-setup/assets/templates/laravel \
      plugins/harness/skills/harness-setup/assets/templates/spring-boot \
      plugins/harness/skills/harness-setup/assets/templates/fastapi \
      plugins/harness/skills/harness-setup/assets/templates 2>/dev/null || true
```

- [ ] **Step 4: Commit**

```bash
git add -u
git commit -m "refactor(harness): remove bundles, stack templates, stack-detection ref — superseded by analysis-driven approach"
```

---

## Task 6: Update Evals, CHANGELOG, Version

**Files:**
- Modify: `plugins/harness/skills/harness-setup/evals/evals.json`
- Modify: `plugins/harness/CHANGELOG.md`
- Modify: `plugins/harness/.claude-plugin/plugin.json`

- [ ] **Step 1: Read current files**

```bash
cat plugins/harness/skills/harness-setup/evals/evals.json
cat plugins/harness/CHANGELOG.md
cat plugins/harness/.claude-plugin/plugin.json
```

- [ ] **Step 2: Overwrite evals.json**

Write to `plugins/harness/skills/harness-setup/evals/evals.json`:

```json
{
  "skillId": "harness-setup",
  "version": "2.0.0",
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
      "id": "trigger-6",
      "prompt": "Set up Claude Code for my Go API",
      "shouldTrigger": true,
      "reason": "Stack not in v1.0 — validates any-stack support"
    },
    {
      "id": "trigger-7",
      "prompt": "My Rust project needs a CLAUDE.md — can you generate one?",
      "shouldTrigger": true,
      "reason": "Stack not in v1.0 — validates any-stack support"
    },
    {
      "id": "trigger-8",
      "prompt": "Generate a harness for this Ruby on Rails app",
      "shouldTrigger": true,
      "reason": "Stack not in v1.0 — validates any-stack support"
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

- [ ] **Step 3: Prepend CHANGELOG entry**

Read `plugins/harness/CHANGELOG.md`, then prepend this block at the top (after any frontmatter/title):

```markdown
## [2.0.0] — 2026-05-09

### Breaking Changes
- Removed 4 stack-specific bundles (nextjs, laravel, spring-boot, fastapi)
- Removed 8 CLAUDE.md and settings.json templates (one per stack)
- Removed references/stack-detection.md

### Added
- Analysis-driven generation — any stack now supported (Go, Rust, Rails, Flutter, Django, etc.)
- `references/analysis-guide.md` — scan methodology + CLAUDE.md synthesis guide
- `references/toolchain-rules.md` — per-toolchain settings.json customizations
- `assets/base-settings.json` — single universal settings starting point

### Changed
- SKILL.md rewritten: detect → template → fill → ~~write~~ becomes scan → synthesize → write
- Output now reflects actual project structure and commands, not assumed defaults
```

- [ ] **Step 4: Update version in plugin.json**

Read `plugins/harness/.claude-plugin/plugin.json`, change `"version": "1.0.0"` to `"version": "2.0.0"`.

- [ ] **Step 5: Verify eval counts**

```bash
python3 -c "
import json
d = json.load(open('plugins/harness/skills/harness-setup/evals/evals.json'))
t = [e for e in d['evals'] if e['shouldTrigger']]
nt = [e for e in d['evals'] if not e['shouldTrigger']]
print(f'trigger: {len(t)}, no-trigger: {len(nt)}')
assert len(t) >= 3 and len(nt) >= 2, 'eval counts too low'
print('ok')
"
```
Expected: `trigger: 8, no-trigger: 2` then `ok`

- [ ] **Step 6: Commit**

```bash
git add plugins/harness/skills/harness-setup/evals/evals.json \
        plugins/harness/CHANGELOG.md \
        plugins/harness/.claude-plugin/plugin.json
git commit -m "chore(harness): bump to v2.0.0 — update evals, changelog, version"
```

---

## Final Validation

After all 6 tasks:

```bash
# Line count checks
wc -l plugins/harness/skills/harness-setup/SKILL.md
wc -l plugins/harness/skills/harness-setup/references/analysis-guide.md
wc -l plugins/harness/skills/harness-setup/references/toolchain-rules.md

# JSON validity
python3 -m json.tool plugins/harness/skills/harness-setup/assets/base-settings.json > /dev/null && echo "base-settings ok"
python3 -m json.tool plugins/harness/skills/harness-setup/evals/evals.json > /dev/null && echo "evals ok"

# Nothing deleted that should survive
ls plugins/harness/skills/harness-setup/assets/hooks/validate-command.py
ls plugins/harness/skills/harness-setup/assets/hooks/protect-files.py
ls plugins/harness/skills/harness-setup/references/phase-model.md

# Bundles and templates are gone
ls plugins/harness/skills/harness-setup/bundles/ 2>&1 | grep -q "No such" && echo "bundles gone"
ls plugins/harness/skills/harness-setup/assets/templates/ 2>&1 | grep -q "No such" && echo "templates gone"

# Version in plugin.json
grep '"version"' plugins/harness/.claude-plugin/plugin.json
```

Expected:
- SKILL.md: ≤ 200 lines
- analysis-guide.md: ≤ 150 lines
- toolchain-rules.md: ≤ 150 lines
- base-settings ok / evals ok
- Both hook files exist
- phase-model.md exists
- `bundles gone` / `templates gone`
- version: `"2.0.0"`
