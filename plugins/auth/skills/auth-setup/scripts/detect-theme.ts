#!/usr/bin/env node

/**
 * Theme Detection Script for ShipWithAI Auth
 *
 * Scans an existing Next.js project to detect its design system/theme,
 * then outputs a theme report that Claude uses to adapt auth components.
 *
 * Usage: npx ts-node scripts/detect-theme.ts [project-root]
 *
 * Detection targets:
 *   1. shadcn/ui presence (components.json)
 *   2. CSS variables in globals.css
 *   3. Tailwind config theme extensions
 *   4. Package dependencies (UI libraries, CSS frameworks)
 *   5. Existing component patterns (border-radius, fonts)
 */

import * as fs from "fs";
import * as path from "path";

// ============================================================
// Types
// ============================================================

interface ThemeReport {
  scenario: "A" | "B" | "C" | "D";
  scenarioLabel: string;
  shadcnui: ShadcnUIDetection;
  tailwind: TailwindDetection;
  cssVariables: CSSVariableDetection;
  packages: PackageDetection;
  contextProject: ContextProjectDetection | null;
  recommendations: string[];
  globalsAction: "skip" | "merge" | "generate" | "inherit";
}

interface ShadcnUIDetection {
  present: boolean;
  configPath: string | null;
  style: string | null;       // "default" | "new-york"
  baseColor: string | null;
  cssVariables: boolean;
  tailwindPrefix: string | null;
}

interface TailwindDetection {
  present: boolean;
  version: number | null;      // 3 or 4
  configPath: string | null;
  hasCustomColors: boolean;
  hasCustomRadius: boolean;
  hasCustomFonts: boolean;
  darkMode: string | null;     // "class" | "media" | "selector" | null
}

interface CSSVariableDetection {
  hasExistingVars: boolean;
  globalsPath: string | null;
  existingVars: Record<string, string>;
  hasDarkMode: boolean;
  missingRequiredVars: string[];
}

interface PackageDetection {
  tailwindcss: string | null;
  shadcnui: boolean;
  tailwindAnimate: boolean;
  nextThemes: boolean;
  uiLibrary: string | null;   // "chakra" | "mantine" | "mui" | "ant" | "radix" | null
}

interface ContextProjectDetection {
  detected: boolean;
  contextPath: string | null;
  framework: string | null;      // "astro" | "next" | "remix" | "vite" | null
  cssFiles: string[];
  designTokens: DesignTokens;
  shadcnMapping: ShadcnMapping | null;
}

interface DesignTokens {
  backgrounds: Record<string, string>;   // e.g., { "--color-bg-deepest": "#0B0F19" }
  foregrounds: Record<string, string>;
  accents: Record<string, string>;
  borders: Record<string, string>;
  fonts: Record<string, string>;
  radii: Record<string, string>;
  semantic: Record<string, string>;      // error, warning, success
}

interface ShadcnMapping {
  light: Record<string, string>;   // shadcn var name → HSL value
  dark: Record<string, string>;
  fonts: { body: string | null; heading: string | null; mono: string | null };
  radius: string | null;
}

// ============================================================
// Required CSS variables for shadcn/ui compatibility
// ============================================================

const REQUIRED_SHADCN_VARS = [
  "--background", "--foreground",
  "--card", "--card-foreground",
  "--primary", "--primary-foreground",
  "--secondary", "--secondary-foreground",
  "--muted", "--muted-foreground",
  "--accent", "--accent-foreground",
  "--destructive", "--destructive-foreground",
  "--border", "--input", "--ring", "--radius",
];

// ============================================================
// Detection functions
// ============================================================

function findFile(root: string, candidates: string[]): string | null {
  for (const candidate of candidates) {
    const fullPath = path.join(root, candidate);
    if (fs.existsSync(fullPath)) return fullPath;
  }
  return null;
}

function readJsonSafe(filePath: string): Record<string, unknown> | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

function detectShadcnUI(root: string): ShadcnUIDetection {
  const configPath = findFile(root, ["components.json"]);
  if (!configPath) {
    return { present: false, configPath: null, style: null, baseColor: null, cssVariables: false, tailwindPrefix: null };
  }

  const config = readJsonSafe(configPath);
  return {
    present: true,
    configPath,
    style: (config?.style as string) ?? null,
    baseColor: (config?.baseColor as string) ?? null,
    cssVariables: (config?.tailwind as Record<string, unknown>)?.cssVariables === true,
    tailwindPrefix: ((config?.tailwind as Record<string, unknown>)?.prefix as string) ?? null,
  };
}

function detectTailwind(root: string): TailwindDetection {
  const configPath = findFile(root, [
    "tailwind.config.ts", "tailwind.config.js", "tailwind.config.mjs", "tailwind.config.cjs",
  ]);

  const pkgPath = findFile(root, ["package.json"]);
  const pkg = pkgPath ? readJsonSafe(pkgPath) : null;
  const deps = { ...(pkg?.dependencies as Record<string, string> ?? {}), ...(pkg?.devDependencies as Record<string, string> ?? {}) };
  const twVersion = deps["tailwindcss"];

  if (!configPath && !twVersion) {
    return { present: false, version: null, configPath: null, hasCustomColors: false, hasCustomRadius: false, hasCustomFonts: false, darkMode: null };
  }

  let hasCustomColors = false;
  let hasCustomRadius = false;
  let hasCustomFonts = false;
  let darkMode: string | null = null;

  if (configPath) {
    try {
      const content = fs.readFileSync(configPath, "utf-8");
      hasCustomColors = /colors\s*[:{]/.test(content);
      hasCustomRadius = /borderRadius\s*[:{]/.test(content);
      hasCustomFonts = /fontFamily\s*[:{]/.test(content);

      const dmMatch = content.match(/darkMode\s*[:=]\s*["'](\w+)["']/);
      darkMode = dmMatch?.[1] ?? null;
    } catch { /* ignore read errors */ }
  }

  const majorVersion = twVersion?.startsWith("4") ? 4 : twVersion?.startsWith("3") ? 3 : null;

  return { present: true, version: majorVersion, configPath, hasCustomColors, hasCustomRadius, hasCustomFonts, darkMode };
}

function detectCSSVariables(root: string): CSSVariableDetection {
  const globalsPath = findFile(root, [
    "app/globals.css", "src/app/globals.css",
    "styles/globals.css", "src/styles/globals.css",
    "app/global.css", "src/app/global.css",
  ]);

  if (!globalsPath) {
    return { hasExistingVars: false, globalsPath: null, existingVars: {}, hasDarkMode: false, missingRequiredVars: [...REQUIRED_SHADCN_VARS] };
  }

  try {
    const content = fs.readFileSync(globalsPath, "utf-8");
    const varRegex = /--([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;
    const existingVars: Record<string, string> = {};
    let match: RegExpExecArray | null;

    while ((match = varRegex.exec(content)) !== null) {
      existingVars[`--${match[1]}`] = match[2].trim();
    }

    const hasExistingVars = Object.keys(existingVars).length > 0;
    const hasDarkMode = /\.dark\s*\{/.test(content) || /@media\s*\(\s*prefers-color-scheme:\s*dark\s*\)/.test(content);

    const missingRequiredVars = REQUIRED_SHADCN_VARS.filter((v) => !(v in existingVars));

    return { hasExistingVars, globalsPath, existingVars, hasDarkMode, missingRequiredVars };
  } catch {
    return { hasExistingVars: false, globalsPath, existingVars: {}, hasDarkMode: false, missingRequiredVars: [...REQUIRED_SHADCN_VARS] };
  }
}

function detectPackages(root: string): PackageDetection {
  const pkgPath = findFile(root, ["package.json"]);
  if (!pkgPath) {
    return { tailwindcss: null, shadcnui: false, tailwindAnimate: false, nextThemes: false, uiLibrary: null };
  }

  const pkg = readJsonSafe(pkgPath);
  const deps = { ...(pkg?.dependencies as Record<string, string> ?? {}), ...(pkg?.devDependencies as Record<string, string> ?? {}) };

  const uiLibraryMap: Record<string, string> = {
    "@chakra-ui/react": "chakra",
    "@mantine/core": "mantine",
    "@mui/material": "mui",
    "antd": "ant",
    "@radix-ui/themes": "radix",
  };

  let uiLibrary: string | null = null;
  for (const [pkg, name] of Object.entries(uiLibraryMap)) {
    if (pkg in deps) { uiLibrary = name; break; }
  }

  return {
    tailwindcss: deps["tailwindcss"] ?? null,
    shadcnui: "components.json" in deps || fs.existsSync(path.join(root, "components.json")),
    tailwindAnimate: "tailwindcss-animate" in deps,
    nextThemes: "next-themes" in deps,
    uiLibrary,
  };
}

// ============================================================
// Context project detection (parent/sibling project scanning)
// ============================================================

/**
 * Convert hex color (#RRGGBB) to HSL string "H S% L%"
 * Returns null for non-hex values (rgba, var(), etc.)
 */
function hexToHSL(hex: string): string | null {
  const match = hex.match(/^#([0-9a-fA-F]{6})$/);
  if (!match) return null;
  const r = parseInt(match[1].substring(0, 2), 16) / 255;
  const g = parseInt(match[1].substring(2, 4), 16) / 255;
  const b = parseInt(match[1].substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * Find all CSS files in a project that might contain design tokens.
 * Looks in common locations: src/styles/, app/, public/, root.
 */
function findCSSFiles(root: string): string[] {
  const candidates = [
    "src/styles", "src/css", "styles", "css", "app", "src/app", "public",
  ];
  const cssFiles: string[] = [];

  // Check root-level CSS files
  try {
    const rootFiles = fs.readdirSync(root);
    for (const f of rootFiles) {
      if (f.endsWith(".css") && !f.includes("node_modules")) {
        cssFiles.push(path.join(root, f));
      }
    }
  } catch { /* ignore */ }

  // Check subdirectories
  for (const dir of candidates) {
    const fullDir = path.join(root, dir);
    try {
      if (!fs.existsSync(fullDir) || !fs.statSync(fullDir).isDirectory()) continue;
      const files = fs.readdirSync(fullDir);
      for (const f of files) {
        if (f.endsWith(".css")) cssFiles.push(path.join(fullDir, f));
      }
    } catch { /* ignore */ }
  }

  return cssFiles;
}

/**
 * Detect the framework of the context project.
 */
function detectFramework(root: string): string | null {
  const pkgPath = findFile(root, ["package.json"]);
  if (!pkgPath) return null;
  const pkg = readJsonSafe(pkgPath);
  if (!pkg) return null;
  const deps = { ...(pkg.dependencies as Record<string, string> ?? {}), ...(pkg.devDependencies as Record<string, string> ?? {}) };

  if ("astro" in deps) return "astro";
  if ("next" in deps) return "next";
  if ("@remix-run/react" in deps) return "remix";
  if ("vite" in deps) return "vite";
  if ("nuxt" in deps) return "nuxt";
  if ("svelte" in deps || "@sveltejs/kit" in deps) return "svelte";
  return null;
}

/**
 * Extract design tokens from CSS content.
 * Parses CSS custom properties and classifies them by purpose.
 */
function extractDesignTokens(cssContent: string): DesignTokens {
  const tokens: DesignTokens = {
    backgrounds: {}, foregrounds: {}, accents: {}, borders: {},
    fonts: {}, radii: {}, semantic: {},
  };

  const varRegex = /--([a-zA-Z0-9_-]+)\s*:\s*([^;]+);/g;
  let match: RegExpExecArray | null;

  while ((match = varRegex.exec(cssContent)) !== null) {
    const name = `--${match[1]}`;
    const value = match[2].trim();

    // Classify by name pattern
    if (/bg|background/i.test(name) && !/foreground/i.test(name)) {
      tokens.backgrounds[name] = value;
    } else if (/text|foreground|color-text/i.test(name)) {
      tokens.foregrounds[name] = value;
    } else if (/accent|brand|primary|cta/i.test(name)) {
      tokens.accents[name] = value;
    } else if (/border|divider|hairline/i.test(name)) {
      tokens.borders[name] = value;
    } else if (/font|family/i.test(name)) {
      tokens.fonts[name] = value;
    } else if (/radius/i.test(name)) {
      tokens.radii[name] = value;
    } else if (/error|warning|info|success|destructive|danger/i.test(name)) {
      tokens.semantic[name] = value;
    }
  }

  return tokens;
}

/**
 * Extract tokens from all blocks matching a selector (e.g., all :root {} blocks).
 * Merges tokens from multiple blocks with the same selector.
 * Earlier declarations are overridden by later ones (CSS cascade behavior).
 */
function extractTokensFromBlock(cssContent: string, selectorPattern: RegExp): DesignTokens {
  // Wrap the selector in a non-capturing group to prevent alternation issues
  // e.g., `:root` stays as-is, but `[data-theme="light"]|.light` becomes `(?:[data-theme="light"]|.light)`
  const groupedSelector = `(?:${selectorPattern.source})`;
  const blockRegex = new RegExp(groupedSelector + "\\s*\\{([^}]+)\\}", "gs");
  let combined = "";
  let match: RegExpExecArray | null;
  while ((match = blockRegex.exec(cssContent)) !== null) {
    combined += match[0] + "\n";
  }
  if (!combined) return { backgrounds: {}, foregrounds: {}, accents: {}, borders: {}, fonts: {}, radii: {}, semantic: {} };
  return extractDesignTokens(combined);
}

/**
 * Map extracted design tokens to shadcn/ui CSS variables.
 * Uses heuristics to find the best match for each shadcn variable.
 */
function mapTokensToShadcn(darkTokens: DesignTokens, lightTokens: DesignTokens, allTokens: DesignTokens): ShadcnMapping {
  function pickAndConvert(candidates: Record<string, string>, ...namePatterns: RegExp[]): string | null {
    for (const pattern of namePatterns) {
      for (const [name, value] of Object.entries(candidates)) {
        if (pattern.test(name)) {
          const hsl = hexToHSL(value);
          if (hsl) return hsl;
        }
      }
    }
    return null;
  }

  function buildMode(tokens: DesignTokens, isDark: boolean): Record<string, string> {
    const vars: Record<string, string> = {};
    const bg = tokens.backgrounds;
    const fg = tokens.foregrounds;
    const accent = tokens.accents;
    const border = tokens.borders;
    const semantic = tokens.semantic;

    // Background — deepest/base background
    const bgVal = pickAndConvert(bg, /deepest|base$|bg-base|background$/i) ?? pickAndConvert(bg, /bg/i);
    if (bgVal) vars["--background"] = bgVal;

    // Foreground — primary text
    const fgVal = pickAndConvert(fg, /primary|text-primary/i) ?? pickAndConvert(fg, /text|foreground/i);
    if (fgVal) vars["--foreground"] = fgVal;

    // Card — surface or base
    const cardVal = pickAndConvert(bg, /surface$|card|bg-base/i);
    if (cardVal) { vars["--card"] = cardVal; vars["--popover"] = cardVal; }

    // Card foreground = same as foreground
    if (fgVal) { vars["--card-foreground"] = fgVal; vars["--popover-foreground"] = fgVal; }

    // Primary — accent/brand color
    const primaryVal = pickAndConvert(accent, /accent$|brand$|primary$/i) ?? pickAndConvert(accent, /accent|cta/i);
    if (primaryVal) vars["--primary"] = primaryVal;

    // Primary foreground — contrast text on primary
    if (bgVal && isDark) vars["--primary-foreground"] = bgVal;
    if (fgVal && !isDark) vars["--primary-foreground"] = pickAndConvert(bg, /deepest|base/i) ?? "210 40% 98%";

    // Secondary/muted — surface or overlay
    const secondaryVal = pickAndConvert(bg, /surface$|overlay|muted/i);
    if (secondaryVal) {
      vars["--secondary"] = secondaryVal;
      vars["--muted"] = secondaryVal;
      vars["--accent"] = secondaryVal;
    }

    // Secondary foreground
    if (fgVal) {
      vars["--secondary-foreground"] = fgVal;
      vars["--accent-foreground"] = fgVal;
    }

    // Muted foreground — muted/faint text
    const mutedFg = pickAndConvert(fg, /muted|faint/i);
    if (mutedFg) vars["--muted-foreground"] = mutedFg;

    // Destructive — error color
    const destructiveVal = pickAndConvert(semantic, /error|destructive|danger/i);
    if (destructiveVal) vars["--destructive"] = destructiveVal;

    // Border
    const borderVal = pickAndConvert(border, /border$/i) ?? pickAndConvert(border, /border/i);
    if (borderVal) { vars["--border"] = borderVal; vars["--input"] = borderVal; }

    // Ring — accent hover
    const ringVal = pickAndConvert(accent, /hover/i);
    if (ringVal) vars["--ring"] = ringVal;

    return vars;
  }

  // If we have explicit dark/light blocks, use them; otherwise use allTokens for both
  const dark = Object.keys(darkTokens.backgrounds).length > 0 ? buildMode(darkTokens, true) : buildMode(allTokens, true);
  const light = Object.keys(lightTokens.backgrounds).length > 0 ? buildMode(lightTokens, false) : {};

  // Fonts
  const fonts = {
    body: allTokens.fonts["--font-body"] ?? allTokens.fonts["--sl-font"] ?? null,
    heading: allTokens.fonts["--font-heading"] ?? null,
    mono: allTokens.fonts["--font-code"] ?? allTokens.fonts["--font-mono"] ?? allTokens.fonts["--sl-font-mono"] ?? null,
  };

  // Radius
  const radiusVal = allTokens.radii["--radius-md"] ?? allTokens.radii["--radius"] ?? null;
  let radius: string | null = null;
  if (radiusVal) {
    // Convert px to rem if needed
    const pxMatch = radiusVal.match(/(\d+)px/);
    radius = pxMatch ? `${parseFloat(pxMatch[1]) / 16}rem` : radiusVal;
  }

  return { light, dark, fonts, radius };
}

/**
 * Scan a parent/sibling project for design tokens and generate shadcn/ui mapping.
 */
function detectContextProject(contextPath: string): ContextProjectDetection {
  const root = path.resolve(contextPath);
  if (!fs.existsSync(root)) {
    return { detected: false, contextPath: null, framework: null, cssFiles: [], designTokens: { backgrounds: {}, foregrounds: {}, accents: {}, borders: {}, fonts: {}, radii: {}, semantic: {} }, shadcnMapping: null };
  }

  const framework = detectFramework(root);
  const cssFiles = findCSSFiles(root);

  if (cssFiles.length === 0) {
    return { detected: false, contextPath: root, framework, cssFiles: [], designTokens: { backgrounds: {}, foregrounds: {}, accents: {}, borders: {}, fonts: {}, radii: {}, semantic: {} }, shadcnMapping: null };
  }

  // Merge all CSS content to extract all tokens
  let allCSS = "";
  for (const file of cssFiles) {
    try { allCSS += fs.readFileSync(file, "utf-8") + "\n"; } catch { /* ignore */ }
  }

  // Extract ALL tokens (for fonts, radii, etc. that are mode-independent)
  const allTokens = extractDesignTokens(allCSS);

  // For dark/light separation, we need to be smarter about which :root block
  // contains dark vs light tokens. Strategy:
  // 1. Check if there's a [data-theme="light"] or .light block → those are explicit light overrides
  // 2. If found, the :root block contains dark defaults (dark-first design)
  // 3. If not found, check for .dark {} block → those are explicit dark overrides
  // 4. If neither, :root has the only mode (assume light)

  const hasExplicitLight = /\[data-theme=["']light["']\]|\.light\s*\{/.test(allCSS);
  const hasExplicitDark = /\.dark\s*\{|@media\s*\(\s*prefers-color-scheme:\s*dark\s*\)/.test(allCSS);

  let darkTokens: DesignTokens;
  let lightTokens: DesignTokens;

  if (hasExplicitLight) {
    // Dark-first design: :root = dark, [data-theme="light"] = light
    darkTokens = extractTokensFromBlock(allCSS, /:root/);
    lightTokens = extractTokensFromBlock(allCSS, /\[data-theme=["']light["']\]|\.light/);
  } else if (hasExplicitDark) {
    // Light-first design: :root = light, .dark = dark
    lightTokens = extractTokensFromBlock(allCSS, /:root/);
    darkTokens = extractTokensFromBlock(allCSS, /\.dark/);
  } else {
    // Single mode — treat :root as dark if it has dark-looking colors, else light
    darkTokens = extractTokensFromBlock(allCSS, /:root/);
    lightTokens = { backgrounds: {}, foregrounds: {}, accents: {}, borders: {}, fonts: {}, radii: {}, semantic: {} };
  }

  const hasTokens = Object.keys(allTokens.backgrounds).length > 0 || Object.keys(allTokens.accents).length > 0;

  if (!hasTokens) {
    return { detected: false, contextPath: root, framework, cssFiles, designTokens: allTokens, shadcnMapping: null };
  }

  const shadcnMapping = mapTokensToShadcn(darkTokens, lightTokens, allTokens);

  return { detected: true, contextPath: root, framework, cssFiles, designTokens: allTokens, shadcnMapping };
}

// ============================================================
// Scenario classification
// ============================================================

function classifyScenario(
  shadcn: ShadcnUIDetection,
  tailwind: TailwindDetection,
  cssVars: CSSVariableDetection,
  contextProject: ContextProjectDetection | null,
): Pick<ThemeReport, "scenario" | "scenarioLabel" | "globalsAction"> {
  // Scenario D: New project with a parent/sibling that has a design system
  // This takes priority — even if the new project has shadcn/ui defaults,
  // we should inherit from the parent's design tokens instead.
  if (contextProject?.detected && contextProject.shadcnMapping) {
    return {
      scenario: "D",
      scenarioLabel: `Parent/sibling project detected (${contextProject.framework ?? "unknown"}) — inherit design tokens`,
      globalsAction: "inherit",
    };
  }

  // Scenario A: Project already has shadcn/ui with CSS variables
  if (shadcn.present && cssVars.missingRequiredVars.length <= 2) {
    return {
      scenario: "A",
      scenarioLabel: "shadcn/ui detected — use existing theme",
      globalsAction: "skip",
    };
  }

  // Scenario B: Has Tailwind but no shadcn/ui (or incomplete CSS vars)
  if (tailwind.present) {
    return {
      scenario: "B",
      scenarioLabel: "Tailwind detected — merge CSS variables into existing globals.css",
      globalsAction: "merge",
    };
  }

  // Scenario C: No Tailwind at all
  return {
    scenario: "C",
    scenarioLabel: "No Tailwind — full globals.css + Tailwind setup needed",
    globalsAction: "generate",
  };
}

// ============================================================
// Recommendations engine
// ============================================================

function generateRecommendations(report: Omit<ThemeReport, "recommendations">): string[] {
  const recs: string[] = [];

  // Scenario-specific
  if (report.scenario === "A") {
    recs.push("SKIP globals.css — project already has compatible shadcn/ui CSS variables.");
    if (report.cssVariables.missingRequiredVars.length > 0) {
      recs.push(`ADD missing CSS variables to existing globals.css: ${report.cssVariables.missingRequiredVars.join(", ")}`);
    }
  }

  if (report.scenario === "B") {
    recs.push("MERGE shadcn/ui CSS variables into existing globals.css — preserve existing custom properties.");
    if (report.tailwind.hasCustomColors) {
      recs.push("MAP existing Tailwind custom colors to shadcn/ui --primary, --secondary, --accent variables for visual consistency.");
    }
  }

  if (report.scenario === "C") {
    recs.push("GENERATE full globals.css with shadcn/ui CSS variables (light + dark mode).");
    recs.push("INSTALL tailwindcss, postcss, autoprefixer, tailwindcss-animate as dev dependencies.");
    recs.push("CREATE tailwind.config.ts with shadcn/ui theme extensions.");
  }

  if (report.scenario === "D" && report.contextProject?.shadcnMapping) {
    const mapping = report.contextProject.shadcnMapping;
    const darkCount = Object.keys(mapping.dark).length;
    const lightCount = Object.keys(mapping.light).length;
    recs.push(`INHERIT design tokens from parent project (${report.contextProject.framework ?? "unknown"} at ${report.contextProject.contextPath}).`);
    recs.push(`GENERATE globals.css with ${darkCount} dark-mode and ${lightCount} light-mode variables mapped from parent's design system.`);
    if (mapping.fonts.body) recs.push(`SET body font to: ${mapping.fonts.body}`);
    if (mapping.fonts.heading) recs.push(`SET heading font to: ${mapping.fonts.heading}`);
    if (mapping.fonts.mono) recs.push(`SET mono font to: ${mapping.fonts.mono}`);
    if (mapping.radius) recs.push(`SET border-radius to: ${mapping.radius}`);
    recs.push("ADD Google Fonts @import for detected font families (if web fonts).");
    recs.push("SET dark mode as default (className='dark' on <html>) to match parent's dark-first design.");
  }

  // Common checks
  if (!report.packages.tailwindAnimate && report.tailwind.present) {
    recs.push("INSTALL tailwindcss-animate — required by shadcn/ui components.");
  }

  if (!report.packages.nextThemes && report.cssVariables.hasDarkMode) {
    recs.push("CONSIDER installing next-themes for dark mode toggle support.");
  }

  if (report.packages.uiLibrary) {
    recs.push(`WARNING: Project uses ${report.packages.uiLibrary}. Auth components use shadcn/ui — CSS variable conflicts possible. Test thoroughly.`);
  }

  if (report.tailwind.version === 4) {
    recs.push("WARNING: Tailwind v4 detected. Auth plugin uses Tailwind v3 conventions. Use shadcn@latest (not @2.1.0) and verify CSS-first config compatibility.");
  }

  if (report.shadcnui.present && report.shadcnui.tailwindPrefix) {
    recs.push(`NOTE: shadcn/ui uses Tailwind prefix "${report.shadcnui.tailwindPrefix}". Auth component classes will need this prefix.`);
  }

  return recs;
}

// ============================================================
// Main
// ============================================================

function detectTheme(projectRoot: string, contextPath?: string): ThemeReport {
  const root = path.resolve(projectRoot);

  if (!fs.existsSync(root)) {
    console.error(`Error: Directory not found: ${root}`);
    process.exit(1);
  }

  const shadcnui = detectShadcnUI(root);
  const tailwind = detectTailwind(root);
  const cssVariables = detectCSSVariables(root);
  const packages = detectPackages(root);

  // Detect parent/sibling project if --context provided
  const contextProject = contextPath ? detectContextProject(contextPath) : null;

  const { scenario, scenarioLabel, globalsAction } = classifyScenario(shadcnui, tailwind, cssVariables, contextProject);

  const partialReport = { scenario, scenarioLabel, shadcnui, tailwind, cssVariables, packages, contextProject, globalsAction };
  const recommendations = generateRecommendations(partialReport);

  return { ...partialReport, recommendations };
}

// CLI entry point
// Usage:
//   npx ts-node detect-theme.ts /path/to/project
//   npx ts-node detect-theme.ts /path/to/new-app --context /path/to/parent-project
function parseArgs(args: string[]): { projectRoot: string; contextPath?: string } {
  const projectRoot = args[0] || ".";
  let contextPath: string | undefined;
  const contextIdx = args.indexOf("--context");
  if (contextIdx !== -1 && args[contextIdx + 1]) {
    contextPath = args[contextIdx + 1];
  }
  return { projectRoot, contextPath };
}

const { projectRoot, contextPath } = parseArgs(process.argv.slice(2));
const report = detectTheme(projectRoot, contextPath);

console.log("\n" + "=".repeat(60));
console.log("  ShipWithAI Auth — Theme Detection Report");
console.log("=".repeat(60));
console.log(`\nScenario: ${report.scenario} — ${report.scenarioLabel}`);
console.log(`globals.css action: ${report.globalsAction.toUpperCase()}`);

console.log("\n--- Detection Results ---");
console.log(`shadcn/ui: ${report.shadcnui.present ? `YES (style: ${report.shadcnui.style ?? "unknown"})` : "NO"}`);
console.log(`Tailwind: ${report.tailwind.present ? `YES (v${report.tailwind.version ?? "?"})` : "NO"}`);
console.log(`CSS variables: ${report.cssVariables.hasExistingVars ? `YES (${Object.keys(report.cssVariables.existingVars).length} vars)` : "NO"}`);
console.log(`Dark mode: ${report.cssVariables.hasDarkMode ? "YES" : "NO"}`);
console.log(`Missing shadcn/ui vars: ${report.cssVariables.missingRequiredVars.length === 0 ? "NONE" : report.cssVariables.missingRequiredVars.join(", ")}`);
if (report.packages.uiLibrary) console.log(`UI library: ${report.packages.uiLibrary}`);
if (report.tailwind.hasCustomColors) console.log(`Custom Tailwind colors: YES`);
if (report.tailwind.hasCustomFonts) console.log(`Custom Tailwind fonts: YES`);

if (report.contextProject?.detected) {
  console.log("\n--- Context Project ---");
  console.log(`Framework: ${report.contextProject.framework ?? "unknown"}`);
  console.log(`CSS files found: ${report.contextProject.cssFiles.length}`);
  const tokens = report.contextProject.designTokens;
  const tokenCount = Object.keys(tokens.backgrounds).length + Object.keys(tokens.foregrounds).length +
    Object.keys(tokens.accents).length + Object.keys(tokens.borders).length;
  console.log(`Design tokens extracted: ${tokenCount}`);
  if (report.contextProject.shadcnMapping) {
    const m = report.contextProject.shadcnMapping;
    console.log(`Mapped to shadcn: ${Object.keys(m.dark).length} dark vars, ${Object.keys(m.light).length} light vars`);
    if (m.fonts.body) console.log(`Body font: ${m.fonts.body}`);
    if (m.fonts.heading) console.log(`Heading font: ${m.fonts.heading}`);
    if (m.radius) console.log(`Border radius: ${m.radius}`);
  }
}

console.log("\n--- Recommendations ---");
report.recommendations.forEach((rec, i) => console.log(`${i + 1}. ${rec}`));

// Output JSON for programmatic consumption
console.log("\n--- JSON Report ---");
console.log(JSON.stringify(report, null, 2));
