# ShipWithAI Auth Plugin

Production-ready authentication for any web app in under 45 minutes.

## What's Inside

- **2 auth providers:** Better Auth, Firebase Auth (Clerk, Auth.js, Supabase Auth coming soon)
- **Decision framework:** Helps you choose the right provider for your project
- **Google OAuth:** Social login setup with guides (GitHub & Apple coming soon)
- **UI components:** Login, register, forgot password pages (shadcn/ui)
- **Database schemas:** Drizzle ORM, Prisma, Supabase SQL templates
- **60 production pitfalls:** Real bugs from production apps and how to avoid them
- **Interactive wizard:** `/shipwithai-auth:setup` command for guided setup

## Quick Start

### Install the plugin

```bash
claude --plugin-dir ./shipwithai-auth
```

### Run the setup wizard

```bash
/shipwithai-auth:setup
```

The wizard will ask you to choose a provider, OAuth options, and database ORM — then generate everything.

### Or just chat

```text
> Set up Firebase Auth with Google login for my Next.js app
```

Claude will automatically use the auth-setup skill.

## Supported Providers

| Provider | Cost | Best For | Status |
|----------|------|----------|--------|
| Better Auth | Free forever | Self-hosted, full control | **Supported** |
| Firebase Auth | Free < 50K MAU | Mobile/KMP, Google ecosystem | **Supported** |
| Clerk | Free < 10K MAU | Fastest setup, pre-built UI | Coming soon |
| Auth.js | Free forever | Lightweight, educational | Coming soon |
| Supabase Auth | Free < 50K MAU | Postgres-native, RLS | Coming soon |

## File Structure

```text
shipwithai-auth/
├── .claude-plugin/plugin.json       # Plugin metadata
├── skills/auth-setup/
│   ├── SKILL.md                     # Decision framework + quick start
│   ├── references/                  # Detailed guides per provider
│   └── assets/                      # UI components, schemas, configs
├── commands/setup.md                # Interactive wizard
└── README.md
```

## For Contributors

Claude Code conventions, SOT docs, and security guardrails live in `CLAUDE.md`, `.claude/rules/`, and `docs/`. Before contributing:

```bash
cp CLAUDE.local.md.example CLAUDE.local.md  # then edit blueprint_path
```

See `CLAUDE.md` → "SOT References" for the full map, and `docs/decisions/` for architectural decisions.

## Links

- Website: https://shipwithai.io
- Full kit: https://shipwithai.io/plugins/auth
- Author: Ethan (truongnguyenptit@gmail.com)
