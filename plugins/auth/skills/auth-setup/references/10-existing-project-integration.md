# Existing Project Integration — Theme Detection & Adaptation

When adding auth to an existing project with an established design system,
the auth components must match the project's visual language. This guide
covers how to detect the existing theme and adapt auth components to fit.

## How It Works

Auth components use shadcn/ui, which resolves all colors, fonts, and radii
through CSS variables in `globals.css`. By mapping the existing project's
design tokens to these CSS variables, components adapt automatically —
**no component code changes needed**.

## Theme Detection

Run the detection script or have Claude read the project files manually:

```bash
# For existing projects:
npx ts-node scripts/detect-theme.ts /path/to/project

# For new projects inside/alongside an existing project:
npx ts-node scripts/detect-theme.ts /path/to/new-app --context /path/to/parent-project
```

The script classifies the project into one of four scenarios:

### Scenario A: Project Has shadcn/ui

**Detection signals:** `components.json` exists, CSS variables like `--primary`, `--background` present in `globals.css`.

**Action: SKIP globals.css** — project already has compatible CSS variables. Auth components will inherit the existing theme automatically.

**What to check:**
- Verify `--radius` value matches desired border-radius for auth cards
- Verify `--destructive` exists (used for error states in forms)
- If `components.json` has a `prefix`, add it to auth component classNames

### Scenario B: Has Tailwind, No shadcn/ui

**Detection signals:** `tailwind.config.ts` exists, `tailwindcss` in dependencies, but no `components.json`.

**Action: MERGE** — add shadcn/ui CSS variables into existing `globals.css`.

**Steps:**
1. Read existing `globals.css` to preserve custom styles
2. Add the `@layer base { :root { ... } }` block with shadcn/ui variables
3. Map existing Tailwind custom colors to shadcn variables:

```css
/* Example: project uses blue-600 as primary */
:root {
  --primary: 221.2 83.2% 53.3%;          /* maps to project's blue-600 */
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;            /* maps to project's gray-100 */
  /* ... rest of variables ... */
}
```

4. Install `tailwindcss-animate` if missing
5. Run `npx shadcn@2.1.0 init -d` to set up component infrastructure

**Color mapping reference (Tailwind defaults → HSL):**

| Tailwind color | HSL value |
|----------------|-----------|
| `blue-600` | `221.2 83.2% 53.3%` |
| `indigo-600` | `238.7 83.5% 66.7%` |
| `violet-600` | `271.5 81.3% 55.9%` |
| `emerald-600` | `160.1 84.1% 39.4%` |
| `rose-600` | `346.8 77.2% 49.8%` |
| `gray-900` | `222.2 84% 4.9%` |
| `gray-50` | `210 40% 98%` |

### Scenario C: No Tailwind

**Detection signals:** No `tailwind.config.ts`, no `tailwindcss` in dependencies.

**Action: GENERATE** — full setup required.

**Steps:**
1. Install Tailwind + PostCSS: `npm install -D tailwindcss@3 postcss autoprefixer`
2. Install animate plugin: `npm install tailwindcss-animate`
3. Create `tailwind.config.ts` with shadcn/ui theme
4. Copy `globals.css` from `assets/components/shared/globals.css`
5. Run `npx shadcn@2.1.0 init -d`

### Scenario D: New Project Inside/Alongside Existing Project

**Detection signals:** User specifies `--context /path/to/parent`. Parent project has CSS files with design tokens (custom properties like `--color-bg-*`, `--color-accent-*`, font declarations).

**Common cases:**
- Next.js auth app inside an Astro/Starlight docs site
- Separate auth micro-frontend alongside a main app
- New app in a monorepo that should match the existing UI

**Action: INHERIT** — extract parent's design tokens, convert to shadcn/ui variables.

**Steps:**
1. Run detection with `--context`:
   ```bash
   npx ts-node scripts/detect-theme.ts ./my-app --context ../parent-project
   ```
2. The script outputs a `shadcnMapping` object with `dark` and `light` mode variables
3. Generate `globals.css` using the mapped values instead of defaults
4. Add `@import url(...)` for the parent's web fonts (Google Fonts, etc.)
5. Set `className="dark"` on `<html>` if parent is dark-first
6. Remove default Geist fonts from `layout.tsx`, set font-family to match parent

**Example mapping (Astro/Starlight parent → shadcn/ui):**

| Parent Token | Value | shadcn Variable |
|---|---|---|
| `--color-bg-deepest` | `#0B0F19` | `--background` (dark) |
| `--color-bg-base` | `#111827` | `--card`, `--popover` (dark) |
| `--color-bg-surface` | `#1F2937` | `--muted`, `--secondary` (dark) |
| `--color-text-primary` | `#F9FAFB` | `--foreground` (dark) |
| `--color-text-muted` | `#9CA3AF` | `--muted-foreground` (dark) |
| `--color-accent` | `#818CF8` | `--primary` (dark) |
| `--font-body` | IBM Plex Sans | body `font-family` |
| `--font-heading` | JetBrains Mono | heading `font-family` |
| `--radius-md` | `10px` | `--radius` → `0.625rem` |

**What the script does automatically:**
- Finds all CSS files in the parent project (src/styles/, app/, root)
- Extracts CSS custom properties and classifies them (background, text, accent, border, font, radius, semantic)
- Detects dark/light mode blocks (`:root`, `[data-theme="light"]`, `.dark`)
- Converts hex colors to HSL format (required by shadcn/ui)
- Maps tokens to shadcn variables using name-pattern heuristics

**What you must do manually:**
- Verify the mapping looks correct (some custom property names may not match heuristics)
- Add Google Fonts `@import` for any web fonts detected
- Set dark-mode default on `<html>` if parent uses dark-first design

## Adapting to Existing Design Systems

### Project uses Chakra UI / Mantine / MUI

These libraries have their own theming systems. Auth components use
shadcn/ui (Radix + Tailwind), which can coexist but may have CSS conflicts.

**Approach:**
1. Scope auth pages under a route group: `app/(auth)/`
2. Map the library's primary/secondary colors to CSS variables
3. Test for `z-index` and `font-family` conflicts
4. Consider wrapping auth pages in an isolated CSS scope

### Project uses custom CSS (no framework)

Extract the project's color palette from existing styles:

1. Find primary action color (buttons, links)
2. Find background and text colors
3. Find error/destructive color
4. Convert hex/rgb to HSL for CSS variables
5. Generate adapted `globals.css`

**Hex to HSL conversion:**

```typescript
function hexToHSL(hex: string): string {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? ((g - b) / d + (g < b ? 6 : 0)) / 6
      : max === g ? ((b - r) / d + 2) / 6 : ((r - g) / d + 4) / 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
// hexToHSL("#2563eb") → "217 91% 53%"
```

## Dark Mode Compatibility

Auth components support dark mode via the `.dark` class on `<html>`.

**If project uses `next-themes`:** Already compatible. No action needed.

**If project uses `prefers-color-scheme`:** Add media query variant:

```css
@media (prefers-color-scheme: dark) {
  :root { /* dark mode variables */ }
}
```

**If project has no dark mode:** The auth components render in light mode
by default. No action needed.

## Gotchas

1. **Tailwind v4 uses CSS-first config** — `@theme` directive replaces `tailwind.config.ts`. Use `shadcn@latest` (not `@2.1.0`) for Tailwind v4 projects.
2. **CSS variable format** — shadcn/ui expects `H S% L%` without `hsl()` wrapper. Write `--primary: 222.2 47.4% 11.2%` not `--primary: hsl(222.2, 47.4%, 11.2%)`.
3. **`--radius` affects all components** — Cards, buttons, inputs all use `--radius`. Match it to the project's existing border-radius (usually `0.375rem` or `0.5rem`).
4. **Font inheritance** — Auth components use `font-sans` which inherits from `body`. If the project sets a custom font on `body`, auth components will use it automatically.
5. **z-index conflicts** — Modal overlays in auth (OAuth popups) may conflict with existing sticky headers or sidebars. Test with the full page layout.
