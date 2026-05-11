# shipwithai-harness

> Generate a production-ready Claude Code harness for any project — in under 2 minutes.

[![Version](https://img.shields.io/badge/version-2.0.0-blue)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Plugin](https://img.shields.io/badge/claude--code-plugin-7C3AED)](https://shipwithai.io/plugins/harness)

---

## Install

```bash
/plugin install shipwithai-harness@shipwithai
```

## Quick Start

```bash
/shipwithai-harness:setup    # Scan project → generate harness
/shipwithai-harness:doctor   # Diagnose existing harness health
```

`/setup` asks 2 questions, reads your actual code, and writes 5 files in one pass.  
`/doctor` scores your harness health and offers to fix what it finds.

---

## What Gets Generated

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Project context filled with your real commands, directory layout, and conventions |
| `.claude/settings.json` | Permission rules tuned to your toolchain |
| `.claude/hooks/validate-command.py` | Blocks fork bombs, `curl\|bash`, `push --force`, and other dangerous patterns |
| `.claude/hooks/protect-files.py` | Hard-blocks writes to `.env`, `.pem`, `.key` |
| `docs/ARCHITECTURE.md` | Architecture snapshot derived from your actual project structure |

---

## Why shipwithai-harness?

**Any stack, zero assumptions.** v2.0 reads your actual project files — `package.json`, `pom.xml`, `go.mod`, `Cargo.toml`, `Gemfile`, `pyproject.toml`, and more — instead of filling static templates. Works on Next.js, Laravel, Spring Boot, Go, Rust, Rails, Django, Flutter, and anything else with a recognizable config file.

**Minimal input, complete output.** Two questions: your project description (required) and custom conventions (optional). Everything else — commands, directory layout, env vars, test framework, package manager — is extracted from your files automatically. No wizard. No 10-question setup flow.

**Safety baked in, not bolted on.** The generated hooks block patterns that AI commonly gets wrong: fork bombs, `curl | bash` pipe installs, force pushes to protected branches, and direct writes to credential files. Dangerous behavior is blocked before it executes, not after.

---

## How It Works

1. **Scan** — reads config files, lockfiles, source files, and `.env.example` in parallel
2. **Summarize** — shows a scan summary before asking anything
3. **Ask** — 2 questions: project description + optional conventions
4. **Write** — generates 5 files with zero unfilled `{{TOKEN}}` placeholders
5. **Validate** — confirms hooks are executable and CLAUDE.md is within the 200-line limit

**Example scan summary:**

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

---

## Doctor

```bash
/shipwithai-harness:doctor
```

Runs 4 health checks and produces a scored report:

| Category | What it checks |
|----------|----------------|
| **Memory** | CLAUDE.md present, ≤ 200 lines, no `{{TOKEN}}` placeholders, not stale (> 90 days) |
| **Permission** | settings.json valid JSON, has deny block, no over-broad rules |
| **Hooks** | Both hooks present, executable, wired in settings.json |
| **Stack** | Detected stack matches CLAUDE.md, commands still exist in project |

Safe fixes (hook permissions, JSON formatting) are applied automatically. Changes to CLAUDE.md or settings rules always require confirmation.

**Example report:**

```
╔══════════════════════════════════════════════════╗
║        🛡️  Harness Doctor — Health Report         ║
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
```

---

## Supported Stacks

Any stack. Validated reference stacks: **Next.js**, **Laravel**, **Spring Boot**, **FastAPI**, **Go (Gin)**, **Rust**, **Rails**, **Django**, **Flutter**.

If it has a config file, it can be scanned.

---

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md). Issues and PRs welcome.

## License

MIT — see [LICENSE](LICENSE).
