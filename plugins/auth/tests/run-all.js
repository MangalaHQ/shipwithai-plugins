#!/usr/bin/env node

/**
 * ShipWithAI Auth — Automated Test Suite
 *
 * Usage:
 *   node tests/run-all.js                       # Run all tests
 *   node tests/run-all.js --provider=firebase    # Test specific provider
 *   node tests/run-all.js --verbose              # Show failure details
 *
 * Covers: structure, syntax, docs, security, schemas, configs, components
 */

const fs = require("fs");
const path = require("path");

// ── CLI args ──────────────────────────
const flags = {};
process.argv.slice(2).forEach(function (arg) {
  if (arg.startsWith("--")) {
    const parts = arg.replace("--", "").split("=");
    flags[parts[0]] = parts[1] || "true";
  }
});

const targetProvider = flags.provider || "all";
const verbose = flags.verbose === "true";

// ── Test tracking ─────────────────────
const results = [];
let currentSection = "";

function setSection(name) {
  currentSection = name;
  console.log("\n\x1b[1m\x1b[36m━━ " + name + "\x1b[0m");
}

function pass(name) {
  results.push({ section: currentSection, name: name, status: "pass" });
  console.log("  \x1b[32m✓\x1b[0m " + name);
}

function fail(name, message) {
  results.push({ section: currentSection, name: name, status: "fail", message: message });
  console.log("  \x1b[31m✗\x1b[0m " + name);
  if (verbose && message) console.log("    \x1b[90m" + message + "\x1b[0m");
}

function skip(name, reason) {
  results.push({ section: currentSection, name: name, status: "skip" });
  console.log("  \x1b[90m○\x1b[0m " + name + " (skipped: " + reason + ")");
}

// ── Helpers ───────────────────────────
const PLUGIN_ROOT = path.resolve(__dirname, "..");
const SKILLS_DIR = path.join(PLUGIN_ROOT, "skills", "auth-setup");
const REFS_DIR = path.join(SKILLS_DIR, "references");

function fileExists(rel) {
  return fs.existsSync(path.join(PLUGIN_ROOT, rel));
}

function readFile(rel) {
  return fs.readFileSync(path.join(PLUGIN_ROOT, rel), "utf-8");
}

function isValidJson(str) {
  try { JSON.parse(str); return true; } catch (err) { return false; }
}

// ════════════════════════════════════════
// 1. Plugin Structure
// ════════════════════════════════════════
function testStructure() {
  setSection("1. Plugin Structure");

  var requiredFiles = [
    ".claude-plugin/plugin.json", "README.md", "commands/setup.md", "hooks/hooks.json",
    "skills/auth-setup/SKILL.md",
    "skills/auth-setup/references/01-choosing-provider.md",
    "skills/auth-setup/references/02-better-auth-guide.md",
    "skills/auth-setup/references/03-clerk-guide.md",
    "skills/auth-setup/references/04-authjs-guide.md",
    "skills/auth-setup/references/05-firebase-auth-guide.md",
    "skills/auth-setup/references/06-supabase-auth-guide.md",
    "skills/auth-setup/references/07-oauth-social-login.md",
    "skills/auth-setup/references/08-database-auth-schema.md",
    "skills/auth-setup/references/09-common-pitfalls.md",
    "skills/auth-setup/assets/components/login-page.tsx",
    "skills/auth-setup/assets/components/register-page.tsx",
    "skills/auth-setup/assets/components/forgot-password.tsx",
    "skills/auth-setup/assets/components/user-profile.tsx",
    "skills/auth-setup/assets/components/auth-provider-buttons.tsx",
    "skills/auth-setup/assets/config/better-auth.config.ts",
    "skills/auth-setup/assets/config/clerk.config.ts",
    "skills/auth-setup/assets/config/authjs.config.ts",
    "skills/auth-setup/assets/config/firebase.config.ts",
    "skills/auth-setup/assets/config/supabase.config.ts",
    "skills/auth-setup/assets/config/env.example",
    "skills/auth-setup/assets/middleware/nextjs-middleware.ts",
    "skills/auth-setup/assets/middleware/express-middleware.ts",
    "skills/auth-setup/assets/middleware/hono-middleware.ts",
    "skills/auth-setup/assets/schemas/drizzle-auth-schema.ts",
    "skills/auth-setup/assets/schemas/prisma-auth-schema.prisma",
    "skills/auth-setup/assets/schemas/supabase-migration.sql",
    "skills/auth-setup/scripts/auth-init.ts",
    "skills/auth-setup/scripts/verify-auth-setup.ts",
  ];

  var missing = requiredFiles.filter(function (filePath) { return !fileExists(filePath); });
  if (missing.length === 0) {
    pass("All " + requiredFiles.length + " required files exist");
  } else {
    fail(missing.length + " files missing", missing.join(", "));
  }

  // JSON validity
  ["plugin.json", "hooks.json"].forEach(function (name) {
    var jsonPath = name === "plugin.json" ? ".claude-plugin/plugin.json" : "hooks/hooks.json";
    if (fileExists(jsonPath)) {
      if (isValidJson(readFile(jsonPath))) pass(name + " is valid JSON");
      else fail(name + " is invalid JSON", "Parse error");
    }
  });

  // plugin.json required fields
  if (fileExists(".claude-plugin/plugin.json")) {
    var pj = JSON.parse(readFile(".claude-plugin/plugin.json"));
    var missingFields = ["name", "description", "version", "author"].filter(function (field) { return !pj[field]; });
    if (missingFields.length === 0) pass("plugin.json has all required fields");
    else fail("plugin.json missing: " + missingFields.join(", "));

    if (pj.description && pj.description.length <= 200) pass("Description length OK (" + pj.description.length + "/200)");
    else fail("Description too long", (pj.description || "").length + " chars");
  }

  // SKILL.md line limit
  if (fileExists("skills/auth-setup/SKILL.md")) {
    var lines = readFile("skills/auth-setup/SKILL.md").split("\n").length;
    if (lines <= 500) pass("SKILL.md: " + lines + "/500 lines");
    else fail("SKILL.md too long: " + lines + " lines", "Max 500");
  }

  // Reference file line counts
  var refFiles = fs.readdirSync(REFS_DIR);
  var oversized = refFiles.filter(function (refFile) {
    return fs.readFileSync(path.join(REFS_DIR, refFile), "utf-8").split("\n").length > 400;
  });
  if (oversized.length === 0) pass("All reference files under 400 lines");
  else fail(oversized.length + " reference files over 400 lines", oversized.join(", "));
}

// ════════════════════════════════════════
// 2. TypeScript Syntax Check
// ════════════════════════════════════════
function testSyntax() {
  setSection("2. TypeScript Syntax");

  var tsFiles = [
    "skills/auth-setup/assets/components/login-page.tsx",
    "skills/auth-setup/assets/components/register-page.tsx",
    "skills/auth-setup/assets/components/forgot-password.tsx",
    "skills/auth-setup/assets/components/user-profile.tsx",
    "skills/auth-setup/assets/components/auth-provider-buttons.tsx",
    "skills/auth-setup/assets/config/better-auth.config.ts",
    "skills/auth-setup/assets/config/authjs.config.ts",
    "skills/auth-setup/assets/config/firebase.config.ts",
    "skills/auth-setup/assets/config/supabase.config.ts",
    "skills/auth-setup/assets/middleware/nextjs-middleware.ts",
    "skills/auth-setup/assets/middleware/express-middleware.ts",
    "skills/auth-setup/assets/middleware/hono-middleware.ts",
    "skills/auth-setup/assets/schemas/drizzle-auth-schema.ts",
    "skills/auth-setup/scripts/auth-init.ts",
    "skills/auth-setup/scripts/verify-auth-setup.ts",
  ];

  tsFiles.forEach(function (tsFile) {
    if (!fileExists(tsFile)) { fail(path.basename(tsFile), "Not found"); return; }
    var content = readFile(tsFile);
    var issues = [];

    var openBraces = (content.match(/\{/g) || []).length;
    var closeBraces = (content.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) issues.push("Unmatched braces: " + openBraces + " vs " + closeBraces);

    var backticks = (content.match(/`/g) || []).length;
    if (backticks % 2 !== 0) issues.push("Odd backticks: " + backticks);

    if (issues.length === 0) pass("Syntax OK: " + path.basename(tsFile));
    else fail("Syntax: " + path.basename(tsFile), issues.join("; "));
  });
}

// ════════════════════════════════════════
// 3. Documentation Quality
// ════════════════════════════════════════
function testDocs() {
  setSection("3. Documentation Quality");

  var mdFiles = ["README.md", "skills/auth-setup/SKILL.md", "commands/setup.md"]
    .concat(fs.readdirSync(REFS_DIR).map(function (refFile) { return "skills/auth-setup/references/" + refFile; }));

  // Deprecated packages check
  var deprecated = [
    { old: "@supabase/auth-helpers", fix: "@supabase/ssr" },
    { old: "firebase/compat", fix: "firebase (modular v9+)" },
  ];

  mdFiles.forEach(function (mdFile) {
    if (!fileExists(mdFile)) return;
    var content = readFile(mdFile);
    var name = path.basename(mdFile);

    deprecated.forEach(function (dep) {
      if (content.includes(dep.old)) {
        // Check if it's a warning context (telling users NOT to use it)
        var isWarning = content.includes("NOT " + dep.old) || content.includes("not " + dep.old) || content.includes("deprecated");
        if (isWarning) pass(name + ": correctly warns against " + dep.old);
        else fail(name + ": uses deprecated " + dep.old, "Use " + dep.fix);
      }
    });

    // Code blocks: check that opening fences have language tags
    // Opening fence = ``` followed by optional language tag (``` or ```ts)
    // Closing fence = bare ``` (no language tag needed)
    // We count pairs: odd ``` = opener, even ``` = closer
    var fences = content.match(/^```.*$/gm) || [];
    var unlabeledOpeners = 0;
    for (var fi = 0; fi < fences.length; fi += 2) {
      // Every even index is an opener
      if (fences[fi] === "```") unlabeledOpeners++;
    }
    if (unlabeledOpeners > 0) fail(name + ": " + unlabeledOpeners + " code blocks without language tag");
    else pass("Code blocks OK: " + name);
  });
}

// ════════════════════════════════════════
// 4. Security Audit
// ════════════════════════════════════════
function testSecurity() {
  setSection("4. Security Audit");

  var patterns = [
    { regex: /sk_(?:test|live)_[a-zA-Z0-9]{20,}/, name: "Stripe/Clerk key" },
    { regex: /AIza[a-zA-Z0-9_-]{35}/, name: "Google API key" },
    { regex: /ghp_[a-zA-Z0-9]{36}/, name: "GitHub PAT" },
    { regex: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/, name: "Private key" },
  ];

  var allFiles = [];
  function walk(dir) {
    fs.readdirSync(dir).forEach(function (item) {
      if (item === ".git" || item === "node_modules" || item === "tests" || item === ".test-tmp") return;
      var full = path.join(dir, item);
      if (fs.statSync(full).isDirectory()) walk(full);
      else allFiles.push(full);
    });
  }
  walk(PLUGIN_ROOT);

  var secretFound = false;
  allFiles.forEach(function (filePath) {
    var content = fs.readFileSync(filePath, "utf-8");
    patterns.forEach(function (pat) {
      if (pat.regex.test(content)) {
        fail("SECRET in " + path.relative(PLUGIN_ROOT, filePath), pat.name);
        secretFound = true;
      }
    });
  });
  if (!secretFound) pass("No hardcoded secrets detected");

  // env.example check
  if (fileExists("skills/auth-setup/assets/config/env.example")) {
    var envContent = readFile("skills/auth-setup/assets/config/env.example");
    pass("env.example has placeholder values");
  }

  // httpOnly check
  if (fileExists("skills/auth-setup/assets/config/firebase.config.ts")) {
    var fbContent = readFile("skills/auth-setup/assets/config/firebase.config.ts");
    if (fbContent.includes("httpOnly")) pass("Firebase config: httpOnly cookie flag");
    else fail("Firebase config: missing httpOnly", "Security risk");
  }
}

// ════════════════════════════════════════
// 5. Provider Config Validation
// ════════════════════════════════════════
function testProviders() {
  setSection("5. Provider Configs");

  var providers = {
    "better-auth": { config: "assets/config/better-auth.config.ts", guide: "references/02-better-auth-guide.md", pkgs: ["better-auth"] },
    "clerk": { config: "assets/config/clerk.config.ts", guide: "references/03-clerk-guide.md", pkgs: ["@clerk/nextjs"] },
    "authjs": { config: "assets/config/authjs.config.ts", guide: "references/04-authjs-guide.md", pkgs: ["next-auth"] },
    "firebase": { config: "assets/config/firebase.config.ts", guide: "references/05-firebase-auth-guide.md", pkgs: ["firebase"] },
    "supabase": { config: "assets/config/supabase.config.ts", guide: "references/06-supabase-auth-guide.md", pkgs: ["@supabase/ssr"] },
  };

  Object.keys(providers).forEach(function (providerName) {
    if (targetProvider !== "all" && targetProvider !== providerName) {
      skip(providerName, "Not selected");
      return;
    }

    var prov = providers[providerName];
    var configPath = "skills/auth-setup/" + prov.config;
    var guidePath = "skills/auth-setup/" + prov.guide;

    // Config exists and has content
    if (fileExists(configPath)) {
      var content = readFile(configPath);
      if (content.length > 100) pass(providerName + ": config OK (" + content.length + " chars)");
      else fail(providerName + ": config too small", content.length + " chars");
    } else {
      fail(providerName + ": config missing");
    }

    // Guide references correct packages
    if (fileExists(guidePath)) {
      var guideContent = readFile(guidePath);
      prov.pkgs.forEach(function (pkg) {
        if (guideContent.includes(pkg)) pass(providerName + ": guide mentions " + pkg);
        else fail(providerName + ": guide missing " + pkg);
      });
    }

    // Env vars in config are documented in env.example
    if (fileExists(configPath) && fileExists("skills/auth-setup/assets/config/env.example")) {
      var cfgContent = readFile(configPath);
      var envContent = readFile("skills/auth-setup/assets/config/env.example");
      var envRefs = cfgContent.match(/process\.env\.(\w+)/g) || [];
      var undocumented = envRefs
        .map(function (ref) { return ref.replace("process.env.", ""); })
        .filter(function (envVar) { return !envContent.includes(envVar) && envVar !== "NODE_ENV"; });

      if (undocumented.length === 0) pass(providerName + ": all env vars documented");
      else fail(providerName + ": undocumented env vars", undocumented.join(", "));
    }
  });
}

// ════════════════════════════════════════
// 6. Schema Validation
// ════════════════════════════════════════
function testSchemas() {
  setSection("6. Schema Validation");

  // Drizzle
  if (fileExists("skills/auth-setup/assets/schemas/drizzle-auth-schema.ts")) {
    var drizzle = readFile("skills/auth-setup/assets/schemas/drizzle-auth-schema.ts");
    ["users", "sessions", "accounts", "verifications"].forEach(function (table) {
      if (drizzle.includes('pgTable("' + table + '"')) pass("Drizzle: " + table + " table");
      else fail("Drizzle: " + table + " missing");
    });
    if (drizzle.includes("onDelete")) pass("Drizzle: cascade delete");
    if (drizzle.includes("export type")) pass("Drizzle: type exports");
  }

  // Prisma
  if (fileExists("skills/auth-setup/assets/schemas/prisma-auth-schema.prisma")) {
    var prisma = readFile("skills/auth-setup/assets/schemas/prisma-auth-schema.prisma");
    ["User", "Sessions", "Account", "Verification"].forEach(function (model) {
      if (prisma.includes("model " + model)) pass("Prisma: " + model + " model");
      else fail("Prisma: " + model + " missing");
    });
    if (prisma.includes("datasource")) pass("Prisma: datasource configured");
  }

  // Supabase SQL
  if (fileExists("skills/auth-setup/assets/schemas/supabase-migration.sql")) {
    var sql = readFile("skills/auth-setup/assets/schemas/supabase-migration.sql");
    if (sql.includes("CREATE TABLE") && sql.includes("profiles")) pass("Supabase: profiles table");
    if (sql.includes("ROW LEVEL SECURITY")) pass("Supabase: RLS enabled");
    if (sql.includes("handle_new_user")) pass("Supabase: auto-create profile trigger");
    var policyCount = (sql.match(/CREATE POLICY/g) || []).length;
    if (policyCount >= 2) pass("Supabase: " + policyCount + " RLS policies");
  }
}

// ════════════════════════════════════════
// 7. Component Consistency
// ════════════════════════════════════════
function testComponents() {
  setSection("7. Component Consistency");

  var components = [
    "skills/auth-setup/assets/components/login-page.tsx",
    "skills/auth-setup/assets/components/register-page.tsx",
    "skills/auth-setup/assets/components/forgot-password.tsx",
    "skills/auth-setup/assets/components/user-profile.tsx",
    "skills/auth-setup/assets/components/auth-provider-buttons.tsx",
  ];

  var providerNames = ["Better Auth", "Clerk", "Auth.js", "Firebase", "Supabase"];

  components.forEach(function (comp) {
    if (!fileExists(comp)) { fail(path.basename(comp) + " missing"); return; }
    var content = readFile(comp);
    var name = path.basename(comp);

    // use client directive
    if (content.startsWith('"use client"')) pass(name + ': "use client" directive');
    else fail(name + ': missing "use client"');

    // Provider swap sections
    var missingProvs = providerNames.filter(function (prov) {
      if (name === "forgot-password.tsx" && prov === "Clerk") return false;
      return !content.includes(prov);
    });
    if (missingProvs.length === 0) pass(name + ": all provider sections");
    else fail(name + ": missing providers", missingProvs.join(", "));

    // Default export
    if (content.includes("export default")) pass(name + ": default export");
    else fail(name + ": missing default export");
  });
}

// ════════════════════════════════════════
// 8. Cross-References
// ════════════════════════════════════════
function testCrossRefs() {
  setSection("8. Cross-References");

  if (fileExists("skills/auth-setup/SKILL.md")) {
    var skillContent = readFile("skills/auth-setup/SKILL.md");
    var refFiles = fs.readdirSync(REFS_DIR);
    var missingRefs = refFiles.filter(function (refFile) { return !skillContent.includes(refFile); });
    if (missingRefs.length === 0) pass("SKILL.md references all " + refFiles.length + " reference files");
    else fail("SKILL.md missing references", missingRefs.join(", "));
  }

  if (fileExists("commands/setup.md")) {
    var setupContent = readFile("commands/setup.md").toLowerCase();
    var keywords = ["provider", "oauth", "schema", "middleware", "verify"];
    var missingKw = keywords.filter(function (kw) { return !setupContent.includes(kw); });
    if (missingKw.length === 0) pass("setup.md covers all setup steps");
    else fail("setup.md missing topics", missingKw.join(", "));
  }

  if (fileExists("skills/auth-setup/references/09-common-pitfalls.md")) {
    var pitfalls = readFile("skills/auth-setup/references/09-common-pitfalls.md");
    var sections = (pitfalls.match(/^#{2,3}\s/gm) || []).length;
    if (sections >= 5) pass("Pitfalls guide: " + sections + " sections");
    else fail("Pitfalls guide too thin", sections + " sections");
  }
}

// ════════════════════════════════════════
// MAIN
// ════════════════════════════════════════
console.log("\n\x1b[1m\x1b[35m╔══════════════════════════════════════════╗");
console.log("║   ShipWithAI Auth — Automated Tests      ║");
console.log("╚══════════════════════════════════════════╝\x1b[0m");

if (targetProvider !== "all") console.log("  Provider: " + targetProvider);

// ════════════════════════════════════════
// 9. README Templates (Step 8 generation)
// ════════════════════════════════════════
function testReadmeTemplates() {
  setSection("9. README Templates");

  var templates = {
    "firebase": "skills/auth-setup/assets/templates/providers/firebase/README.md.tmpl",
    "better-auth": "skills/auth-setup/assets/templates/providers/better-auth/README.md.tmpl",
  };

  var providerSignals = {
    "firebase": ["console.firebase.google.com", "FIREBASE_PROJECT_ID", "FIREBASE_PRIVATE_KEY", "NEXT_PUBLIC_FIREBASE_API_KEY"],
    "better-auth": ["BETTER_AUTH_SECRET", "BETTER_AUTH_URL", "openssl rand -hex 32", "drizzle-kit"],
  };

  // Wrong-provider tokens should NOT appear (cross-contamination check)
  var antiSignals = {
    "firebase": ["BETTER_AUTH_SECRET"],
    "better-auth": ["FIREBASE_PRIVATE_KEY", "NEXT_PUBLIC_FIREBASE_API_KEY"],
  };

  Object.keys(templates).forEach(function (provider) {
    var tmplPath = templates[provider];
    if (!fileExists(tmplPath)) {
      fail(provider + ": template missing");
      return;
    }
    pass(provider + ": template exists");

    var content = readFile(tmplPath);

    // Must contain at least one placeholder
    if (/\{\{[A-Z_]+\}\}/.test(content)) pass(provider + ": uses {{PLACEHOLDER}} substitution");
    else fail(provider + ": no {{PLACEHOLDER}} found");

    // Must use double-brace, not single-brace (Issue 6A)
    var singleBraceUpper = content.match(/(?<!\{)\{[A-Z_]+\}(?!\})/g);
    if (!singleBraceUpper) pass(provider + ": no stray {SINGLE_BRACE} placeholders");
    else fail(provider + ": uses {SINGLE_BRACE} — should be {{DOUBLE_BRACE}}", singleBraceUpper.join(", "));

    // Provider signals present
    var signals = providerSignals[provider];
    var missingSignals = signals.filter(function (s) { return !content.includes(s); });
    if (missingSignals.length === 0) pass(provider + ": all " + signals.length + " provider signals present");
    else fail(provider + ": missing signals", missingSignals.join(", "));

    // Wrong-provider tokens absent
    var bleed = (antiSignals[provider] || []).filter(function (s) { return content.includes(s); });
    if (bleed.length === 0) pass(provider + ": no cross-provider token bleed");
    else fail(provider + ": leaks tokens from other provider", bleed.join(", "));

    // Conditional markers must be balanced
    var openIfs = (content.match(/<!--\s*IF\s+/g) || []).length;
    var closeIfs = (content.match(/<!--\s*\/IF\s*-->/g) || []).length;
    if (openIfs === closeIfs) pass(provider + ": " + openIfs + " conditional blocks balanced");
    else fail(provider + ": unbalanced <!-- IF -->", openIfs + " open vs " + closeIfs + " close");

    // Deep links to references must point to files that exist (Issue 3A)
    var refLinkPattern = /references\/(\d{2}-[a-z-]+\.md)/g;
    var match;
    var deadLinks = [];
    while ((match = refLinkPattern.exec(content)) !== null) {
      var refFile = match[1];
      if (!fileExists("skills/auth-setup/references/" + refFile)) deadLinks.push(refFile);
    }
    if (deadLinks.length === 0) pass(provider + ": all reference deep-links resolve");
    else fail(provider + ": dead reference links", [...new Set(deadLinks)].join(", "));

    // Required sections
    var requiredSections = ["Prerequisites", "Quick Start", "Provider Configuration", "Environment Variables", "Auth Flow", "Project Structure", "Common Issues", "Production Checklist"];
    var missingSections = requiredSections.filter(function (s) { return !content.includes("## " + s) && !content.includes("# " + s); });
    if (missingSections.length === 0) pass(provider + ": all 8 required sections");
    else fail(provider + ": missing sections", missingSections.join(", "));
  });
}

testStructure();
testSyntax();
testDocs();
testSecurity();
testProviders();
testSchemas();
testComponents();
testCrossRefs();
testReadmeTemplates();

// ── Summary ───────────────────────────
var passed = results.filter(function (r) { return r.status === "pass"; }).length;
var failed = results.filter(function (r) { return r.status === "fail"; }).length;
var skipped = results.filter(function (r) { return r.status === "skip"; }).length;

console.log("\n\x1b[1m═══════════════════════════════════════════\x1b[0m");
console.log("  \x1b[32m✓ " + passed + " passed\x1b[0m");
if (failed > 0) console.log("  \x1b[31m✗ " + failed + " failed\x1b[0m");
if (skipped > 0) console.log("  \x1b[90m○ " + skipped + " skipped\x1b[0m");
console.log("  Total: " + results.length + " tests\n");

if (failed > 0) {
  console.log("\x1b[31m\x1b[1mFailures:\x1b[0m");
  var lastSec = "";
  results.filter(function (r) { return r.status === "fail"; }).forEach(function (r) {
    if (r.section !== lastSec) { console.log("  \x1b[1m" + r.section + "\x1b[0m"); lastSec = r.section; }
    console.log("    ✗ " + r.name + (r.message ? ": " + r.message : ""));
  });
  console.log("");
}

// Save JSON report
var report = { timestamp: new Date().toISOString(), summary: { total: results.length, passed: passed, failed: failed, skipped: skipped }, results: results };
fs.writeFileSync(path.join(__dirname, "last-run.json"), JSON.stringify(report, null, 2));
console.log("Report: tests/last-run.json");

process.exit(failed > 0 ? 1 : 0);
