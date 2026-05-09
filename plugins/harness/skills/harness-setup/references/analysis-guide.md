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

```
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
