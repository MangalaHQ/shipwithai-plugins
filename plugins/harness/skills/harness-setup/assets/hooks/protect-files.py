#!/usr/bin/env python3
"""PostToolUse hook: Warn on writes to sensitive files. Exit 2 to hard-block secrets."""
import json, re, sys

HARD_BLOCK = [
    r"\.env$",
    r"\.env\.production$",
    r"\.env\.staging$",
    r".*\.pem$",
    r".*\.key$",
    r".*id_rsa$",
    r".*id_ed25519$",
]

WARN = [
    r"\.claude/settings\.json$",
    r"CLAUDE\.md$",
    r"\.gitignore$",
    r"package\.json$",
    r"composer\.json$",
    r"pom\.xml$",
]

def main():
    try:
        data = json.load(sys.stdin)
    except Exception:
        sys.exit(0)

    tool = data.get("tool_name", "")
    if tool not in ("Write", "Edit"):
        sys.exit(0)

    file_path = data.get("tool_input", {}).get("file_path", "")

    for pattern in HARD_BLOCK:
        if re.search(pattern, file_path):
            print(f"🚫 Blocked: writing to protected file: {file_path}", file=sys.stderr)
            print("   Reason: secrets/key files must never be committed.", file=sys.stderr)
            sys.exit(2)

    for pattern in WARN:
        if re.search(pattern, file_path):
            print(f"⚠️  Warning: modifying sensitive config: {file_path}", file=sys.stderr)
            break

    sys.exit(0)

if __name__ == "__main__":
    main()
