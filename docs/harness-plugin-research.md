# Harness Plugin Research

*Researched: 2026-05-08 — Branch: feature/harness-plugin*

---

## Mục tiêu plugin

`shipwithai-harness` — plugin tự động detect tech stack của dự án và generate harness hoàn chỉnh (CLAUDE.md + hooks + settings.json + docs/) phù hợp với stack đó, theo progressive phase model (0→3).

---

## Competitive Analysis

### Thị trường

Hệ sinh thái Claude Code harness đang bùng nổ trong 2026. Thị trường dịch chuyển từ "config bundle" → "agent harness performance optimization system". Có 176+ plugins đã tồn tại nhưng **khoảng trắng lớn nhất chưa ai lấp:** không có plugin nào tự động detect tech stack và generate harness tailored cho từng loại dự án.

### Đối thủ trực tiếp

**Everything Claude Code (ECC)** — mối đe dọa lớn nhất
- 82K+ stars, 10,700 forks — hiện dominant nhất thị trường
- Đã có: package manager detection (`--detect`), 10 language-specific agents, `/harness-audit` với 7-category scoring rubric, `/harness-optimizer` agent
- Chưa có: framework-specific CLAUDE.md generation — Spring Boot ≠ Next.js ≠ Laravel trong harness
- Đang distracted: ECC 2.0 Rust rewrite — bỏ lại khoảng trống ở tầng setup đơn giản
- **Verdict:** Generic config dump, không stack-aware

**oh-my-claudecode (OMC)** — đang dùng trong project này
- 15K+ stars, teams-first multi-agent orchestration
- Có `deepinit` generate AGENTS.md hierarchy — nhưng **Issue #613 confirmed:** không auto-load trong Plugin Mode → useless với hầu hết users
- Focus là orchestration, không phải initial project setup
- **Verdict:** Coexist được, không cạnh tranh trực tiếp

**centminmod/my-claude-code-setup**
- Static CLAUDE.md starter template, không detect stack, không maintained
- **Verdict:** Template, không phải plugin

**MuhammadUsmanGM/claude-code-best-practices**
- Có 11 CLAUDE.md templates (React, Python, Go, Next.js, Spring Boot...) dưới dạng wiki/repo
- Không phải installable plugin, không auto-detect
- **Verdict:** Validates demand, không phải competitor

**piomin/claude-ai-spring-boot**
- Template tĩnh cho Spring Boot — closest competitor cho Spring Boot use case
- **Verdict:** Static template, không plugin

### Positioning map

```
                    HIGH AUTO-SETUP
                          │
               centminmod │  [shipwithai-harness]  ← TARGET
               (beginner) │  (stack-aware, one-command)
                          │
GENERIC ──────────────────┼──────────────── FRAMEWORK-SPECIFIC
                          │
       ECC (power user)   │  (gap: nobody here)
       OMC (teams)        │
                          │
                    LOW AUTO-SETUP
```

### Win rate assessment: ~65–70%

**Tại sao win được:**
- Khoảng trắng xác nhận — nhiều devs tự viết setup từ đầu (validated demand)
- Distribution đã có — ShipWithAI plugin marketplace live, auth plugin đã có users
- Doctor pattern đã proven từ auth plugin
- ECC đang distracted với ECC 2.0 Rust rewrite
- OMC's deepinit broken (Issue #613)
- Cửa sổ Q2 2026 còn mở

**Rủi ro:**
- ECC có thể add stack-detection trong 1–2 tháng (82K stars, nhiều resource)
- Anthropic có `claude --init` flag — nếu push official stack-aware init thì game over
- Distribution channel plugin marketplace chưa proven ở scale

**Cửa sổ:** Ship trong 6–8 tuần hoặc mất first-mover advantage.

---

## Template Analysis

### Nguồn gốc

`/Users/leonard/Workspace/Startup/shipwithai/src/data/templates` là phiên bản product hóa từ `claude-md-framework` (MangalaHQ). Relationship:

```
claude-md-framework          →   shipwithai/src/data/templates
[placeholder] syntax         →   {{TOKEN}} syntax
3 stacks (Next.js, FastAPI,  →   10 stacks + SCHEMA.md
  Express)                       token substitution system
Design docs (00–11)          →   Token schema documentation
```

### Cấu trúc phase

| Phase | Tên | Thời gian | Files | CLAUDE.md | Bảo mật |
|---|---|---|---|---|---|
| 0 | Zero to Working | 2 phút | 1 | ~55 lines | Không |
| 1 | Solo Dev Serious | 15 phút | 17 | ~120 lines | settings.json |
| 2 | Team Foundation | 30 phút | 60 | ~170 lines | + 2 hooks + rules |
| 3 | Production Hardened | 1–2 giờ | 100 | ~200 lines (hard cap) | Full 7-layer |

**Mỗi phase là superset của phase trước** — upgrade chỉ thêm files, không cần redo.

### 10 stacks đã có

`dotnet`, `fastapi`, `flutter`, `generic`, `go`, `laravel`, `nextjs`, `rails`, `react-native`, `rust`, `spring-boot`

### Điểm mạnh của templates

1. **Progressive complexity** — phase 0→3 là UX design đúng, không ai làm kiểu này
2. **Stack differentiation thực sự** — spring-boot.md không phải generic rename, có `@WebMvcTest`, Testcontainers, OWASP
3. **Security depth** — `validate-command.py` cover fork bomb, netcat, base64 obfuscation; `scan-output.py` detect prompt injection — unique trên market
4. **MEMORY.md pattern** — session continuity, đúng pain point

### Bugs cần fix trước khi ship

**settings.json Phase 2 — 3 issues:**
```json
// Issue A: overlap conflict
"allow": ["Write(docs/decisions/DECISION-LOG.md)"]  // specific
"ask":   ["Write(docs/**)"]                          // broad — cùng path, rule nào win?

// Issue B: over-blocking hợp lệ
"deny": ["Bash(curl *)"]   // breaks health checks, API testing
"deny": ["Bash(npx *)"]    // breaks npx eslint, npx prisma migrate

// Issue C: scan-output.py không wire trong Phase 2
// Chỉ có ở phase-3, phase-2 settings.json thiếu PostToolUse hook
```

### Gaps cần thêm

1. **Phase 3 thiếu SCHEMA.md** — phase 0/1/2 có, phase-3/stacks/ không có
2. **Sub-directory CLAUDE.md** — framework nói phase 2+ cần `src/api/`, `src/db/`, `tests/` CLAUDE.md (<50 lines mỗi file); templates chưa có
3. **Token inconsistency** — generic CLAUDE.md dùng `{{INSTALL_CMD}}`, spring-boot.md hard-code `./mvnw` — web wizard cần 2 code path
4. **Token fatigue phase 3** — `{{HARD_BOUNDARY_1/2/3}}`, `{{STACK_ANTIPATTERN}}` nhiều tokens ít value, dễ bị bỏ trống

---

## Framework Design Principles (từ claude-md-framework)

7 principles — plugin phải tuân theo khi generate:

| # | Principle | Áp dụng cho plugin |
|---|---|---|
| P1 | Concise | Hard cap: 200 lines. Không generate vượt quá |
| P2 | Specific | Fill token với giá trị thực, không để placeholder trống |
| P3 | Non-obvious only | Không inject điều code đã tự nói |
| P4 | Copy-paste ready | Verify command tồn tại trong project trước khi generate |
| P5 | Layered context | Generate sub-directory CLAUDE.md cho từng layer |
| P6 | Living SOT | `harness-doctor` check `Last verified` date |
| P7 | Dual-audience | Generated docs readable cho cả AI lẫn người |

### 7-Layer Security Model

Plugin phải generate đủ cả 2 lớp — settings.json deny + hook validation:

```
Layer 0: Prompt injection defense  ← scan-output.py (PostToolUse)
Layer 1: settings.json             ← hard-block patterns (static)
Layer 2: Claude Code hooks         ← validate-command.py (PreToolUse)
         Hook exit 2 = blocks even --dangerously-skip-permissions
         Hooks only TIGHTEN, never LOOSEN deny rules
Layer 3: MCP security              ← deny delete/drop/exec
Layer 4: Git hooks (lefthook)      ← pre-commit secret scan
         ⚠️ Bypassable với --no-verify → Layer 1+2 phải cover
Layer 5: Supply chain              ← .npmrc ignore-scripts + save-exact
Layer 6: CI/CD                     ← security.yml workflow
```

### Decision Log 3 tiers

Plugin có thể auto-generate ADR đầu tiên "Why we chose [stack]":

```
ADR (Architecture)  ← system-wide, hard to revert — generate 1 cái đầu tiên
DDR (Design)        ← 1 module, medium effort
AgDR (Agent)        ← micro-decision, append to DECISION-LOG.md
```

---

## Phần chung giữa các tech stack

### Shared core (build once, reuse cho mọi stack)

```
1. Stack detector              ← detect pom.xml, package.json, composer.json...
2. Phase suggester             ← dựa trên project signals
3. CLAUDE.md template engine   ← shared skeleton, swap content per stack
4. SessionStart hook           ← inject project context (chỉ khác content)
5. PreToolUse hook             ← validate-command.py (100% chung)
6. Stop hook                   ← verification checklist (100% chung)
7. settings.json base          ← deny dangerous commands (85% chung)
8. Doctor orchestrator         ← shared structure, swap checks per stack
9. Evals runner                ← same format mọi stack
```

### Stack-specific layer (swap per stack)

```
Build commands:    ./mvnw vs npm vs php artisan vs go build
Test commands:     JUnit vs Jest vs PHPUnit vs go test
Lint/format:       checkstyle vs prettier vs pint vs gofmt
PostToolUse fmt:   spotless vs eslint --fix vs pint vs gofmt
Env vars:          SPRING_DATASOURCE_URL vs DATABASE_URL vs DB_*
Architecture:      controller/service/repo vs app/lib/db vs MVC
Security rules:    @Valid vs Zod vs FormRequest vs validator
```

### Architecture plugin

```
skills/harness-setup/           ← shared core, routes to bundle
skills/harness-setup/bundles/
  spring-boot.md                ← stack-specific complete guide
  nextjs.md
  laravel.md
  ...
skills/harness-setup/references/
  hooks-common.md               ← hook templates tái dùng
  phase-model.md                ← phase 0→3 decision guide
skills/harness-doctor/          ← shared orchestrator, swap checks
```

---

## Phase Suggestion Logic

Plugin detect phase dựa trên project signals:

```python
def suggest_phase(project_dir):
    signals = {
        "has_tests":       exists("test/", "tests/", "src/test/"),
        "has_env_example": exists(".env.example"),
        "has_ci":          exists(".github/workflows/"),
        "has_docker":      exists("Dockerfile", "docker-compose.yml"),
        "has_git_hooks":   exists(".husky/", "lefthook.yml"),
        "contributor_count": count_git_contributors(),
    }

    if signals["has_ci"] or signals["has_docker"]:
        return 3  # Production Hardened
    if signals["has_env_example"] or signals["contributor_count"] > 1:
        return 2  # Team Foundation
    if signals["has_tests"]:
        return 1  # Solo Dev Serious
    return 0      # Zero to Working
```

---

## Token Auto-fill Logic

Các token có thể auto-fill từ project files:

| Token | Nguồn auto-fill |
|---|---|
| `{{PROJECT_NAME}}` | `package.json:.name` / `pom.xml:<artifactId>` / dirname |
| `{{STACK}}` | detected stack name |
| `{{PORT}}` | `application.properties:server.port` / `package.json:scripts.dev` |
| `{{PACKAGE}}` | `pom.xml:<groupId>.<artifactId>` |
| `{{DATABASE}}` | detect `spring-data-jpa`, `prisma`, `drizzle`, `sqlalchemy` |
| `{{PKG_MANAGER}}` | detect `pnpm-lock.yaml` / `yarn.lock` / `bun.lockb` |
| `{{TEST_FRAMEWORK}}` | detect `junit`, `jest`, `vitest`, `pytest`, `phpunit` |

Tokens không thể auto-fill (user phải cung cấp):
- `{{PROJECT_DESCRIPTION}}` — ask user
- `{{CUSTOM_CONVENTIONS}}` — ask user hoặc để trống
- `{{MIN_COVERAGE}}` — default 80%

---

## Roadmap đề xuất

### v1.0 — MVP (Q2 2026)

**Skills:**
- `harness-setup` — detect stack + suggest phase + generate CLAUDE.md + hooks + settings.json
- `harness-doctor` — health check harness existing project

**Stacks ưu tiên** (theo search demand):
1. `nextjs` — highest demand
2. `laravel` — Taylor Otwell ecosystem, active community
3. `spring-boot` — strong backend user base

**Scope v1.0:**
- Auto-detect 3 stacks trên
- Auto-suggest phase 0→2 (phase 3 manual)
- Auto-fill core tokens (PROJECT_NAME, PORT, PACKAGE, DATABASE, PKG_MANAGER)
- Generate CLAUDE.md + settings.json + validate-command.py + protect-files.py
- `harness-doctor` basic: check CLAUDE.md exists, hooks executable, settings.json valid

### v1.1 — Expand (Q3 2026)

- Thêm 7 stacks còn lại
- Phase 3 auto-generation
- Sub-directory CLAUDE.md generation
- Auto-generate first ADR "Why [stack]"
- `harness-doctor` advanced: check `Last verified` dates, score vs ECC rubric

---

## References

- Competitive analysis session: 2026-05-08
- Templates source: `/Users/leonard/Workspace/Startup/shipwithai/src/data/templates`
- Framework source: `/Users/leonard/Workspace/Startup/Claude-knowledge/claude-md-framework`
- ECC harness-audit rubric: `everything-claude-code/commands/harness-audit.md`
- OMC deepinit bug: `github.com/Yeachan-Heo/oh-my-claudecode/issues/613`
