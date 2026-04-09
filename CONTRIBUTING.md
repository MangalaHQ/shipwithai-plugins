# Contributing to ShipWithAI Plugins

Thank you for your interest in contributing! This guide will help you get started.

---

## Getting Started

1. **Fork** this repository
2. **Clone** your fork locally
3. **Install** dependencies: `npm install`
4. **Run tests** to verify setup: `npm run test`

## Finding Work

Look for issues labeled:
- `contributor-friendly` — Great for new contributors (Explorer tier)
- `contributor-intermediate` — For experienced contributors (Builder tier)
- `contributor-advanced` — For trusted contributors (Champion tier)
- `good-first-issue` — Your very first contribution

## Making Changes

1. Create a branch: `git checkout -b feat/your-feature`
2. Make your changes
3. Write/update tests
4. Run tests: `npm run test -- --filter=your-plugin`
5. Update README if needed
6. Create a changeset: `npx changeset` (describe your change)
7. Push and open a PR

## Pull Request Process

- Fill in the PR template
- Link the issue you're addressing
- Ensure CI passes (tests + lint)
- Wait for review from Leonard (EM) + Link (TL)
- Address feedback
- Once approved, Leonard or Link will merge

## Code Standards

- TypeScript strict mode
- Tests required for new features
- Follow existing code patterns
- Clear, descriptive commit messages
- Comments in English

## Contributor Tiers

We have a contributor growth path:

| Tier | Requirements | What you get |
|---|---|---|
| **Explorer** | New contributor | Repo fork access, mentoring |
| **Builder** | 3+ PRs, 4 weeks consistent | Branch access, internal channels |
| **Champion** | 5+ features, mentored others | Direct push, sprint planning invite |

See [shipwithai-community/contributors/](../shipwithai-community/contributors/) for details.

## Questions?

- Open a Discussion on this repo
- Ask in the community Discord/Slack
- Tag @Leonard or @Link in your PR

---

*We value every contribution — small fixes are just as important as big features!*
