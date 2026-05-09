# Changelog

## [2.0.0] — 2026-05-09

### Breaking Changes
- Removed 4 stack-specific bundles (nextjs, laravel, spring-boot, fastapi)
- Removed 8 CLAUDE.md and settings.json templates (one per stack)
- Removed references/stack-detection.md

### Added
- Analysis-driven generation — any stack now supported (Go, Rust, Rails, Flutter, Django, etc.)
- `references/analysis-guide.md` — scan methodology + CLAUDE.md synthesis guide
- `references/toolchain-rules.md` — per-toolchain settings.json customizations
- `assets/base-settings.json` — single universal settings starting point

### Changed
- SKILL.md rewritten: detect → template → fill becomes scan → synthesize → write from scratch
- Output now reflects actual project structure and commands, not assumed defaults

## [1.0.0] - 2026-05-09

### Added
- `harness-setup` skill: auto-detect stack, generate CLAUDE.md + settings.json + hooks
- `harness-doctor` skill: scan harness health, produce scored report
- Support for Next.js, Laravel, Spring Boot
- Stack detection: pom.xml → Spring Boot, package.json+next → Next.js, composer.json → Laravel
- Token auto-fill: PROJECT_NAME, PORT, PKG_MANAGER, DATABASE, TEST_FRAMEWORK
- Safety hooks (user-facing): validate-command.py + protect-files.py
