# Contributing to ShipWithAI Auth

Welcome to the team! This guide covers everything you need to contribute to the shipwithai-auth plugin.

## Getting Started

1. Clone the repo and install test dependencies:

```bash
git clone https://github.com/shipwithai/shipwithai-auth.git
cd shipwithai-auth
npm install
```

2. Run the test suite to make sure everything passes:

```bash
node tests/run-all.js
```

3. Load the plugin locally in Claude Code:

```bash
claude --plugin-dir ./shipwithai-auth
```

## Project Structure

```text
shipwithai-auth/
├── .claude-plugin/plugin.json    # Plugin metadata (name, version, description)
├── skills/auth-setup/
│   ├── SKILL.md                  # Main skill entry point (decision framework)
│   ├── references/               # 10 guides (providers, pitfalls, integration)
│   └── assets/
│       ├── components/
│       │   ├── better-auth/      # Better Auth-specific UI components (8 files)
│       │   ├── firebase/         # Firebase Auth-specific UI components (8 files)
│       │   └── shared/           # Provider-agnostic components (globals.css, dashboard-page.tsx)
│       ├── middleware/
│       │   ├── better-auth/      # Better Auth middleware (nextjs, express, hono)
│       │   └── firebase/         # Firebase Auth middleware (nextjs, express, hono)
│       ├── config/               # Provider config templates + env examples
│       └── db/                   # Database schema templates (Drizzle, Prisma)
├── commands/setup.md             # Interactive setup wizard
├── hooks/                        # Plugin hooks
├── tests/run-all.js              # Automated test suite (86 tests)
├── docs/                         # Internal strategy docs
├── QUALITY-STANDARDS.md          # Evaluation criteria for shipping
└── README.md
```

## Quality Rules

These rules are enforced by `node tests/run-all.js` and must pass before any PR is merged.

**Reference files:** Every markdown file in `references/` must be **150 lines or fewer**. This keeps Claude's context window efficient. If a guide is too long, split content into the corresponding `assets/` file instead.

**Code blocks:** Every fenced code block (opening AND closing fence) must have a language tag. The test checks for bare `` ``` `` followed by a newline. Valid tags: `ts`, `tsx`, `bash`, `env`, `sql`, `prisma`, `json`, `text`.

**TypeScript:** All `.ts` and `.tsx` files in `assets/` must pass syntax validation.

**Security:** No hardcoded secrets. All sensitive values must use `process.env`. Cookies must have `httpOnly: true`.

**Components:** Every React component must have `"use client"` directive and `export default`. Currently supporting Better Auth and Firebase Auth (Clerk, Auth.js, Supabase Auth coming soon).

## Making Changes

### Branch naming

Use the format `type/short-description`:

- `fix/clerk-middleware-matcher`
- `feat/apple-oauth-guide`
- `docs/better-auth-gotchas`

### Commit messages

Keep them short and descriptive:

- `fix: add language tags to firebase guide code blocks`
- `feat: add Apple Sign-In to oauth guide`
- `docs: update cost comparison table`

### Editing reference guides

When editing files in `references/`, always check line count after your changes:

```bash
wc -l skills/auth-setup/references/your-file.md
```

Must be 150 or fewer. If you need more space, move code examples to `assets/` and reference them.

### Editing UI components

Components in `assets/components/` are organized by provider:

- `assets/components/better-auth/` — 8 Better Auth-specific components
- `assets/components/firebase/` — 8 Firebase Auth-specific components
- `assets/components/shared/` — Provider-agnostic files (globals.css, dashboard-page.tsx)

When editing a provider's components, only modify files within that provider's folder. Shared components must remain provider-agnostic.

### Editing middleware

Middleware in `assets/middleware/` is similarly organized by provider:

- `assets/middleware/better-auth/` — Next.js, Express, Hono middleware
- `assets/middleware/firebase/` — Next.js, Express, Hono middleware

Each middleware file is production-ready (uncommented, no multi-provider blocks). The original multi-provider files in `assets/middleware/` root are deprecated.

### Adding a new reference file

1. Add the file to `skills/auth-setup/references/`
2. Update `SKILL.md` to reference it
3. Add test coverage in `tests/run-all.js` if needed
4. Ensure it stays under 150 lines

## Testing

Run the full suite before every PR:

```bash
node tests/run-all.js
```

The suite covers 8 categories: plugin structure, TypeScript syntax, documentation quality, security audit, provider configs, schema validation, component consistency, and cross-references.

**Minimum pass rate to merge: 85% (currently targeting 100%).**

For manual testing against real OAuth credentials, follow the checklist in `docs/shipwithai-auth-testing-checklist.docx`.

## Provider Assignment

Each team member owns 1-2 providers. Your provider is your responsibility for guide accuracy, config correctness, and gotchas. Coordinate on Slack before editing another member's provider guide.

| Provider | Primary | Secondary | Status |
|----------|---------|-----------|--------|
| Better Auth | — | — | Supported |
| Firebase Auth | Ethan | — | Supported |
| Clerk | — | — | Coming soon |
| Auth.js | — | — | Coming soon |
| Supabase Auth | — | — | Coming soon |

Fill in assignments as the team grows.

## Review Process

1. Open a PR with a clear description of what changed and why
2. At least 1 reviewer must approve (provider owner if touching their guide)
3. CI must pass (`node tests/run-all.js` = 86/86)
4. Squash-merge into main

## Reporting Issues

Use GitHub Issues with these labels:

- `bug` — Something doesn't work as documented
- `guide-error` — Code snippet doesn't compile or is outdated
- `enhancement` — New feature or improvement
- `provider: <name>` — Tag the specific auth provider

## Code of Conduct

Be kind, be helpful, ship quality. We're building something developers pay for — every code snippet must work, every guide must be accurate, every gotcha must be real.

Questions? Reach Ethan at truongnguyenptit@gmail.com or on the team Slack.
