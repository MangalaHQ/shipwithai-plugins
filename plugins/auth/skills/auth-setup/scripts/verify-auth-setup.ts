#!/usr/bin/env node

/**
 * ShipWithAI Auth — Verify Script
 *
 * Checks that auth setup is complete and working.
 * Run after setup to catch missing config before deploying.
 *
 * Usage: npx ts-node scripts/verify-auth-setup.ts
 */

import * as fs from "fs";
import * as path from "path";

const projectRoot = process.cwd();
let hasErrors = false;
let hasWarnings = false;

function pass(message: string) {
  console.log(`  ✅ ${message}`);
}

function fail(message: string) {
  console.log(`  ❌ ${message}`);
  hasErrors = true;
}

function warn(message: string) {
  console.log(`  ⚠️  ${message}`);
  hasWarnings = true;
}

function fileExists(relativePath: string): boolean {
  return fs.existsSync(path.join(projectRoot, relativePath));
}

function envHasKey(key: string): boolean {
  const envPath = path.join(projectRoot, ".env.local");
  if (!fs.existsSync(envPath)) return false;
  const content = fs.readFileSync(envPath, "utf-8");
  const match = content.match(new RegExp(`^${key}=(.+)$`, "m"));
  return match !== null && match[1].trim() !== "" && !match[1].includes("...");
}

// ── Detect provider ───────────────────
function detectProvider(): string | null {
  const packageJsonPath = path.join(projectRoot, "package.json");
  if (!fs.existsSync(packageJsonPath)) return null;

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  if (allDeps["better-auth"]) return "better-auth";
  if (allDeps["@clerk/nextjs"]) return "clerk";
  if (allDeps["next-auth"]) return "authjs";
  if (allDeps["firebase"]) return "firebase";
  if (allDeps["@supabase/ssr"]) return "supabase";

  return null;
}

// ── Check env vars ────────────────────
function checkEnvVars(provider: string) {
  console.log("\n📋 Environment Variables:");

  if (!fileExists(".env.local")) {
    fail(".env.local not found");
    return;
  }

  pass(".env.local exists");

  const requiredEnvs: Record<string, string[]> = {
    "better-auth": ["BETTER_AUTH_SECRET", "BETTER_AUTH_URL"],
    clerk: [
      "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
      "CLERK_SECRET_KEY",
    ],
    authjs: ["AUTH_SECRET"],
    firebase: [
      "NEXT_PUBLIC_FIREBASE_API_KEY",
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    ],
    supabase: [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ],
  };

  const vars = requiredEnvs[provider] || [];
  for (const envVar of vars) {
    if (envHasKey(envVar)) {
      pass(`${envVar} is set`);
    } else {
      fail(`${envVar} is missing or empty`);
    }
  }

  // Check OAuth vars
  if (envHasKey("GOOGLE_CLIENT_ID")) {
    if (envHasKey("GOOGLE_CLIENT_SECRET")) {
      pass("Google OAuth configured");
    } else {
      fail("GOOGLE_CLIENT_ID set but GOOGLE_CLIENT_SECRET missing");
    }
  }

  if (envHasKey("GITHUB_CLIENT_ID")) {
    if (envHasKey("GITHUB_CLIENT_SECRET")) {
      pass("GitHub OAuth configured");
    } else {
      fail("GITHUB_CLIENT_ID set but GITHUB_CLIENT_SECRET missing");
    }
  }
}

// ── Check file structure ──────────────
function checkFileStructure(provider: string) {
  console.log("\n📁 File Structure:");

  // Middleware
  const middlewarePaths = ["src/middleware.ts", "middleware.ts"];
  const hasMiddleware = middlewarePaths.some(fileExists);
  if (hasMiddleware) {
    pass("Middleware file found");

    // Check middleware matcher
    const middlewarePath = middlewarePaths.find(fileExists)!;
    const content = fs.readFileSync(
      path.join(projectRoot, middlewarePath),
      "utf-8"
    );
    if (content.includes("matcher")) {
      pass("Middleware has route matcher");
    } else {
      warn("Middleware missing route matcher — may run on static assets");
    }
  } else {
    warn("No middleware.ts found — protected routes won't be enforced");
  }

  // Provider-specific checks
  const providerFiles: Record<string, string[]> = {
    "better-auth": [
      "src/lib/auth.ts",
      "src/app/api/auth/[...all]/route.ts",
    ],
    clerk: [],
    authjs: [
      "src/lib/auth.ts",
      "src/app/api/auth/[...nextauth]/route.ts",
    ],
    firebase: ["src/lib/firebase.ts"],
    supabase: [
      "src/lib/supabase/client.ts",
      "src/lib/supabase/server.ts",
    ],
  };

  const expectedFiles = providerFiles[provider] || [];
  for (const filePath of expectedFiles) {
    if (fileExists(filePath)) {
      pass(`${filePath} exists`);
    } else {
      fail(`${filePath} missing — required for ${provider}`);
    }
  }
}

// ── Check package.json ────────────────
function checkDependencies(provider: string) {
  console.log("\n📦 Dependencies:");

  if (!fileExists("package.json")) {
    fail("package.json not found");
    return;
  }

  const packageJson = JSON.parse(
    fs.readFileSync(path.join(projectRoot, "package.json"), "utf-8")
  );
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  const requiredDeps: Record<string, string[]> = {
    "better-auth": ["better-auth"],
    clerk: ["@clerk/nextjs"],
    authjs: ["next-auth"],
    firebase: ["firebase"],
    supabase: ["@supabase/supabase-js", "@supabase/ssr"],
  };

  const deps = requiredDeps[provider] || [];
  for (const dep of deps) {
    if (allDeps[dep]) {
      pass(`${dep}@${allDeps[dep]} installed`);
    } else {
      fail(`${dep} not installed`);
    }
  }

  // Check node_modules exists
  if (fileExists("node_modules")) {
    pass("node_modules exists");
  } else {
    fail("node_modules missing — run npm install");
  }
}

// ── Security checks ───────────────────
function checkSecurity() {
  console.log("\n🔒 Security:");

  // Check .gitignore
  if (fileExists(".gitignore")) {
    const gitignore = fs.readFileSync(
      path.join(projectRoot, ".gitignore"),
      "utf-8"
    );
    if (gitignore.includes(".env")) {
      pass(".env files in .gitignore");
    } else {
      fail(".env NOT in .gitignore — credentials may be committed!");
    }
  } else {
    warn("No .gitignore found");
  }

  // Check for hardcoded secrets in source
  const sourceFiles = ["src/lib/auth.ts", "src/lib/firebase.ts", "src/lib/supabase/client.ts"];
  for (const filePath of sourceFiles) {
    const fullPath = path.join(projectRoot, filePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      if (content.match(/sk_|pk_|secret_|AIza|eyJ/)) {
        fail(`${filePath} may contain hardcoded secrets!`);
      }
    }
  }

  pass("No hardcoded secrets detected in checked files");
}

// ── Dangerous code pattern checks ────
function checkDangerousPatterns(provider: string) {
  console.log("\n🛡️ Code Pattern Validation:");

  // R1: Check for module-scope SDK instantiation
  const emailPaths = ["src/lib/email.ts", "src/lib/email.js"];
  for (const p of emailPaths) {
    const fullPath = path.join(projectRoot, p);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      // Match `const|let|var x = new Resend(` at top level (not inside function)
      const lines = content.split("\n");
      let insideFunction = 0;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        insideFunction += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
        // If we're at brace depth 0 (module scope) and see `new Resend(`
        if (insideFunction <= 0 && /new\s+Resend\s*\(/.test(line) && !/\/\//.test(line.split("new Resend")[0])) {
          fail(`${p}:${i + 1} — \`new Resend()\` at module scope will crash during build/SSR (pitfall #50). Move inside a function or use lazy-init pattern.`);
        }
      }
    }
  }

  // R4: Check Better Auth middleware doesn't use auth() wrapper
  if (provider === "better-auth") {
    const mwPaths = ["src/middleware.ts", "middleware.ts"];
    for (const p of mwPaths) {
      const fullPath = path.join(projectRoot, p);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, "utf-8");
        if (/export\s*\{\s*auth\s+as\s+middleware\s*\}/.test(content) || /export\s+default\s+auth\s*\(/.test(content)) {
          fail(`${p} — Uses \`auth()\` wrapper pattern (that's Auth.js, not Better Auth). Check cookie directly: \`request.cookies.get("better-auth.session_token")\` (pitfall #43).`);
        }
      }
    }
  }

  // R5: Check Firebase middleware doesn't decode JWT
  if (provider === "firebase") {
    const mwPaths = ["src/middleware.ts", "middleware.ts"];
    for (const p of mwPaths) {
      const fullPath = path.join(projectRoot, p);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, "utf-8");
        if (/atob\s*\(|Buffer\.from\s*\(.*base64|JSON\.parse.*split.*\./s.test(content)) {
          fail(`${p} — Decoding JWT in middleware (Edge Runtime). This gives FALSE security — use cookie existence check only. Real verification in (protected)/layout.tsx (pitfall #28).`);
        }
        if (/firebase-admin|verifyIdToken|verifySessionCookie/.test(content)) {
          fail(`${p} — Firebase Admin SDK imported in middleware. Edge Runtime cannot run Admin SDK. Only check cookie existence here (pitfall #28).`);
        }
      }
    }
  }

  // R2: Check session cookie is awaited before redirect (Firebase)
  if (provider === "firebase") {
    const loginPaths = ["src/app/(auth)/login/page.tsx", "app/(auth)/login/page.tsx"];
    for (const p of loginPaths) {
      const fullPath = path.join(projectRoot, p);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, "utf-8");
        // Check if redirect happens and createSessionCookie is present
        if (/router\.push|window\.location/.test(content) && !/await\s+createSessionCookie/.test(content)) {
          warn(`${p} — Redirect found but no \`await createSessionCookie()\` before it. Session may not persist (pitfall #22).`);
        }
      }
    }
  }

  // R7: Check reset-password has Suspense wrapper
  const resetPaths = ["src/app/(auth)/reset-password/page.tsx", "app/(auth)/reset-password/page.tsx"];
  for (const p of resetPaths) {
    const fullPath = path.join(projectRoot, p);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      if (/useSearchParams/.test(content) && !/Suspense/.test(content)) {
        fail(`${p} — Uses \`useSearchParams()\` without \`<Suspense>\` wrapper. Next.js 14+ build will fail (pitfall #47).`);
      }
    }
  }

  if (!hasErrors) {
    pass("No dangerous code patterns detected");
  }
}

// ── Main ──────────────────────────────
console.log("\n🔐 ShipWithAI Auth — Setup Verification\n");

const provider = detectProvider();
if (!provider) {
  fail("Could not detect auth provider — no auth packages found in package.json");
  process.exit(1);
}

console.log(`Detected provider: ${provider}`);

checkEnvVars(provider);
checkFileStructure(provider);
checkDependencies(provider);
checkSecurity();
checkDangerousPatterns(provider);

// ── Summary ───────────────────────────
console.log("\n" + "─".repeat(50));
if (hasErrors) {
  console.log("❌ Verification FAILED — fix errors above before deploying.");
  process.exit(1);
} else if (hasWarnings) {
  console.log("⚠️  Verification PASSED with warnings — review items above.");
} else {
  console.log("✅ All checks passed! Auth setup looks good.");
}
console.log("");
