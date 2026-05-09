# Stack Detection Reference

> Loaded by bundles only when detection logic needs to be consulted.
> Never loaded automatically — only when explicitly referenced.

## Detection Priority Order

Run checks in this exact order. Stop at first match.

1. `pom.xml` exists → **Spring Boot**
2. `package.json` exists AND (`dependencies.next` OR `devDependencies.next` is set) → **Next.js**
3. `composer.json` exists → **Laravel**
4. `requirements.txt` exists AND contains `fastapi` → **FastAPI**
   OR `pyproject.toml` exists AND contains `fastapi` in dependencies → **FastAPI**
5. `package.json` exists (no `next`) → **Node/generic**
6. None of the above → **Generic**

## Token Auto-Fill Sources

### PROJECT_NAME
1. `package.json` → `.name` field (strip `@scope/` prefix)
2. `pom.xml` → `<artifactId>` value
3. Current directory basename

### PORT
1. `package.json` → scan `scripts.dev` for `-p 3000` or `--port 3000` pattern
2. `application.properties` → `server.port=8080`
3. Stack default: Next.js=3000, Laravel=8000, Spring Boot=8080

### PKG_MANAGER
| Lockfile | Manager |
|---|---|
| `pnpm-lock.yaml` | pnpm |
| `yarn.lock` | yarn |
| `bun.lockb` | bun |
| `package-lock.json` | npm |
| None | npm (default) |

For Laravel: always `composer` for PHP packages + detect JS lockfile for frontend.

### DATABASE
| Dependency | Value |
|---|---|
| `drizzle-orm` in package.json | Drizzle |
| `@prisma/client` in package.json | Prisma |
| `spring-data-jpa` in pom.xml | Spring Data JPA |
| `illuminate/database` (always in Laravel) | Eloquent |
| `sqlalchemy` in requirements.txt | SQLAlchemy |
| `tortoise-orm` in requirements.txt | Tortoise ORM |
| None detected | "Not configured" |

### TEST_FRAMEWORK
| Dependency | Value |
|---|---|
| `jest` or `@jest/core` | Jest |
| `vitest` | Vitest |
| `phpunit/phpunit` | PHPUnit |
| `pestphp/pest` | Pest |
| `junit-jupiter-api` in pom.xml | JUnit 5 |
| `pytest` in requirements.txt or pyproject.toml | pytest |
| None | "Not configured" |

## Edge Cases

**Monorepo:** If `package.json` exists at root but `apps/web/package.json` also exists with `next`, use the app-level detection. Ask user if ambiguous.

**Multiple stacks detected:** e.g., `pom.xml` + `package.json` with `next` → Spring Boot backend + Next.js frontend monorepo. Ask user which to generate harness for. Default: whichever is in current working directory.
