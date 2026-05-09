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

## How It Works

1. **Detect** — Scans `pom.xml`, `composer.json`, `package.json` to identify your stack
2. **Auto-fill** — Reads project name, port, package manager, database, test framework from your files
3. **Ask** — 2 questions only: project description + optional conventions
4. **Generate** — Creates 5 files tailored to your stack
5. **Validate** — Confirms all files are in place and hooks are executable

## Doctor

```bash
/shipwithai-harness:doctor
```

Runs 4 health checks:
- **Memory** — CLAUDE.md complete, no unfilled tokens, not stale
- **Permission** — settings.json valid, balanced rules
- **Hooks** — hooks present, executable, wired correctly
- **Stack** — detected stack matches CLAUDE.md

Produces a scored report with actionable fixes.
