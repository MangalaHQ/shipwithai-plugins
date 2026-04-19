# Plugin Architecture

## Overview

All ShipWithAI plugins are **skill-based Claude Code plugins**. They provide structured knowledge, decision frameworks, code templates, and automated workflows that Claude reads and executes at runtime. There is no build step, no npm publish, no compiled code.

---

## Plugin Type: Skill-Based

A skill-based plugin consists of markdown files (knowledge), code templates (assets), and evaluation prompts (evals). Claude Code loads the plugin, reads the skill files, and uses them to guide the user through a workflow.

```
User runs command → Claude reads SKILL.md → Routes to bundle/reference → Generates code from assets
```

### Why Skill-Based (Not Code-Based)

- **No build step:** Plugin is ready to use immediately after cloning
- **No runtime dependencies:** No node_modules, no npm install, no supply chain risk
- **Claude-native:** Leverages Claude's ability to read and synthesize markdown
- **Easy to maintain:** Update a .md file, not a TypeScript codebase
- **Easy to review:** Every change is a readable text diff

---

## Plugin Lifecycle

```
Install → Claude reads CLAUDE.md → User runs command → Claude reads SKILL.md
    → Routes to correct bundle → Reads assets → Generates code → User reviews
```

## Directory Convention

Every plugin lives in `plugins/<plugin-name>/` and follows this structure:

```
plugins/<plugin-name>/
├── .claude-plugin/
│   ├── plugin.json              # REQUIRED: Plugin metadata
│   └── marketplace.json         # OPTIONAL: Marketplace listing
├── .claude/
│   ├── settings.json            # OPTIONAL: Hook configuration
│   └── hooks/                   # OPTIONAL: Pre/post tool-use hooks
├── skills/<skill-name>/
│   ├── SKILL.md                 # REQUIRED: Main entry point (< 200 lines)
│   ├── bundles/                 # Domain-specific complete guides (< 500 lines each)
│   ├── references/              # Cross-cutting guides (< 150 lines each)
│   ├── assets/                  # Code templates, configs, components
│   │   ├── shared/              # Cross-domain shared files
│   │   └── <domain>/            # Domain-specific files
│   ├── scripts/                 # OPTIONAL: Helper/automation scripts
│   └── evals/
│       └── evals.json           # REQUIRED: Test prompts (minimum 5)
├── commands/                    # OPTIONAL: Slash command stubs
├── hooks/                       # OPTIONAL: Plugin-level hooks
├── tests/                       # OPTIONAL: Automated test suite
├── manifest.json                # REQUIRED: Skills registry
├── CLAUDE.md                    # REQUIRED: Runtime instructions
├── CONTRIBUTING.md              # REQUIRED: Developer workflow
├── QUALITY-STANDARDS.md         # RECOMMENDED: Ship criteria
├── CHANGELOG.md                 # REQUIRED: Version history
└── README.md                    # REQUIRED: User-facing docs
```

---

## Key Files Explained

### `.claude-plugin/plugin.json`

Plugin identity. Used by Claude Code to register the plugin.

```json
{
  "name": "shipwithai-auth",
  "description": "Set up production-ready auth in minutes.",
  "version": "1.4.0",
  "author": {
    "name": "Ethan",
    "url": "https://shipwithai.io"
  },
  "skills": ["./skills/auth-setup"]
}
```

### `manifest.json`

Skills registry. Lists all skills in the plugin with version and status.

```json
{
  "lastUpdated": 1744108800000,
  "skills": [
    {
      "skillId": "auth-setup",
      "name": "auth-setup",
      "description": "Set up authentication for web apps.",
      "version": "2.0.0",
      "enabled": true
    }
  ]
}
```

### `SKILL.md` — The Router

The main skill file is a **slim router** (< 200 lines). It does NOT contain full implementation details. Instead, it:

1. Provides a decision framework (comparison tables, use case recommendations)
2. Routes to the correct bundle based on user's choice
3. Defines the step-by-step workflow

### `bundles/` — Complete Domain Guides

Each bundle is a **self-contained, copy-paste guide** (< 500 lines) for one specific domain/provider/approach. Bundles include installation, config, code, and pitfalls all in one file.

### `evals/evals.json` — Test Prompts

Every skill must have at least 5 test prompts that cover:

- Happy path (normal usage)
- Edge cases (unusual configurations)
- Regression tests (verify old bugs don't resurface)

---

## Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Plugin directory | lowercase-dashes | `plugins/auth`, `plugins/blog-writer` |
| Skill directory | lowercase-dashes | `skills/auth-setup` |
| Skill file | UPPERCASE.md | `SKILL.md` |
| Bundle files | lowercase-dashes.md | `better-auth.md`, `shared-pitfalls.md` |
| Commands | `shipwithai-<plugin>:<command>` | `shipwithai-auth:setup` |
| Env vars | UPPER_SNAKE_CASE | `DATABASE_URL` |

---

## Quality Standards

| Rule | Limit |
|---|---|
| SKILL.md | < 200 lines |
| Bundle files | < 500 lines each |
| Reference files | < 150 lines each |
| Code examples in SKILL.md | < 20 lines (full code → assets/) |
| Evals per skill | minimum 5 test prompts |

---

## Security

Plugins that involve npm packages MUST enforce:

- `--ignore-scripts` on all npm install (via `.claude/hooks/`)
- `--save-exact` to pin versions
- No hardcoded secrets (use `process.env`)
- Cookies: `httpOnly: true`, `sameSite: "lax"` minimum

---

## Cross-Plugin Rules

- Each plugin is **self-contained** in `plugins/<name>/`
- **No cross-plugin imports** — plugins are independent
- Shared patterns should be documented in `docs/` at the repo root
- Each plugin is **independently publishable** to the Claude plugin marketplace

---

*Reference implementation: `plugins/auth/` — see its CLAUDE.md, CONTRIBUTING.md, and QUALITY-STANDARDS.md for detailed examples.*
