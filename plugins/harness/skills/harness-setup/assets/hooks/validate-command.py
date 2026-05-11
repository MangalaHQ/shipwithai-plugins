#!/usr/bin/env python3
"""PreToolUse hook: Block dangerous bash commands. Exit 2 to hard-block."""
import json, re, sys

BLOCKED = [
    (r"rm\s+-rf\s+[/~]", "Blocked: recursive delete at root/home"),
    (r"DROP\s+(DATABASE|TABLE)", "Blocked: destructive SQL"),
    (r":\s*\(\s*\)\s*\{.*\|.*&", "Blocked: fork bomb"),
    (r"\bdd\s+if=", "Blocked: raw disk access"),
    (r"git\s+push\s+(--force|-f)\b", "Blocked: force push"),
    (r"git\s+reset\s+--hard", "Blocked: hard reset"),
    (r"git\s+(commit|push)\s+.*--no-verify", "Blocked: skipping git hooks"),
    (r"curl[^|]*\|\s*(bash|sh|zsh)", "Blocked: curl pipe to shell"),
    (r"wget[^|]*\|\s*(bash|sh|zsh)", "Blocked: wget pipe to shell"),
    (r"\bnc\s+(-e|-c|--exec)", "Blocked: netcat shell"),
    (r"base64\s+(--decode|-d)\s", "Blocked: base64 decode (obfuscation risk)"),
    (r"\beval\s*\(", "Blocked: eval() execution"),
    (r"python[23]?\s+-c\s+['\"]", "Blocked: inline Python execution"),
    (r"node\s+-e\s+['\"]", "Blocked: inline Node.js execution"),
    (r"npm\s+publish\b", "Blocked: npm publish (use CI)"),
    (r"chmod\s+777", "Blocked: world-writable permissions"),
    (r"cat\s+/etc/(passwd|shadow)", "Blocked: reading system files"),
]

def main():
    try:
        data = json.load(sys.stdin)
    except Exception:
        sys.exit(0)

    if data.get("tool_name") != "Bash":
        sys.exit(0)

    command = data.get("tool_input", {}).get("command", "")

    for pattern, reason in BLOCKED:
        if re.search(pattern, command, re.IGNORECASE):
            print(f"🚫 {reason}", file=sys.stderr)
            print(f"   Command: {command[:120]}", file=sys.stderr)
            sys.exit(2)

    sys.exit(0)

if __name__ == "__main__":
    main()
