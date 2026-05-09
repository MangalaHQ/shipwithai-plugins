# Changelog

## [1.0.0] - 2026-05-09

### Added
- `harness-setup` skill: auto-detect stack, generate CLAUDE.md + settings.json + hooks
- `harness-doctor` skill: scan harness health, produce scored report
- Support for Next.js, Laravel, Spring Boot
- Stack detection: pom.xml → Spring Boot, package.json+next → Next.js, composer.json → Laravel
- Token auto-fill: PROJECT_NAME, PORT, PKG_MANAGER, DATABASE, TEST_FRAMEWORK
- Safety hooks (user-facing): validate-command.py + protect-files.py
