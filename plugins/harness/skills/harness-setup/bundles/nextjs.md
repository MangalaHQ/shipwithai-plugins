# harness-setup — Next.js Bundle

Full generation guide for Next.js projects. Read after SKILL.md routes here.

## Files to Generate

| File | Action |
|---|---|
| `CLAUDE.md` | Create from `assets/templates/nextjs/CLAUDE.md.tmpl` |
| `.claude/settings.json` | Create from `assets/templates/nextjs/settings.json.tmpl` |
| `.claude/hooks/validate-command.py` | Copy from `assets/hooks/validate-command.py` |
| `.claude/hooks/protect-files.py` | Copy from `assets/hooks/protect-files.py` |
| `docs/ARCHITECTURE.md` | Create with architecture skeleton below |

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
No token substitution needed — copy as-is.
Write to `.claude/settings.json`.

**CRITICAL — settings.json goes in `.claude/`, NOT project root.**
Claude Code reads `.claude/settings.json`, not `settings.json`.

### 4. Copy hooks

Read `assets/hooks/validate-command.py` and write to `.claude/hooks/validate-command.py`.
Read `assets/hooks/protect-files.py` and write to `.claude/hooks/protect-files.py`.

Then make them executable:
```bash
chmod +x .claude/hooks/validate-command.py
chmod +x .claude/hooks/protect-files.py
```

**Note:** The hooks are already registered in the settings.json template under `hooks`. Do NOT add them again manually.

### 5. Generate docs/ARCHITECTURE.md

Create `docs/ARCHITECTURE.md` with this content (substitute the tokens):

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

### 6. Verify hooks wiring in settings.json

After copying settings.json, check it contains a `hooks` block with both `PreToolUse` (validate-command.py) and `PostToolUse` (protect-files.py). This wiring is required — settings.json alone without hooks is FRAGILE per the harness framework design principles.

If the hooks block is missing, it means the settings.json template was not written yet (that's Task 8). Note this as a concern but do NOT fail — the template will be written in Task 8.

### 7. Validate output

After generation the user should see all 5 files:
```bash
ls -la CLAUDE.md .claude/settings.json .claude/hooks/validate-command.py .claude/hooks/protect-files.py docs/ARCHITECTURE.md
```

Check CLAUDE.md is within limit:
```bash
wc -l CLAUDE.md  # Expected: ≤ 200
```

Check no unfilled tokens:
```bash
grep -c '{{' CLAUDE.md || true  # Expected: 0
```

Check hooks are executable:
```bash
ls -la .claude/hooks/  # Expected: -rwxr-xr-x for both .py files
```
