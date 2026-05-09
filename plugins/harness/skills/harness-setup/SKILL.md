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
