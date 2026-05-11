# Update Protocol — shipwithai-auth

> Detailed steps for updating, fixing, or modifying anything in this plugin.
> Root `CLAUDE.md` points to this document.
> Reference: `UPDATE-WORKFLOW.md` in the blueprint path.

When asked to UPDATE, FIX, IMPROVE, or MODIFY anything in this plugin, follow this protocol INSTEAD of the new-creation workflow.

---

## Step 1 — AUDIT (mandatory, every time)

Before proposing ANY changes, read ALL of these:

- Every `SKILL.md` in `skills/`
- `manifest.json`
- `CHANGELOG.md`
- `plugin.json` (if present)
- `CLAUDE.md` (root)

Produce an audit summary:

```
Skills inventory: [name] v[version] — [lines] lines — [status]
Dependency map: [skill A] → depends on → [skill B]
Issues detected: [any problems found]
```

## Step 2 — IMPACT ANALYSIS (mandatory)

For every proposed change, answer:

- Which files will be MODIFIED? (list each + what changes)
- Which files will be CREATED? (list each + purpose)
- Which files will NOT be touched? (list each + why)
- Which OTHER skills are AFFECTED?
- Is this BACKWARD COMPATIBLE?

## Step 3 — CREATE UPDATE PLAN

Create or update `PLAN.md` with:

- Current state summary (from audit)
- Impact analysis
- Regression test prompts (existing functionality still works)
- New feature test prompts (the change works)
- Version bump: patch (fix) / minor (feature) / major (breaking)

## Step 4 — WAIT for user approval

## Step 5 — EXECUTE with safety rules

> These rules implement **Surgical Changes** and **Goal-Driven Execution** (see [behavioral-guidelines.md](behavioral-guidelines.md)).

```
RULE 1: Read before write — ALWAYS read a file before modifying it
RULE 2: Edit, don't rewrite — Change specific sections, not whole files
RULE 3: One file at a time — Modify → verify → next file
RULE 4: Test after each change — Don't batch all changes
RULE 5: Stay in scope — Don't fix unrelated things
RULE 6: Match existing style — Even if you'd do it differently
RULE 7: Every changed line must trace to the user's request
```

## Step 6 — POST-UPDATE VERIFICATION

1. Run regression tests (`node tests/run-all.js`)
2. Run new feature tests
3. Check all reference links still valid
4. Update `CHANGELOG.md`
5. Bump version in `plugin.json`
6. Update `manifest.json` if skills added/removed
7. Show diff summary of all changes to user
