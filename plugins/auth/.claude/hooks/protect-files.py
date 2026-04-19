#!/usr/bin/env python3
"""PreToolUse hook: Block Read/Write/Edit on sensitive files."""
import json, sys, fnmatch, os

PROTECTED_PATTERNS = [
    # Secrets & credentials
    ".env", ".env.*", "*.pem", "*.key", "*.p12", "*.pfx",
    "secrets/*", "*credentials*", "*secret*",

    # Self-modification protection — AI CANNOT modify security system!
    ".claude/settings.json",
    ".claude/hooks/*",
    "CLAUDE.md",
    "**/CLAUDE.md",

    # Security config files
    "lefthook.yml",
    ".gitleaks.toml",
    ".github/**",

    # Lockfile protection
    "package-lock.json", "pnpm-lock.yaml", "yarn.lock",
]

ALLOWED_EXCEPTIONS = [
    ".env.example",
    ".claude/settings.local.json",
]

# READ-ONLY patterns — AI can read but CANNOT write
READ_ONLY_PATTERNS = [
    "CLAUDE.md", "**/CLAUDE.md",
    ".claude/settings.json",
]

def normalize_path(path):
    """Normalize path to prevent traversal attacks (../../.env bypass)."""
    return os.path.normpath(os.path.realpath(path))

def matches_pattern(file_path, pattern):
    """Check if file matches pattern — uses both full path and basename."""
    basename = os.path.basename(file_path)
    return (
        fnmatch.fnmatch(file_path, f"*/{pattern}") or
        fnmatch.fnmatch(file_path, f"*{pattern}") or
        fnmatch.fnmatch(basename, pattern)
    )

def main():
    try:
        data = json.load(sys.stdin)
    except json.JSONDecodeError:
        return 1

    tool = data.get("tool_name", "")
    if tool not in ("Read", "Write", "Edit"):
        return 0

    file_path = data.get("tool_input", {}).get("file_path", "")
    file_path = normalize_path(file_path)

    # Check exceptions first
    for allowed in ALLOWED_EXCEPTIONS:
        if file_path.endswith(allowed):
            return 0

    # For Write/Edit — check READ_ONLY patterns (allow Read, block Write)
    if tool in ("Write", "Edit"):
        for pattern in READ_ONLY_PATTERNS:
            if matches_pattern(file_path, pattern):
                print(f"BLOCKED: {file_path} is read-only (self-modification protection)", file=sys.stderr)
                return 2

    # Check fully protected patterns (block both Read and Write)
    for pattern in PROTECTED_PATTERNS:
        if tool == "Read" and pattern in READ_ONLY_PATTERNS:
            continue
        if matches_pattern(file_path, pattern):
            print(f"BLOCKED: {file_path} is protected", file=sys.stderr)
            return 2

    return 0

if __name__ == "__main__":
    sys.exit(main())
