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
| **Memory** | CLAUDE.md exists, < 200 lines, no unfilled {{TOKEN}}, Last verified < 90 days old |
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
Found {N} issues ({X} critical, {Y} warnings).

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
