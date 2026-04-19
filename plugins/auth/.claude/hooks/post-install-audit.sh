#!/bin/bash
# PostToolUse hook: Run npm audit after every install command
input=$(cat)
tool_name=$(echo "$input" | node -e "process.stdin.on('data',d=>{try{console.log(JSON.parse(d).tool_name||'')}catch{console.log('')}})")
command=$(echo "$input" | node -e "process.stdin.on('data',d=>{try{const o=JSON.parse(d);console.log((o.tool_input&&o.tool_input.command)||'')}catch{console.log('')}})")

if [ "$tool_name" != "Bash" ]; then
  exit 0
fi

if ! echo "$command" | grep -qE 'npm (install|i |i$|add )|yarn add|pnpm (add|install)'; then
  exit 0
fi

audit_output=$(npm audit --json 2>/dev/null)
if [ -n "$audit_output" ]; then
  vuln_info=$(echo "$audit_output" | node -e "
    process.stdin.on('data', d => {
      try {
        const o = JSON.parse(d);
        const v = o.metadata && o.metadata.vulnerabilities || {};
        const total = v.total || 0;
        const high = v.high || 0;
        const critical = v.critical || 0;
        console.log(total + ' ' + critical + ' ' + high);
      } catch { console.log('0 0 0'); }
    });
  ")
  vuln_count=$(echo "$vuln_info" | awk '{print $1}')
  critical=$(echo "$vuln_info" | awk '{print $2}')
  high=$(echo "$vuln_info" | awk '{print $3}')

  if [ "$vuln_count" -gt 0 ] 2>/dev/null; then
    echo "WARNING: npm audit found $vuln_count vulnerabilities ($critical critical, $high high). Run 'npm audit' for details."
  fi
fi

exit 0
