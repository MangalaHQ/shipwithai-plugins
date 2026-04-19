# Auth Theme Presets

Two curated themes for auth UI. The AI auto-selects based on project signals — no user interaction needed.

## Themes

| Theme | File | Style | Font | Best for |
|-------|------|-------|------|----------|
| **Ocean** | `ocean.css` | Deep blue, dark-first | DM Sans | SaaS, dashboards, dev tools, B2B, API products |
| **Sunrise** | `sunrise.css` | Warm light, friendly | Outfit | Community, marketplace, consumer, blogs, education, e-commerce |

## How it works

The AI picks the theme during Step 1b based on project context:

1. **Scenario A/B/D** — Existing design system detected → theme presets are NOT used (inherit existing)
2. **Scenario C** — New standalone project → AI reads `package.json` name/description + README to infer domain:
   - SaaS / dashboard / API / dev tool / analytics / admin → **Ocean**
   - Consumer / blog / shop / community / education / portfolio → **Sunrise**
   - Ambiguous or unclear → **Ocean** (default)

## What each file contains

Each `.css` file is a drop-in replacement for `globals.css`. It includes:
- Tailwind directives (`@tailwind base/components/utilities`)
- Light mode CSS variables (`:root`)
- Dark mode CSS variables (`.dark`)
- Base layer reset (`border-border`, `bg-background text-foreground`)

## Font setup

Each theme uses a specific Google Font. The AI must also:
1. Add the font import to `globals.css` (or `layout.tsx`)
2. Update `layout.tsx` to use the font family instead of default Geist/Inter
