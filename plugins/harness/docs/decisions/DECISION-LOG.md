# Decision Log — Lightweight Decisions (Y-Statements)

> Append decisions here using the Y-Statement format.
> For major decisions, create a full ADR (see [README.md](README.md)).

## Format

```
YYYY-MM-DD | In the context of [situation], facing [concern], we decided [decision], to achieve [goal], accepting [tradeoff].
```

## Log

<!-- Append new decisions ABOVE this line -->

- **2026-04-18** | In the context of adopting the CLAUDE.md framework, facing overlap between `QUALITY-STANDARDS.md` and `.claude/rules/plugin.md`, we decided to keep `QUALITY-STANDARDS.md` as SOT and make `.claude/rules/plugin.md` a thin pointer, to achieve single source of truth, accepting slight Claude Code context overhead (two files loaded).

- **2026-04-18** | In the context of `validate-command.py` blocking `npm publish`, facing the need to release companion tools occasionally, we decided to keep the block and require maintainers to run `npm publish` from a terminal outside Claude Code, to achieve stronger guardrails by default, accepting manual out-of-band workflow for the rare publish case.

- **2026-04-18** | In the context of `blueprint_path` varying per contributor machine, facing the need to keep CLAUDE.md checked into git, we decided to move `blueprint_path` into `CLAUDE.local.md` (gitignored), to achieve reproducible team config, accepting the requirement that every contributor creates their own `CLAUDE.local.md`.
