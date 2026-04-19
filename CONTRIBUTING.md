# Contributing to ShipWithAI Plugins

Thank you for your interest in contributing! This guide covers how to work with skill-based Claude Code plugins.

---

## Getting Started

1. **Clone** the monorepo:

```bash
git clone git@github.com:ShipWithAI/shipwithai-plugins.git
cd shipwithai-plugins
```

2. **Load a plugin** locally in Claude Code:

```bash
claude --plugin-dir ./plugins/auth
```

3. **Run tests** (if the plugin has them):

```bash
node plugins/auth/tests/run-all.js
```

## Finding Work

Look for issues labeled:

- `contributor-friendly` — Great for new contributors (Explorer tier)
- `contributor-intermediate` — For experienced contributors (Builder tier)
- `contributor-advanced` — For trusted contributors (Champion tier)
- `good-first-issue` — Your very first contribution

---

## Plugin Development Workflow

### Plan Before Execute (Mandatory for Claude Code)

When using Claude Code to modify a plugin, you MUST create a plan first.

**Step 1 — Analyze** the request category: new plugin, new skill, update/fix, or restructure.

**Step 2 — Create PLAN.md** in the plugin root with: objective, scope, file checklist, testing plan.

**Step 3 — Wait for approval.** Present the plan to the user. Do NOT proceed until confirmed.

**Step 4 — Execute** step by step, updating PLAN.md with completion status.

### Update Protocol (For Existing Plugin Changes)

Before proposing ANY changes to an existing plugin:

**AUDIT (mandatory):** Read every SKILL.md, manifest.json, CHANGELOG.md, CLAUDE.md in the plugin.

**IMPACT ANALYSIS (mandatory):** For every proposed change, document which files are modified, created, not touched, and whether it's backward compatible.

**Safety Rules:**

1. Read before write — ALWAYS read a file before modifying it
2. Edit, don't rewrite — Change specific sections, not whole files
3. One file at a time — Modify → verify → next file
4. Test after each change
5. Stay in scope — Don't fix unrelated things

**Post-Update:**

1. Run quality checklist / test suite
2. Verify all cross-references link correctly
3. Update CHANGELOG.md
4. Bump version in `.claude-plugin/plugin.json`
5. Update `manifest.json` if skills added/removed

---

## Creating a New Plugin

Use `plugins/auth/` as the reference implementation:

```bash
cp -r plugins/auth plugins/my-new-plugin
```

Then customize these files:

| File | What to change |
|---|---|
| `.claude-plugin/plugin.json` | name, description, version, author, skills |
| `manifest.json` | skillId, name, description |
| `CLAUDE.md` | CONFIG section, file locations, naming rules |
| `skills/*/SKILL.md` | Your skill's decision framework and workflow |
| `skills/*/evals/evals.json` | Your test prompts (minimum 5) |
| `README.md` | User-facing docs |

### Required Files Checklist

- [ ] `.claude-plugin/plugin.json`
- [ ] `manifest.json`
- [ ] `skills/<skill>/SKILL.md` (< 200 lines)
- [ ] `skills/<skill>/evals/evals.json` (5+ prompts)
- [ ] `CLAUDE.md`
- [ ] `README.md`
- [ ] `CHANGELOG.md`
- [ ] `CONTRIBUTING.md` (plugin-specific workflow)

---

## Making Changes

### Branch naming

Use the format `type/plugin-name/short-description`:

- `fix/auth/clerk-middleware-matcher`
- `feat/auth/apple-oauth-guide`
- `docs/blog-writer/seo-checklist`

### Commit messages

Keep them short and descriptive:

- `fix(auth): add language tags to firebase guide code blocks`
- `feat(auth): add Apple Sign-In to oauth guide`
- `docs(blog-writer): update keyword research workflow`

### Quality Rules

These apply to ALL plugins:

| Rule | Limit |
|---|---|
| SKILL.md | < 200 lines |
| Bundle files | < 500 lines each |
| Reference files | < 150 lines each |
| Evals per skill | minimum 5 test prompts |
| Code blocks | Must have language tags |
| Secrets | Must use `process.env`, never hardcoded |

---

## Pull Request Process

1. Open a PR with a clear description of what changed and why
2. Fill in the PR template (plugin affected, changes, testing)
3. At least 1 reviewer must approve
4. CI must pass (if plugin has automated tests)
5. Squash-merge into main

### Code Review Process

```
Author → PR → Leonard (delivery check) → Link (quality gate, CODEOWNERS) → Merge
```

---

## Contributor Tiers

| Tier | Requirements | What you get |
|---|---|---|
| **Explorer** | New contributor | Repo fork access, mentoring |
| **Builder** | 3+ PRs, 4 weeks consistent | Branch access, internal channels |
| **Champion** | 5+ features, mentored others | Direct push, sprint planning invite |

See [shipwithai-community/contributors/](../shipwithai-community/contributors/) for details.

---

## Questions?

- Open a Discussion on this repo
- Ask in the community Discord/Slack
- Tag @Leonard or @Link in your PR

*We value every contribution — small fixes are just as important as big features!*
