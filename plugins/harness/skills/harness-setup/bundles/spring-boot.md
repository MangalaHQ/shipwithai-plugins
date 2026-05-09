# harness-setup — Spring Boot Bundle

Full generation guide for Spring Boot projects. Read after SKILL.md routes here.

## Files to Generate

| File | Action |
|---|---|
| `CLAUDE.md` | Create from `assets/templates/spring-boot/CLAUDE.md.tmpl` |
| `.claude/settings.json` | Create from `assets/templates/spring-boot/settings.json.tmpl` |
| `.claude/hooks/validate-command.py` | Copy from `assets/hooks/validate-command.py` |
| `.claude/hooks/protect-files.py` | Copy from `assets/hooks/protect-files.py` |
| `docs/ARCHITECTURE.md` | Create with architecture skeleton below |

## Generation Steps

### 1. Create directories

```bash
mkdir -p .claude/hooks docs
```

### 2. Generate CLAUDE.md

Read `assets/templates/spring-boot/CLAUDE.md.tmpl`.
Replace all `{{TOKEN}}` placeholders:

| Token | Value |
|---|---|
| `{{PROJECT_NAME}}` | From Step 0 detection |
| `{{PROJECT_DESCRIPTION}}` | From Q1 answer |
| `{{PACKAGE}}` | `pom.xml:<groupId>.<artifactId>` (e.g. `com.example.myapp`) |
| `{{DATABASE}}` | Spring Data JPA (if spring-data-jpa detected), else "Not configured" |
| `{{PORT}}` | From `application.properties:server.port` (default: 8080) |
| `{{TEST_FRAMEWORK}}` | JUnit 5 + Testcontainers |
| `{{CUSTOM_CONVENTIONS}}` | From Q2 answer (or empty string if skipped) |
| `{{DATE}}` | Today's date (YYYY-MM-DD) |

Write result to `CLAUDE.md`. Hard cap: 200 lines.

### 3. Generate settings.json

Read `assets/templates/spring-boot/settings.json.tmpl`.
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

- Framework: Spring Boot (Java)
- Package: {{PACKAGE}}
- Database: {{DATABASE}}
- Tests: {{TEST_FRAMEWORK}}

## Project Structure

```
src/main/java/{{PACKAGE}}/
  controller/   ← @RestController — HTTP handling only
  service/      ← @Service — business logic
  repository/   ← @Repository — Spring Data JPA interfaces
  model/        ← @Entity — JPA entities
  dto/          ← Request/response DTOs (no entities in API layer)
src/main/resources/
  application.properties
src/test/java/{{PACKAGE}}/
  controller/   ← @WebMvcTest slice tests
  service/      ← @ExtendWith(MockitoExtension) unit tests
  integration/  ← @SpringBootTest + Testcontainers
```

## Key Decisions

- @Valid on @RequestBody — always validate at controller boundary
- Return DTOs from controllers, never @Entity directly
- Testcontainers for integration tests — no H2 (different SQL dialect)

## Boundaries

- No business logic in controllers or repositories
- No @Entity objects in API responses — always map to DTO
- Transaction boundaries at @Service layer
```

### 6. Validate output

```bash
ls -la CLAUDE.md .claude/settings.json .claude/hooks/validate-command.py .claude/hooks/protect-files.py docs/ARCHITECTURE.md
wc -l CLAUDE.md  # Expected: ≤ 200
grep -c '{{' CLAUDE.md || true  # Expected: 0 (no unfilled tokens)
ls -la .claude/hooks/  # Expected: -rwxr-xr-x for both .py files
```
