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
| curl not hard-denied | `deny` array does NOT contain bare `Bash(curl *)` | WARNING |
| npx not hard-denied | `deny` array does NOT contain bare `Bash(npx *)` | WARNING |
| docs/** conflict | `allow` has specific docs path AND `ask` has `docs/**` | WARNING |

## Category 3: Hooks Checks

| Check | Pass condition | Severity |
|---|---|---|
| validate-command.py exists | `.claude/hooks/validate-command.py` present | CRITICAL |
| protect-files.py exists | `.claude/hooks/protect-files.py` present | CRITICAL |
| validate-command.py executable | file is executable (`ls -la` shows x bit) | CRITICAL |
| protect-files.py executable | file is executable | CRITICAL |
| Hooks wired in settings.json | `hooks.PreToolUse` references validate-command.py | CRITICAL |
| PostToolUse wired | `hooks.PostToolUse` references protect-files.py | WARNING |

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
