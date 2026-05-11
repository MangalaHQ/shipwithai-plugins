# shipwithai-harness — Plugin Design

> Brainstorm output từ session 2026-05-08.
> Tiếp nối research tại [harness-plugin-research.md](harness-plugin-research.md).

---

## 5 Harness Layers

Một dự án phần mềm cần 5 lớp để Claude Code hoạt động hiệu quả:

```
Layer 1: Memory        → CLAUDE.md (filled), MEMORY.md, docs/ARCHITECTURE.md
Layer 2: Tools         → MCP servers, custom commands (.claude/commands/)
Layer 3: Permission    → settings.json deny/allow/ask rules
Layer 4: Hooks         → validate-command.py, protect-files.py, PostToolUse formatters
Layer 5: Observability → audit-log.py, cost tracking, session logs
```

---

## MVP Scope (v1.0)

| Layer | Trạng thái | Lý do |
|-------|-----------|-------|
| Layer 1 Memory | ✅ | Core value — auto-detect stack, fill CLAUDE.md + MEMORY.md + docs/ARCHITECTURE.md |
| Layer 3 Permission | ✅ | settings.json balanced defaults |
| Layer 4 Hooks (partial) | ✅ | validate-command.py + protect-files.py |
| Layer 2 Tools | ❌ v1.1 | Quá phức tạp, low value cho solo indie hacker |
| Layer 5 Observability | ❌ v1.1 | Compliance use case, overkill cho v1.0 |

**Tại sao Layer 4 vào MVP dù chỉ là partial:**
Framework claude-md-framework cảnh báo rõ: *"Bash patterns in settings.json are FRAGILE — MUST be combined with Layer 4 hooks."* validate-command.py bắt được fork bomb, netcat, base64-decode-pipe — những pattern mà settings.json regex không cover được. Plugin tự chạy `chmod +x` để không cần user làm tay.

---

## Architecture

```
plugins/harness/
  skills/
    harness-setup/    ← shared core → bundles per stack
    harness-doctor/   ← reuse auth-doctor pattern
```

### Stack Detection

| File detected | Stack |
|--------------|-------|
| `pom.xml` | Spring Boot |
| `package.json` + `next` dep | Next.js |
| `composer.json` | Laravel |

**Stack priority v1.0:** Next.js → Laravel → Spring Boot

### Content Layer (đã có sẵn)

Templates production-ready tại `/src/data/templates` của shipwithai app — 4 phases, 10 stacks, token system (`{{TOKEN}}` syntax). Việc còn lại là build **intelligence layer**: auto-detect stack → fill tokens → generate files.

---

## UX Design

- **Phase numbers KHÔNG bao giờ hiển thị cho user** — internal organization tool only
- **Solo indie hacker flow:** 1 smart default, chỉ hỏi 2 thứ:
  1. Describe your project (1 sentence)
  2. Any conventions or rules to add? (optional)
- **Team detection:** harness-doctor tự suggest team features khi phát hiện signals (multi-author git log, contributors field)
- **Pattern:** Opinionated Default — không có tier selection UI, chỉ hỏi khi thực sự ambiguous

---

## harness-doctor

Reuse pattern từ auth-doctor: **scan → score → report → fix**

Categories:
- **Memory** — CLAUDE.md filled? ARCHITECTURE.md tồn tại?
- **Permission** — settings.json quá strict hay quá loose?
- **Hooks** — hooks present? executable? wired đúng trong settings.json?
- **Stack** — detected stack khớp với CLAUDE.md config?

---

## Bugs Cần Fix Trước Ship (settings.json Phase 2)

1. `curl`/`npx` bị over-block — breaks legitimate dev tools
2. `Write(docs/**)` conflict với `Write(docs/decisions/DECISION-LOG.md)` — overlap rule
3. `scan-output.py` chưa được wire làm PostToolUse hook trong Phase 2

---

## Next Step

Tạo `PLAN.md` → get approval → implement `harness-setup` skill trước.
