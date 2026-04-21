#!/usr/bin/env node
/**
 * Manual verification script for all 13 GitHub issues.
 * Run: node plugins/auth/tests/verify-issues.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SKILLS = path.join(ROOT, "skills", "auth-setup");

let passed = 0;
let failed = 0;

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function check(issue, description, condition) {
  if (condition) {
    console.log(`  \x1b[32m\u2713\x1b[0m #${issue}: ${description}`);
    passed++;
  } else {
    console.log(`  \x1b[31m\u2717\x1b[0m #${issue}: ${description}`);
    failed++;
  }
}

console.log("\n\x1b[1m\x1b[35m\u2550\u2550\u2550 Issue Verification \u2550\u2550\u2550\x1b[0m\n");

// ─── ISSUE #15: email.ts no longer logs full HTML ───
console.log("\x1b[1m\x1b[36m\u2500\u2500 Sprint 1: P0 Security\x1b[0m");
const email = read("skills/auth-setup/assets/config/email.ts");
check(15, "No full HTML logging (no 'HTML: ${html}')", !email.includes("HTML: ${html}"));
check(15, "Logs action URL instead", email.includes("Action URL (dev only)"));
check(15, "Security comment present", email.includes("SECURITY:") && email.includes("Never log in production"));

// ─── ISSUE #3: CSRF already in template ───
const firebaseConfig = read("skills/auth-setup/assets/config/firebase.config.ts");
check(3, "CSRF Origin validation in template", firebaseConfig.includes("origin !== allowedOrigin"));
check(3, "NEXT_PUBLIC_APP_URL check", firebaseConfig.includes("NEXT_PUBLIC_APP_URL"));

// ─── ISSUE #4: Token revocation already in template ───
check(4, "verifySessionCookie in DELETE handler", firebaseConfig.includes("verifySessionCookie(sessionCookie)"));
check(4, "revokeRefreshTokens called", firebaseConfig.includes("revokeRefreshTokens(decodedClaims.sub)"));

// ─── ISSUE #8: next.config.ts exists with security headers ───
const nextConfig = read("skills/auth-setup/assets/config/next.config.ts");
check(8, "X-Frame-Options header", nextConfig.includes("X-Frame-Options"));
check(8, "Strict-Transport-Security header", nextConfig.includes("Strict-Transport-Security"));
check(8, "X-Content-Type-Options header", nextConfig.includes("X-Content-Type-Options"));

// ─── ISSUE #13: Better Auth login detects EMAIL_NOT_VERIFIED ───
console.log("\n\x1b[1m\x1b[36m\u2500\u2500 Sprint 2: P1 High Priority\x1b[0m");
const baLogin = read("skills/auth-setup/assets/components/better-auth/login-page.tsx");
check(13, "Checks error.code EMAIL_NOT_VERIFIED", baLogin.includes('error.code === "EMAIL_NOT_VERIFIED"'));
check(13, "Shows verify email message", baLogin.includes("Please verify your email before signing in"));
check(13, "Generic fallback for other errors", baLogin.includes("Unable to sign in. Please check your credentials."));

// ─── ISSUE #12: Register pages show verification notice ───
const baRegister = read("skills/auth-setup/assets/components/better-auth/register-page.tsx");
check(12, "Better Auth: isRegistered state exists", baRegister.includes("isRegistered, setIsRegistered"));
check(12, "Better Auth: setIsRegistered(true) on signup", baRegister.includes("setIsRegistered(true)"));
check(12, "Better Auth: Check your email UI", baRegister.includes("Check your email"));

const fbRegister = read("skills/auth-setup/assets/components/firebase/register-page.tsx");
check(12, "Firebase: isRegistered state exists", fbRegister.includes("isRegistered, setIsRegistered"));
check(12, "Firebase: conditional emailVerified check", fbRegister.includes("!result.user.emailVerified"));
check(12, "Firebase: Check your email UI", fbRegister.includes("Check your email"));
check(12, "Firebase: sendEmailVerification called", fbRegister.includes("sendEmailVerification(result.user)"));

// ─── ISSUE #11: OAuth timeout safety reset ───
check(11, "Better Auth login: setTimeout 10_000", baLogin.includes("10_000") && baLogin.includes("setTimeout"));
check(11, "Better Auth login: clearTimeout in catch", baLogin.includes("clearTimeout(timeout)"));
check(11, "Better Auth login: credentials error message", baLogin.includes("credentials are configured in .env.local"));
check(11, "Better Auth register: setTimeout 10_000", baRegister.includes("10_000") && baRegister.includes("setTimeout"));
check(11, "Better Auth register: clearTimeout in catch", baRegister.includes("clearTimeout(timeout)"));

// ─── ISSUE #5: Firebase middleware docs ───
const fbMiddleware = read("skills/auth-setup/assets/middleware/firebase/nextjs-middleware.ts");
check(5, "SEE ALSO comment added", fbMiddleware.includes("SEE ALSO: 05-firebase-auth-guide.md"));
check(5, "References getServerUser pattern", fbMiddleware.includes("getServerUser()"));

// ─── ISSUE #6: Firebase error enumeration fix ───
console.log("\n\x1b[1m\x1b[36m\u2500\u2500 Sprint 3: P2 Security\x1b[0m");
const fbForgot = read("skills/auth-setup/assets/components/firebase/forgot-password.tsx");
check(6, "No console.error with raw error", !fbForgot.includes("console.error"));
check(6, "Always shows success (prevents enumeration)", fbForgot.includes("Always show success to prevent email enumeration"));

// ─── ISSUE #7: Token refresh recovery ───
check(7, "Signs out on 401/403", firebaseConfig.includes("response.status === 401 || response.status === 403"));
check(7, "Redirects to /login", firebaseConfig.includes('window.location.href = "/login"'));
check(7, "Calls firebaseAuth.signOut()", firebaseConfig.includes("await firebaseAuth.signOut()"));

// ─── ISSUE #9: Rate limiting memory guard ───
const fbGuide = read("skills/auth-setup/references/05-firebase-auth-guide.md");
check(9, "Memory leak guard (size > 10_000)", fbGuide.includes("attempts.size > 10_000"));
check(9, "Eviction loop for expired entries", fbGuide.includes("attempts.delete(k)"));
check(9, "Security checklist callout", fbGuide.includes("Security Checklist:"));

const skillmd = read("skills/auth-setup/SKILL.md");
check(9, "SKILL.md rate limit checklist expanded", skillmd.includes("Upstash for serverless, in-memory for self-hosted"));

// ─── ISSUE #10: Endpoint mapping table ───
console.log("\n\x1b[1m\x1b[36m\u2500\u2500 Sprint 4: P2 Documentation\x1b[0m");
const baGuide = read("skills/auth-setup/references/02-better-auth-guide.md");
check(10, "API Endpoint Mapping section exists", baGuide.includes("API Endpoint Mapping"));
check(10, "Documents forget-password endpoint", baGuide.includes("POST /api/auth/forget-password"));
check(10, "Gotcha about naming mismatch", baGuide.includes("requestPasswordReset()") && baGuide.includes("forget-password"));

// ─── ISSUE #14: README template ───
const templateExists = fs.existsSync(path.join(SKILLS, "assets/templates/README.template.md"));
check(14, "README.template.md file exists", templateExists);
if (templateExists) {
  const tpl = fs.readFileSync(path.join(SKILLS, "assets/templates/README.template.md"), "utf8");
  check(14, "Template has Quick Start section", tpl.includes("Quick Start"));
  check(14, "Template has Auth Routes table", tpl.includes("Auth Routes"));
  check(14, "Template has Environment Variables", tpl.includes("Environment Variables"));
  check(14, "Template has Production Checklist", tpl.includes("Production Checklist"));
}
check(14, "SKILL.md Step 8 references template", skillmd.includes("assets/templates/README.template.md"));

// ─── VERSION & CHANGELOG ───
console.log("\n\x1b[1m\x1b[36m\u2500\u2500 Version & Changelog\x1b[0m");
check("VER", "SKILL.md version is 1.8.0", skillmd.includes("version: 1.8.0"));
const claudemd = read("CLAUDE.md");
check("VER", "CLAUDE.md version is 1.8.0", claudemd.includes("plugin_version: 1.8.0"));
const pluginjson = JSON.parse(read(".claude-plugin/plugin.json"));
check("VER", "plugin.json version is 1.8.0", pluginjson.version === "1.8.0");

const changelog = read("CHANGELOG.md");
check("CL", "CHANGELOG has v1.8.0 entry", changelog.includes("[1.8.0] - 2026-04-20"));
check("CL", "Migration note present", changelog.includes("Migration Note"));
check("CL", "All 13 issues referenced",
  changelog.includes("#15") && changelog.includes("#3") && changelog.includes("#4") &&
  changelog.includes("#8") && changelog.includes("#13") && changelog.includes("#12") &&
  changelog.includes("#11") && changelog.includes("#5") && changelog.includes("#6") &&
  changelog.includes("#7") && changelog.includes("#9") && changelog.includes("#10") &&
  changelog.includes("#14"));

// ─── SUMMARY ───
console.log("\n\x1b[1m\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\x1b[0m");
console.log(`  \x1b[32m\u2713 ${passed} passed\x1b[0m`);
if (failed > 0) console.log(`  \x1b[31m\u2717 ${failed} failed\x1b[0m`);
console.log(`  Total: ${passed + failed} checks\n`);
process.exit(failed > 0 ? 1 : 0);
