# Plugin Installation Guide

How to install and use ShipWithAI plugins.

---

## Method 0: Cowork — Claude Desktop App (Recommended for non-developers)

The easiest way to use ShipWithAI plugins — no terminal required.

1. Open the **Claude desktop app** and enable Cowork mode
   (Settings → Desktop app → Cowork)
2. Open **Settings → Extensions → Browse Extension → Plugins → Personal** and click **Add marketplace**
3. Paste the marketplace URL:
   ```
   https://github.com/MangalaHQ/shipwithai-plugins
   ```
4. Open the **Plugins** tab, locate `shipwithai-auth`, and click **Install**
5. In any Cowork session, trigger the plugin in plain English:
   > "Set up authentication for my Next.js project"

   Or call a skill explicitly: `/shipwithai-auth:setup`

The marketplace stays registered across sessions, and you'll be notified
when new plugin versions are published.

---

## Method 1: Claude Code CLI Marketplace

Register the marketplace, then install any plugin by name:

```bash
# One-time: register the marketplace
/plugin marketplace add MangalaHQ/shipwithai-plugins

# Install the plugin
/plugin install shipwithai-auth@shipwithai
```

Once installed, use the plugin in any project:

```bash
cd your-nextjs-project
/shipwithai-auth:setup
```

---

## Method 2: Sparse Checkout (Single Plugin)

Clone only the plugin you need without downloading the entire monorepo:

```bash
# Clone the repo skeleton (no file content yet)
git clone --filter=blob:none --sparse \
  https://github.com/MangalaHQ/shipwithai-plugins.git
cd shipwithai-plugins

# Check out only the auth plugin
git sparse-checkout set plugins/auth

# Load it in Claude Code
claude --plugin-dir ./plugins/auth
```

To add more plugins later:

```bash
git sparse-checkout add plugins/blog-writer
```

To see which plugins you have checked out:

```bash
git sparse-checkout list
```

---

## Method 3: Full Clone (All Plugins)

For team members or contributors who need the entire repo:

```bash
git clone https://github.com/MangalaHQ/shipwithai-plugins.git
cd shipwithai-plugins

# Load a specific plugin
claude --plugin-dir ./plugins/auth
```

---

## After Installation

Each plugin has a slash command to get started. For example:

| Plugin | Command | What it does |
|---|---|---|
| auth | `/shipwithai-auth:setup` | Interactive auth setup wizard |

Run the command in your project directory and follow the prompts.

---

## Troubleshooting

**"Plugin not found" error:**
Make sure you're pointing to the plugin directory (e.g., `plugins/auth/`), not the monorepo root.

**"SKILL.md not found" error:**
Check that the plugin has `skills/<skill-name>/SKILL.md`. Run `ls plugins/auth/skills/` to verify.

**Sparse checkout not downloading files:**
Run `git sparse-checkout reapply` to force re-download.
