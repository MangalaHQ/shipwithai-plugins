# Phase Model Reference

> INTERNAL — Never expose phase numbers to users.
> Used by bundles to decide which features to include.

## What Phases Mean Internally

| Phase | Includes |
|---|---|
| 0 | CLAUDE.md only (< 60 lines) |
| 1 | CLAUDE.md + settings.json |
| 2 | CLAUDE.md + settings.json + 2 hooks + docs/ARCHITECTURE.md |
| 3 | All of 2 + sub-directory CLAUDE.md + ADR + full 7-layer security |

**MVP ships Phase 2 content for all users.** There is no user-visible "phase selection".

## Phase Detection from Project Signals

```python
def suggest_phase(signals):
    if signals["has_ci"] or signals["has_docker"]:
        return 3  # Production Hardened — suggest doctor for phase-3 upgrade
    if signals["has_env_example"] or signals["contributors"] > 1:
        return 2  # Team Foundation — our standard MVP output
    if signals["has_tests"]:
        return 1  # Solo Dev Serious — still output phase 2, it's a superset
    return 0      # Zero to Working — output phase 2 anyway

signals = {
    "has_tests":       any(Path(p).exists() for p in ["test/", "tests/", "src/test/"]),
    "has_env_example": Path(".env.example").exists(),
    "has_ci":          Path(".github/workflows/").exists(),
    "has_docker":      any(Path(p).exists() for p in ["Dockerfile", "docker-compose.yml"]),
    "contributors":    len(set(run("git log --format=%ae").split("\n"))),
}
```

MVP always generates Phase 2 content regardless of signal. Phase suggestion is used only by `harness-doctor` to suggest upgrades.

## Why Phase 3 is Excluded from MVP

Phase 3 requires:
- Sub-directory CLAUDE.md files (per module)
- Initial ADR generation ("Why [stack]")
- Full 7-layer security (MCP deny rules, CI workflow, git hooks)
- SCHEMA.md token documentation

This is v1.1 work. Phase 2 content covers 90% of solo indie hacker value.
