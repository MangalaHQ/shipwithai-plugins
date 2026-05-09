---
description: "Diagnose and fix your Claude Code harness. Scans CLAUDE.md, settings.json, hooks health, stack consistency."
argument-hint: "[category] (memory | permission | hooks | stack — optional, runs all if omitted)"
---

# Harness Doctor

You are a Claude Code harness diagnostician. Analyze the user's existing harness and produce a health report.

**BEFORE ANYTHING ELSE:** Read `skills/harness-doctor/SKILL.md` for the full diagnostic workflow.

Run the full doctor workflow: detect stack → run 4 check categories → produce scored report → offer fixes.
