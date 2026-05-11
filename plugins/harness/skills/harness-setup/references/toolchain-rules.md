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
| `package.json` with `next` dep | `"Bash(npm run *)"` (if npm lockfile or no lockfile) |

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
- `Bash(curl *)` is already in `ask` — bare curl is allowed, piped curl is blocked by validate-command.py.
- Only add entries whose signal was found in the scan. Do not add entries for signals not detected.
