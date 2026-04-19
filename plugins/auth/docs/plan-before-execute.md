# Plan-Before-Execute — shipwithai-auth

> Detailed steps for the Plan-Before-Execute workflow.
> Implements **Think Before Coding** and **Goal-Driven Execution** (see [behavioral-guidelines.md](behavioral-guidelines.md)).

After reading the blueprints (see root `CLAUDE.md` → Blueprints section), you MUST create a plan BEFORE writing any code.

---

## Step 1 — Analyze the Request

Surface assumptions before categorizing. State what you think the user wants and why — if uncertain, ask.

Categorize what is being asked:

- [ ] New plugin from scratch
- [ ] New skill added to existing plugin
- [ ] Update/fix existing skill
- [ ] Restructure/refactor

## Step 2 — Create PLAN.md

Create `PLAN.md` in the project root. Use the `PLAN.md.template` from the blueprint templates directory as the base structure. Fill in all sections.

Key sections the plan must include:

- **Objective** — what and why
- **Assumptions** — list explicitly, don't hide uncertainty
- **Blueprint compliance check**
- **Scope** — files to create, modify, NOT touch
- **Skill design** — target user, triggers, input/output, errors
- **Success criteria** — verifiable checks for each step (see [behavioral-guidelines.md §4](behavioral-guidelines.md#4-goal-driven-execution))
- **Testing plan** — 5+ test prompts
- **Checklist before implementation**

## Step 3 — Wait for Approval

Present the plan to the user. Do NOT proceed until the user confirms.

## Step 4 — Execute

Follow the plan step by step. Update `PLAN.md` with completion status after each step.

---

## When NO plan is required

These trivial changes can bypass the plan step:

- Fix typos (< 3 characters)
- Update version numbers
- Add comments
- Read/analyze files

Everything else — new skill, SKILL.md edit, new reference file, structural change, new dependency — requires a plan.
