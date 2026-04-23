# shipwithai-plugins

**SDLC Toolkit** — Monorepo chứa toàn bộ Claude Code plugins của ShipWithAI, covering full Software Development Life Cycle.

> Core IP của ShipWithAI. Mỗi plugin giải quyết 1 pain point cụ thể trong SDLC.

---

## Quick Start

### Install via Claude Code (no cloning required)

Open Claude Code in any directory and run:

```bash
# Register the ShipWithAI marketplace (one-time setup)
/plugin marketplace add ShipWithAI/shipwithai-plugins

# Install any plugin by name
/plugin install shipwithai-auth@shipwithai
```

### Local development (see [CONTRIBUTING.md](./CONTRIBUTING.md))

```bash
git clone git@github.com:ShipWithAI/shipwithai-plugins.git
cd shipwithai-plugins

# Load a plugin for a single session
claude --plugin-dir ./plugins/auth

# Or register the local repo as a marketplace
/plugin marketplace add /absolute/path/to/shipwithai-plugins
/plugin install shipwithai-auth@shipwithai
```

---

## Plugin Map

### Free Tier (7 plugins — 5 SDLC phases)

| Plugin | SDLC Phase | Status |
|---|---|---|
| `auth` | Authentication | 🟢 Active (v1.4.0) |
| `planning-assistant` | Planning | 🔴 Not started |
| `code-scaffolder` | Coding | 🔴 Not started |
| `code-reviewer-lite` | Coding | 🔴 Not started |
| `test-generator-lite` | Testing | 🔴 Not started |
| `doc-generator` | Documentation | 🔴 Not started |
| `readme-writer` | Documentation | 🔴 Not started |

### Dev Tier — $49/mo (15 plugins — 7 SDLC phases)

| Plugin | SDLC Phase | Status |
|---|---|---|
| _8 more plugins_ | +Design, Deployment | 🔴 Not started |

### Team Tier — $99/mo (30 plugins — 8 SDLC phases)

| Plugin | SDLC Phase | Status |
|---|---|---|
| _15 more plugins_ | +Monitoring, all phases | 🔴 Not started |

*Full plugin list: [shipwithai-vision/12-sdlc-toolkit-roadmap.md]*

---

## Ownership

| Role | Person | Responsibility |
|---|---|---|
| **Tech Lead** | Link | Architecture, code review (CODEOWNERS), product direction |
| **Engineering Manager** | Leonard | Sprint assignment, contributor triage, delivery |
| **Plugin Engineer** | Ryan | Web/backend plugin track |
| **Tool Engineer** | Sơn Anh | Tool/automation plugin track |
| **Dev (task-based)** | Long | Assigned issues (supervised) |
| **Contributors** | Community | `contributor-friendly` labeled issues |

**Domain:** D1 Product & Engineering
**Visibility:** Private (dev) → Individual plugins published publicly

---

## Repo Structure

```
shipwithai-plugins/
├── plugins/                      Each plugin is a self-contained folder
│   ├── auth/                     Reference implementation ✅
│   │   ├── .claude-plugin/
│   │   │   ├── plugin.json       Plugin metadata (name, version, author)
│   │   │   └── marketplace.json  Marketplace listing schema
│   │   ├── skills/
│   │   │   └── auth-setup/
│   │   │       ├── SKILL.md      Slim router + decision framework (< 200 lines)
│   │   │       ├── bundles/      Provider-specific complete guides (< 500 lines each)
│   │   │       ├── references/   Cross-cutting guides (< 150 lines each)
│   │   │       ├── assets/       Code templates, configs, components
│   │   │       ├── scripts/      Helper scripts
│   │   │       └── evals/        Test prompts (5+ per skill)
│   │   ├── commands/             Slash command stubs
│   │   ├── hooks/                Plugin hooks
│   │   ├── tests/                Automated test suite
│   │   ├── manifest.json         Skills registry
│   │   ├── CLAUDE.md             Runtime instructions for Claude Code
│   │   ├── CONTRIBUTING.md       Developer workflow
│   │   ├── QUALITY-STANDARDS.md  Ship criteria
│   │   ├── CHANGELOG.md          Version history
│   │   └── README.md             User-facing docs
│   ├── blog-writer/              Next plugin (Ryan)
│   └── ... (30 plugins)
├── docs/                         Architecture & cross-plugin guides
├── .github/                      CI/CD, issue templates, PR template
└── .gitignore
```

---

## Plugin Architecture

Each plugin is a **skill-based Claude Code plugin** — no npm build/publish needed. Plugins provide skills (markdown knowledge + code templates) that Claude reads and executes at runtime.

See [docs/architecture.md](./docs/architecture.md) for full details.

---

## Development Guide

### Create a New Plugin

Use the `auth` plugin as a reference:

```bash
# Copy the skeleton (remove auth-specific content)
cp -r plugins/auth plugins/my-new-plugin

# Edit plugin metadata
vim plugins/my-new-plugin/.claude-plugin/plugin.json

# Create your first skill
mkdir -p plugins/my-new-plugin/skills/my-skill
vim plugins/my-new-plugin/skills/my-skill/SKILL.md
```

### Plugin Conventions

Every plugin MUST have:

| File | Purpose |
|---|---|
| `.claude-plugin/plugin.json` | Plugin metadata (name, version, description, author, skills) |
| `manifest.json` | Skills registry (skillId, version, enabled) |
| `skills/<skill-name>/SKILL.md` | Main skill file — router + decision framework (< 200 lines) |
| `skills/<skill-name>/evals/evals.json` | Test prompts (minimum 5) |
| `CLAUDE.md` | Runtime config + naming rules + quality standards |
| `README.md` | User-facing documentation |
| `CHANGELOG.md` | Version history |

### Code Review Process

```
Author → PR → Leonard (delivery check) → Link (quality gate, CODEOWNERS) → Merge
```

Contributors: See [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## Publish Model

```
Develop: 1 monorepo (all plugins in plugins/)
    ↓
Publish: Each plugin independently to Claude plugin marketplace
    ↓
Users: Install individual plugins via Claude Code
```

---

*Cross-ref: [shipwithai-product](../shipwithai-product/) for PRDs & specs*
*Cross-ref: [shipwithai-vision/12-sdlc-toolkit-roadmap.md](../shipwithai-vision/12-sdlc-toolkit-roadmap.md) for full roadmap*
