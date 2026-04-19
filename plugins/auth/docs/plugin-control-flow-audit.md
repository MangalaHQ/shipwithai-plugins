# ShipWithAI Auth — Plugin Control Flow Audit

> "AI uses 60% of the time but only makes 20% of decisions. A good plugin is one with stopping points where humans control at the right places."

## Current Flow: What does AI decide? What does the human decide?

```
STEP                          WHO DECIDES      RISK IF WRONG
─────────────────────────────────────────────────────────────
1. Choose provider            👤 Human         LOW — can redo
1b. Detect theme              🤖 AI auto       LOW — CSS only
2. Read provider guide        🤖 AI auto       —
3. Email provider             👤 Human         LOW — can change
4. OAuth selection             👤 Human         LOW — additive
5. Database schema            🤖 AI auto       ⚠️ MEDIUM — wrong schema = data loss
6. Copy UI components         🤖 AI auto       LOW — visual only
7. Create config files        🤖 AI auto       🔴 HIGH — wrong config = auth broken
   - auth.ts                  🤖 AI auto       🔴 HIGH
   - email.ts                 🤖 AI auto       🔴 HIGH (pitfall #50)
   - middleware.ts             🤖 AI auto       🔴 HIGH (pitfall #43/#28)
   - env vars                 🤖 AI auto       ⚠️ MEDIUM
   - next.config.ts           🤖 AI auto       ⚠️ MEDIUM
   - API route handler        🤖 AI auto       LOW — boilerplate
8. Run migrations             🤖 AI auto       ⚠️ MEDIUM — DB changes
9. Verify                     🤖 AI auto       —
10. Test flow                 👤 Human         —
```

## Analysis: Where is the problem?

### 🔴 Problem 1: AI makes too many decisions at HIGH-RISK steps (Step 7)
- AI creates 6-8 config files continuously WITHOUT STOPPING
- User only sees the final result
- If 1 file is wrong (for example: email.ts pitfall #50) → entire stack is broken
- User doesn't know which files are critical, which are boilerplate

### 🔴 Problem 2: No checkpoint between "creating files" and "running migration"
- AI creates schema → runs `drizzle-kit push` immediately
- If schema is wrong → DB has already been modified → rollback is complex
- User should review schema before pushing

### ⚠️ Problem 3: setup.md says to read pitfalls but DOES NOT enforce it
- `setup.md` line 10: "Also read 09-common-pitfalls.md"
- In practice: AI skips it because file is 270 lines, context window is limited
- Result: pitfall #50 is violated on the first dogfooding attempt

### ⚠️ Problem 4: Verify runs AFTER everything has been created
- Verify script finds errors → but by then 15 files are already wrong
- Should validate EACH file immediately after creation (hook has fixed part of this)

### ✅ What works well
- Step 1 (provider choice): Clear decision framework, human decides
- Step 3 (email): Explicit STOP-AND-ASK, WAIT instruction
- Step 4 (OAuth): Multi-select, human decides
- 3-layer defense (template + rules + hook): Good safety net

## Proposed: Human Checkpoints

### Checkpoint 1: Pre-config Review (NEW — after Step 5, before Step 7)
```
STOP. Show user:
"I'm about to create these config files:
 1. src/lib/auth.ts — Server auth config [Better Auth + SQLite + Resend]
 2. src/lib/auth-client.ts — Client auth setup
 3. src/lib/email.ts — Email sending (Resend, lazy-init)
 4. src/middleware.ts — Route protection (cookie-based)
 5. src/app/api/auth/[...all]/route.ts — API handler
 6. .env.local — Environment variables

Shall I proceed, or do you want to review any of these first?"
```
WHY: User sees the full picture before AI writes anything. Can catch wrong assumptions.

### Checkpoint 2: Schema Review (NEW — after schema generation, before migration)
```
STOP. Show user:
"Here's the database schema I'll create:
 [show schema summary: tables, columns, relations]

This will run `npx drizzle-kit push` which modifies your database.
Proceed with migration?"
```
WHY: DB changes are irreversible. User must approve.

### Checkpoint 3: Post-setup Verification (EXISTS — enhance)
```
Current: AI runs verify script silently
Proposed: Show results to user with action items

"Setup complete. Verification results:
 ✅ 12/12 files created
 ✅ No dangerous patterns detected
 ⚠️  RESEND_API_KEY in .env.local — but you're on free tier
     (emails only send to YOUR email until you verify a domain)
 
 Ready to test? Start with: npm run dev → visit /register"
```
WHY: User knows exactly what state the project is in.

### Checkpoint 4: OAuth Credentials (NEW — before testing OAuth)
```
STOP. Before testing Google login:
"Have you completed these steps?
 □ Created OAuth credentials in Google Cloud Console
 □ Added http://localhost:3000/api/auth/callback/google as redirect URI
 □ Added GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local

Google OAuth will fail without these. Need help setting up?"
```
WHY: OAuth is the #1 source of "it doesn't work" — always external config issue.

## Decision Matrix: When to STOP vs when to AUTO

| Signal                      | Action        | Why                           |
|-----------------------------|---------------|-------------------------------|
| Touches database            | 🛑 STOP       | Irreversible                  |
| Touches .env / secrets      | 🛑 STOP       | Security-sensitive            |
| Creates auth config         | ⚡ PREVIEW     | Show plan, don't ask          |
| Copies UI component         | 🤖 AUTO        | Low risk, reversible          |
| Installs npm package        | 🤖 AUTO        | Low risk, reversible          |
| Runs build/verify           | 🤖 AUTO        | Read-only check               |
| Modifies existing file      | 🛑 STOP       | May break existing code       |
| Creates new file            | 🤖 AUTO        | No existing code at risk      |
| External service setup      | 🛑 STOP       | Requires human action outside |
