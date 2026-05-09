# harness-setup — Laravel Bundle

Full generation guide for Laravel projects. Read after SKILL.md routes here.

## Files to Generate

| File | Action |
|---|---|
| `CLAUDE.md` | Create from `assets/templates/laravel/CLAUDE.md.tmpl` |
| `.claude/settings.json` | Create from `assets/templates/laravel/settings.json.tmpl` |
| `.claude/hooks/validate-command.py` | Copy from `assets/hooks/validate-command.py` |
| `.claude/hooks/protect-files.py` | Copy from `assets/hooks/protect-files.py` |
| `docs/ARCHITECTURE.md` | Create with architecture skeleton below |

## Generation Steps

### 1. Create directories

```bash
mkdir -p .claude/hooks docs
```

### 2. Generate CLAUDE.md

Read `assets/templates/laravel/CLAUDE.md.tmpl`.
Replace all `{{TOKEN}}` placeholders:

| Token | Value |
|---|---|
| `{{PROJECT_NAME}}` | From Step 0 detection |
| `{{PROJECT_DESCRIPTION}}` | From Q1 answer |
| `{{PKG_MANAGER}}` | From Step 0 detection (default: composer for PHP, npm for frontend) |
| `{{DATABASE}}` | Eloquent (always present in Laravel) |
| `{{PORT}}` | From Step 0 detection (default: 8000) |
| `{{TEST_FRAMEWORK}}` | From Step 0 detection (default: PHPUnit) |
| `{{CUSTOM_CONVENTIONS}}` | From Q2 answer (or empty string if skipped) |
| `{{DATE}}` | Today's date (YYYY-MM-DD) |

Write result to `CLAUDE.md`. Hard cap: 200 lines.

### 3. Generate settings.json

Read `assets/templates/laravel/settings.json.tmpl`.
Write to `.claude/settings.json`.

**CRITICAL:** `.claude/settings.json`, NOT `settings.json` at root.

### 4. Copy hooks

Read `assets/hooks/validate-command.py` → write to `.claude/hooks/validate-command.py`.
Read `assets/hooks/protect-files.py` → write to `.claude/hooks/protect-files.py`.

```bash
chmod +x .claude/hooks/validate-command.py
chmod +x .claude/hooks/protect-files.py
```

### 5. Generate docs/ARCHITECTURE.md

```markdown
# {{PROJECT_NAME}} — Architecture

> {{PROJECT_DESCRIPTION}}
> Last updated: {{DATE}}

## Stack

- Framework: Laravel (PHP)
- Database: {{DATABASE}} (Eloquent ORM)
- Tests: {{TEST_FRAMEWORK}}

## Project Structure

```
app/
  Http/Controllers/   ← Request handling, thin logic
  Models/             ← Eloquent models
  Services/           ← Business logic (keep controllers thin)
database/
  migrations/         ← Schema changes (append-only)
routes/
  web.php             ← Web routes
  api.php             ← API routes
tests/
  Feature/            ← Feature tests (HTTP layer)
  Unit/               ← Unit tests (services, models)
```

## Key Decisions

- Services handle business logic — controllers call services, not models directly
- Validate with Form Requests, not inline in controllers
- Migrations are append-only — never edit a migration after it runs

## Boundaries

- No business logic in controllers or views
- No queries in Blade templates
- No raw SQL — use Eloquent query builder
```

### 6. Validate output

```bash
ls -la CLAUDE.md .claude/settings.json .claude/hooks/validate-command.py .claude/hooks/protect-files.py docs/ARCHITECTURE.md
wc -l CLAUDE.md  # Expected: ≤ 200
grep -c '{{' CLAUDE.md || true  # Expected: 0 (no unfilled tokens)
ls -la .claude/hooks/  # Expected: -rwxr-xr-x for both .py files
```
