# harness-setup — FastAPI Bundle

Full generation guide for FastAPI (Python) projects. Read after SKILL.md routes here.

## Files to Generate

| File | Action |
|---|---|
| `CLAUDE.md` | Create from `assets/templates/fastapi/CLAUDE.md.tmpl` |
| `.claude/settings.json` | Create from `assets/templates/fastapi/settings.json.tmpl` |
| `.claude/hooks/validate-command.py` | Copy from `assets/hooks/validate-command.py` |
| `.claude/hooks/protect-files.py` | Copy from `assets/hooks/protect-files.py` |
| `docs/ARCHITECTURE.md` | Create with architecture skeleton below |

## Generation Steps

### 1. Create directories

```bash
mkdir -p .claude/hooks docs
```

### 2. Generate CLAUDE.md

Read `assets/templates/fastapi/CLAUDE.md.tmpl`.
Replace all `{{TOKEN}}` placeholders:

| Token | Value |
|---|---|
| `{{PROJECT_NAME}}` | From Step 0 detection |
| `{{PROJECT_DESCRIPTION}}` | From Q1 answer |
| `{{PORT}}` | From `uvicorn` command in scripts (default: 8000) |
| `{{DATABASE}}` | detect `sqlalchemy`→SQLAlchemy, `tortoise-orm`→Tortoise ORM, `prisma`→Prisma, else "Not configured" |
| `{{TEST_FRAMEWORK}}` | detect `pytest` in requirements.txt/pyproject.toml (default: pytest) |
| `{{CUSTOM_CONVENTIONS}}` | From Q2 answer (or empty string if skipped) |
| `{{DATE}}` | Today's date (YYYY-MM-DD) |

Write result to `CLAUDE.md`. Hard cap: 200 lines.

### 3. Generate settings.json

Read `assets/templates/fastapi/settings.json.tmpl`.
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

- Framework: FastAPI (Python)
- Database: {{DATABASE}}
- Tests: {{TEST_FRAMEWORK}}
- Port: {{PORT}}

## Project Structure

```
app/
  main.py           ← FastAPI app entry point, router registration
  api/
    v1/
      routes/       ← Endpoint routers (@router.get, @router.post)
  core/
    config.py       ← Settings via pydantic-settings
    dependencies.py ← Shared FastAPI dependencies (auth, db session)
  models/           ← SQLAlchemy/Tortoise ORM models
  schemas/          ← Pydantic request/response schemas
  services/         ← Business logic (called by routes)
  db/
    session.py      ← DB engine + session factory
tests/
  conftest.py       ← pytest fixtures, test client, test db
  test_*.py         ← endpoint tests using TestClient
```

## Key Decisions

- Pydantic schemas for ALL request/response — never return ORM models directly
- Dependency injection via `Depends()` — auth, db session, pagination
- Async endpoints by default — `async def` everywhere
- pytest + httpx TestClient for integration tests

## Boundaries

- Routes handle HTTP only — delegate to services for logic
- No DB queries in routes — go through services
- Settings loaded once via `pydantic-settings` — never `os.getenv()` inline
```

### 6. Validate output

```bash
ls -la CLAUDE.md .claude/settings.json .claude/hooks/validate-command.py .claude/hooks/protect-files.py docs/ARCHITECTURE.md
wc -l CLAUDE.md  # Expected: <= 200
grep -c '{{' CLAUDE.md || true  # Expected: 0
ls -la .claude/hooks/  # Expected: -rwxr-xr-x for both .py files
```
