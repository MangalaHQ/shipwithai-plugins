# Behavioral Guidelines — shipwithai-auth

> Detailed behavioral rules for Claude Code working in this plugin.
> Root `CLAUDE.md` contains the 1-line summary; the authoritative details live here.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks (typo fixes, version bumps), use judgment.

---

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing anything in this auth plugin:

- State your assumptions explicitly. If uncertain, ask.
  - Which auth provider is the user targeting? Don't default to one silently.
  - Is this for new setup or migrating from an existing provider?
  - What OAuth scopes/permissions are actually needed?
- If multiple interpretations exist, present them — don't pick silently.
  - "Add session handling" → server-side sessions? JWT? cookie-based? Each provider handles this differently.
- If a simpler approach exists, say so. Push back when warranted.
  - If the user asks for custom token rotation but their provider handles it natively, say so.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
  - Don't add role-based access control when the user only asked for login/logout.
  - Don't add multi-provider support when they specified one provider.
- No abstractions for single-use code.
  - One auth provider? Direct implementation. Don't build a provider factory.
- No "flexibility" or "configurability" that wasn't requested.
  - Don't add config options for token expiry, session strategy, callback URLs if the user didn't ask.
- No error handling for impossible scenarios.
  - Don't handle "what if the user has 3 auth providers simultaneously" unless that's the requirement.
- If you write 200 lines and it could be 50, rewrite it.

**The test:** Would a senior engineer say this is overcomplicated? If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code in this plugin:

- Don't "improve" adjacent middleware, schema, or component code.
- Don't refactor auth config patterns that aren't broken.
- Match existing style — if the project uses `auth.ts` with a specific config pattern, follow it.
- If you notice unrelated issues (e.g., deprecated provider API usage), mention it — don't fix it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

**The test:** Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform auth tasks into verifiable goals:

| Instead of... | Transform to... |
|---|---|
| "Add Google OAuth" | "Configure provider → test redirect → verify callback → confirm session creation" |
| "Fix login not working" | "Reproduce the failure → identify root cause → fix → verify login flow end-to-end" |
| "Add protected routes" | "Add middleware → test unauthenticated access returns 401 → test authenticated access passes" |
| "Add session handling" | "Configure session → verify creation on login → verify persistence on refresh → verify destruction on logout" |

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make auth work") require constant clarification.
