# Plugin Roadmap Research — SDLC Ecosystem Analysis

*Researched: 2026-05-06*

---

## Bức tranh ecosystem

Có ~9,000 plugins tồn tại nhưng chỉ ~100 production-quality. Đã có vài SDLC-specific repos (`alexmensch/claude-sdlc-plugins`, `danielscholl/claude-sdlc`, `shamkhall/sdlc`) nhưng hầu hết là thin wrappers — không có depth như auth plugin của mình (60+ pitfalls, doctor command, theme detection...).

**Lợi thế cạnh tranh của ShipWithAI:** depth + indie hacker targeting. Không nên compete bằng số lượng.

---

## Ecosystem hiện tại

### Official Marketplace
- Anthropic official: [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) — ~36 plugins tại launch (Dec 2025)
- Discovery docs: [code.claude.com/docs/en/discover-plugins](https://code.claude.com/docs/en/discover-plugins)
- Third-party index: [claudemarketplaces.com](https://claudemarketplaces.com/) — 4,200+ skills, 770+ MCP servers

### Plugins SDLC đã tồn tại
- `alexmensch/claude-sdlc-plugins` — dedicated SDLC plugin marketplace
- `danielscholl/claude-sdlc` — SDLC tooling plugin
- `shamkhall/sdlc` — maps agile roles (tech-lead, QA, security, devops) to LLM agents
- `rohitg00/awesome-claude-code-toolkit` — 135 agents, 12-angle code review, compliance frameworks
- `oh-my-claudecode` — multi-agent orchestration, autopilot modes

### Aggregators
- [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)
- [ComposioHQ/awesome-claude-plugins](https://github.com/ComposioHQ/awesome-claude-plugins)
- [firecrawl.dev/blog/best-claude-code-plugins](https://www.firecrawl.dev/blog/best-claude-code-plugins)

---

## Đánh giá lại roadmap theo data

### Giữ nguyên — confirmed high value

| Plugin | Frequency | Lý do |
|---|---|---|
| `code-reviewer-lite` | Per PR (2-5x/week) | 81% quality improvement, solo devs có 0 reviewer |
| `test-generator-lite` | Daily | Highest-skipped task, community #1 pain |
| `readme-writer` | Weekly | Deferred indefinitely by devs |

### Bỏ hoặc delay

| Plugin | Lý do |
|---|---|
| `planning-assistant` | Ecosystem đã crowded, scope rộng, khó differentiate |
| `doc-generator` | Overlap với `readme-writer`, nên merge lại |
| `code-scaffolder` | Complex, cần deep framework knowledge |

### Thêm mới — gaps KHÔNG có trong roadmap, high value

**1. `pr-description-writer`** — Quick win nhất
- Daily use (per PR)
- Solo devs skip PR descriptions hoàn toàn
- Input: `git diff` → Output: structured PR body
- Không có plugin nào làm tốt trong ecosystem hiện tại

**2. `env-doctor`**
- Complements auth plugin tự nhiên
- Kiểm tra: hardcoded secrets, `.env.example` completeness, startup config
- Auth plugin đã có `validate-command.py` — có thể reuse logic

**3. `ci-setup` / `github-actions`**
- Per-project, high friction
- Wrap GitHub Actions + Vercel/Railway/Fly.io deploy configs
- Không ai làm tốt cho indie hackers (most CI plugins are enterprise-focused)

**4. `changelog-generator`**
- `git log` + PR descriptions → CHANGELOG entries
- Auth plugin đã có CHANGELOG.md discipline — có thể automate pattern này
- Weekly use, tedious manual task

---

## Top 5 pain points của indie hackers (theo research)

| Rank | Task | Frequency | Trong roadmap? |
|---|---|---|---|
| 1 | Test generation | Daily | ✅ `test-generator-lite` |
| 2 | CI/CD setup | Per project | ❌ Missing |
| 3 | Code review | Per PR (2-5x/week) | ✅ `code-reviewer-lite` |
| 4 | Docs / README | Weekly | ✅ `readme-writer` |
| 5 | Env/secrets setup | Per project | ❌ Missing (`env-doctor`) |

### Gaps không có trong roadmap
- **`ci-setup`** — GitHub Actions + Vercel/Railway/Fly.io
- **`env-doctor`** — Secrets audit, `.env.example` hygiene
- **`pr-description-writer`** — git diff → PR body (highest daily use, quick to build)
- **`changelog-generator`** — git log → CHANGELOG entries
- **`adr-generator`** — Architecture Decision Records inline capture

---

## Đề xuất thứ tự ship

```
Q2 2026:
  1. pr-description-writer  ← Quick win, daily use, community value ngay lập tức
  2. readme-writer           ← Auth v1.7.1 đã có pattern, fast to generalize

Q3 2026:
  3. env-doctor              ← Complements auth, security angle
  4. code-reviewer-lite      ← High value, cần design tốt để differentiate
  5. test-generator-lite     ← Hardest to do RIGHT, cần context-awareness

Q4 2026:
  6. ci-setup                ← Per-project, high effort but high payoff
  7. changelog-generator     ← Small utility, bundle vào release workflow
```

---

## Frequency summary

| Task | Frequency |
|---|---|
| Test generation | Daily |
| Code review | Per PR (2–5x/week) |
| PR description | Per PR (2–5x/week) |
| Changelog | Per release (weekly) |
| Docs / README | Per feature (weekly) |
| CI/CD setup | Per project (monthly) |
| Env/secrets audit | Per project (monthly) |
| ADR capture | Per decision (ad hoc) |