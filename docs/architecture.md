# Plugin Architecture

## Overview

All ShipWithAI plugins follow a common architecture built on the Claude Code plugin framework.

---

## Plugin Lifecycle

```
Install → Initialize → Register Commands → Execute → Output
```

## Shared Core (`shared/core/`)

The shared core provides:
- Plugin base class
- Command registration
- Configuration management
- Error handling
- Logging

## Conventions

- Each plugin is self-contained in `plugins/<name>/`
- Plugins import shared utilities from `shared/`
- No cross-plugin imports (plugins are independent)
- Each plugin has its own `package.json` and can be published independently

## Naming

- Package: `@shipwithai/<plugin-name>`
- Directory: `plugins/<plugin-name>/`
- Commands: `shipwithai:<plugin-name>:<command>`

---

*This doc is a starting point — Link (TL) to expand as architecture solidifies.*
