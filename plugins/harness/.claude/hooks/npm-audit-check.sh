#!/bin/bash
# PreToolUse hook: Block npm install without --ignore-scripts
# Supply chain attack vector #1 is postinstall scripts
input=$(cat)
tool_name=$(echo "$input" | node -e "process.stdin.on('data',d=>{try{console.log(JSON.parse(d).tool_name||'')}catch{console.log('')}})")
command=$(echo "$input" | node -e "process.stdin.on('data',d=>{try{const o=JSON.parse(d);console.log((o.tool_input&&o.tool_input.command)||'')}catch{console.log('')}})")

if [ "$tool_name" != "Bash" ]; then
  exit 0
fi

# Only check npm/yarn/pnpm install commands
if ! echo "$command" | grep -qE 'npm (install|i |i$|add )|yarn add|pnpm (add|install)'; then
  exit 0
fi

# Allow if already using --ignore-scripts
if echo "$command" | grep -q '\-\-ignore-scripts'; then
  exit 0
fi

# Block install without --ignore-scripts
echo '{"error": "BLOCKED: npm install without --ignore-scripts. Postinstall scripts are the #1 supply chain attack vector. Rerun with --ignore-scripts."}' >&2
exit 2
