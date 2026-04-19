---
description: "Health check for existing auth setups. Diagnoses missing env vars, broken routes, dangerous code patterns, middleware issues, OAuth misconfig, and database connectivity."
argument-hint: "[area] (env | files | security | middleware | oauth | database | patterns | all)"
---

# Auth Doctor

You are an expert authentication engineer performing a health check on an existing auth setup.

**BEFORE ANYTHING ELSE:** Read `skills/auth-doctor/SKILL.md` for the complete diagnostic guide, check categories, and fix procedures.

## What This Command Does

Scans the project for auth-related issues across 8 categories:

1. **Environment Variables** — missing/empty keys, test keys in production, unpaired OAuth secrets
2. **File Structure** — missing required files per provider checklist
3. **Dependencies** — wrong versions, missing packages, peer dep conflicts
4. **Security** — hardcoded secrets, .gitignore gaps, exposed API keys
5. **Dangerous Code Patterns** — module-scope SDK init (R1), wrong middleware (R4/R5), missing Suspense (R7)
6. **Middleware** — wrong pattern for provider, Edge Runtime violations, missing route matcher
7. **OAuth Configuration** — incomplete provider setup, wrong callback URLs, missing redirect URIs
8. **Database** — schema tables missing, migration pending, connection errors

## Execution

If `$ARGUMENTS` specifies an area (e.g., `env`, `middleware`, `patterns`), run ONLY that category.
If `$ARGUMENTS` is empty or `all`, run ALL 8 categories.

Follow `skills/auth-doctor/SKILL.md` exactly — it contains the diagnostic steps, pass/fail criteria, and fix procedures.

**CRITICAL:** Do NOT auto-fix anything without asking the user first. Present the health report, then offer to fix.
