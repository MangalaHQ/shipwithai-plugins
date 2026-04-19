# Testing Rules — shipwithai-auth

> Loaded by Claude Code automatically.
> Plugin-specific — different from app-level testing conventions.

## Two Kinds of Tests

| Kind | Location | Runner | Purpose |
|---|---|---|---|
| **Plugin output regression** | `tests/run-all.js` | Node | Verifies skill execution produces expected files / content |
| **Per-skill evals (trigger quality)** | `skills/<name>/evals/evals.json` | Loaded by plugin runtime | Verifies the skill triggers on the right prompts, not others |
| **End-to-end provider** | `tests/e2e-provider.js` | Node | Full auth setup against a real project fixture |
| **Benchmarks** | `tests/benchmark/` | Node | Timing + output stability |

## File Organization

- JS tests live at the repo root under `tests/`.
- Evals live inside each skill: `skills/<name>/evals/evals.json`.
- Generated output of the last run: `tests/last-run.json` (**gitignored** — do not edit by hand; it's regenerated).

## Writing Evals

Every skill must have `evals/evals.json` with at least 5 prompts:

- ≥ 3 prompts that MUST trigger the skill (strong match).
- ≥ 2 prompts that MUST NOT trigger it (near-miss / adjacent domain).

Prompts should cover: direct request, paraphrase, adjacent but distinct domain, ambiguous wording, and a known failure mode.

## Writing JS Tests

- Each test file covers ONE concern — don't mix skill output with npm-audit behavior.
- Use descriptive names: `it("should generate auth.ts with Better Auth + Google OAuth")`.
- Arrange-Act-Assert pattern.
- Never test implementation details of Claude Code itself — test the plugin's observable output.

## What to Test

- **Always test:** skill output against golden files, hook exit codes, manifest validity, schema of generated configs.
- **Skip testing:** Claude Code internals, npm registry behavior, third-party SDKs at runtime.
- **Edge cases:** empty user input, missing env vars, provider-specific quirks (Firebase service-account, Better Auth route collisions).

## Mocking Strategy

- Prefer running against a real fixture project in `tests/_fixtures/` (or equivalent) over mocks.
- Mock ONLY: npm registry responses (when benchmarking), external OAuth endpoints, time.
- Never mock the skill under test.

## Coverage

- `tests/run-all.js` pass rate must be ≥ 90% before shipping (see `QUALITY-STANDARDS.md` §6).
- Coverage is a guide, not a goal — 100% pass with weak assertions is worse than 90% with strong assertions.

## Regression Discipline

- Baseline `tests/last-run.json` before any non-trivial change.
- Compare pass/fail delta after the change.
- A new failure is a regression and blocks the PR.
