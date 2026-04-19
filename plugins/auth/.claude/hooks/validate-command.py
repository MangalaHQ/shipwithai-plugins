#!/usr/bin/env python3
"""PreToolUse hook: Validate Bash commands before execution."""
import json, re, sys

BLOCKED_PATTERNS = [
    # Destructive operations
    (r"rm\s+-rf\s+[/~]", "Blocked: recursive delete at root/home"),
    (r"DROP\s+(DATABASE|TABLE)", "Blocked: destructive SQL"),
    (r"TRUNCATE\s+", "Blocked: destructive SQL truncate"),
    (r">\s*/dev/sd", "Blocked: writing to raw device"),
    (r"mkfs\.", "Blocked: filesystem format"),
    (r":(\){.*\|.*&", "Blocked: fork bomb pattern"),
    (r"\bdd\s+if=", "Blocked: raw disk read/write"),

    # Git dangerous operations
    (r"git\s+push\s+--force", "Blocked: force push"),
    (r"git\s+reset\s+--hard", "Blocked: hard reset"),
    (r"git\s+(commit|push)\s+.*--no-verify", "Blocked: skipping git hooks"),

    # Insecure code patterns
    (r"chmod\s+777", "Blocked: insecure permissions"),
    (r"eval\s*\(", "Blocked: eval() is dangerous"),

    # Network exfiltration
    (r"curl.*\|\s*(bash|sh|zsh)", "Blocked: pipe to shell"),
    (r"wget.*\|\s*(bash|sh|zsh)", "Blocked: pipe to shell"),
    (r"curl\s+.*>\s*/tmp/.*&&.*\b(bash|sh)\b", "Blocked: download and execute"),
    (r"wget\s+.*-O.*&&.*\b(bash|sh)\b", "Blocked: download and execute"),

    # Inline code execution
    (r"python[23]?\s+-c\s+", "Blocked: inline Python execution"),
    (r"node\s+-e\s+", "Blocked: inline Node.js execution"),
    (r"perl\s+-e\s+", "Blocked: inline Perl execution"),
    (r"ruby\s+-e\s+", "Blocked: inline Ruby execution"),

    # Network tools
    (r"\bnc\s+(-e|-c|--exec|-l)", "Blocked: netcat shell/listen"),
    (r"\bncat\s+", "Blocked: ncat network tool"),
    (r"\bnetcat\s+", "Blocked: netcat network tool"),
    (r"\bsocat\s+", "Blocked: socat network tool"),

    # Shell nesting
    (r"\bbash\s+-c\s+", "Blocked: nested bash execution"),
    (r"\bsh\s+-c\s+", "Blocked: nested shell execution"),
    (r"\benv\s+.*=.*\bsh\b", "Blocked: env-based shell spawn"),
    (r"\bxargs\s+.*\bsh\b", "Blocked: xargs shell execution"),

    # Obfuscation
    (r"base64\s+(-d|--decode)", "Blocked: base64 decode (potential obfuscation)"),

    # System info disclosure
    (r"cat\s+/etc/(passwd|shadow|hosts)", "Blocked: reading system files"),
    (r"\bprintenv\b", "Blocked: environment variable disclosure"),

    # Publishing
    (r"npm\s+publish", "Blocked: npm publish"),
]

WARN_PATTERNS = [
    (r"npm\s+install\s+(?!-D\b)(?!--save-dev\b)", "Warning: installing production dependency"),
    (r"pip\s+install\s+(?!-e\b)", "Warning: installing pip package"),
    (r"git\s+clone\s+", "Warning: cloning external repository"),
    (r"chmod\s+", "Warning: changing file permissions"),
    (r"\bsudo\b", "Warning: sudo usage detected"),
]

def main():
    try:
        data = json.load(sys.stdin)
    except json.JSONDecodeError:
        return 1

    if data.get("tool_name") != "Bash":
        return 0

    command = data.get("tool_input", {}). get("command", "")

    for pattern, reason in BLOCKED_PATTERNS:
        if re.search(pattern, command, re.IGNORECASE):
            print(reason, file=sys.stderr)
            return 2  # EXIT 2 = BLOCK

    for pattern, reason in WARN_PATTERNS:
        if re.search(pattern, command, re.IGNORECASE):
            print(reason, file=sys.stderr)
            return 1

    return 0

if __name__ == "__main__":
    sys.exit(main())
