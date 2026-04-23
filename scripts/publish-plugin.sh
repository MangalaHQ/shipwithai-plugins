#!/usr/bin/env bash
#
# publish-plugin.sh — Extract a single plugin from the monorepo and publish to marketplace
#
# Usage:
#   ./scripts/publish-plugin.sh auth          # Publish plugins/auth
#   ./scripts/publish-plugin.sh auth --dry-run  # Preview without publishing
#
# What it does:
#   1. Validates plugin structure (required files exist)
#   2. Extracts plugin to a clean temp directory (no .git, no .omc, no worktrees)
#   3. Verifies version consistency (plugin.json, marketplace.json, manifest.json)
#   4. Publishes to Claude plugin marketplace (or dry-run)

set -euo pipefail

PLUGIN_NAME="${1:?Usage: $0 <plugin-name> [--dry-run]}"
DRY_RUN="${2:-}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PLUGIN_DIR="${REPO_ROOT}/plugins/${PLUGIN_NAME}"
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()   { echo -e "${GREEN}[publish]${NC} $*"; }
warn()  { echo -e "${YELLOW}[warn]${NC} $*"; }
error() { echo -e "${RED}[error]${NC} $*" >&2; }
die()   { error "$*"; rm -rf "$TEMP_DIR"; exit 1; }

# ------------------------------------------------------------------
# 1. Validate plugin exists
# ------------------------------------------------------------------
[ -d "$PLUGIN_DIR" ] || die "Plugin not found: $PLUGIN_DIR"
log "Publishing plugin: ${PLUGIN_NAME}"

# ------------------------------------------------------------------
# 2. Validate required files
# ------------------------------------------------------------------
REQUIRED_FILES=(
  ".claude-plugin/plugin.json"
  "manifest.json"
  "CLAUDE.md"
  "README.md"
  "CHANGELOG.md"
)

MISSING=0
for f in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "${PLUGIN_DIR}/${f}" ]; then
    error "Missing required file: ${f}"
    MISSING=1
  fi
done

# Check at least one skill with SKILL.md and evals
SKILL_COUNT=$(find "${PLUGIN_DIR}/skills" -name "SKILL.md" 2>/dev/null | wc -l)
if [ "$SKILL_COUNT" -eq 0 ]; then
  error "No skills found (need at least one skills/*/SKILL.md)"
  MISSING=1
fi

EVAL_COUNT=$(find "${PLUGIN_DIR}/skills" -name "evals.json" 2>/dev/null | wc -l)
if [ "$EVAL_COUNT" -eq 0 ]; then
  error "No evals found (need at least one skills/*/evals/evals.json)"
  MISSING=1
fi

[ "$MISSING" -eq 0 ] || die "Plugin validation failed. Fix missing files first."
log "Structure validation passed"

# ------------------------------------------------------------------
# 3. Check version consistency
# ------------------------------------------------------------------
PLUGIN_VERSION=$(python3 -c "import json; print(json.load(open('${PLUGIN_DIR}/.claude-plugin/plugin.json'))['version'])")
log "Plugin version: ${PLUGIN_VERSION}"

if [ -f "${PLUGIN_DIR}/.claude-plugin/marketplace.json" ]; then
  MKT_VERSION=$(python3 -c "import json; print(json.load(open('${PLUGIN_DIR}/.claude-plugin/marketplace.json'))['version'])")
  if [ "$PLUGIN_VERSION" != "$MKT_VERSION" ]; then
    die "Version mismatch: plugin.json=${PLUGIN_VERSION} vs marketplace.json=${MKT_VERSION}"
  fi
fi

log "Version consistency check passed"

# ------------------------------------------------------------------
# 4. Check quality limits
# ------------------------------------------------------------------
WARN_COUNT=0

for skill_md in $(find "${PLUGIN_DIR}/skills" -name "SKILL.md"); do
  lines=$(wc -l < "$skill_md")
  if [ "$lines" -gt 200 ]; then
    warn "SKILL.md exceeds 200 lines: ${skill_md} (${lines} lines)"
    WARN_COUNT=$((WARN_COUNT + 1))
  fi
done

for bundle in $(find "${PLUGIN_DIR}/skills" -path "*/bundles/*.md"); do
  lines=$(wc -l < "$bundle")
  if [ "$lines" -gt 500 ]; then
    warn "Bundle exceeds 500 lines: ${bundle} (${lines} lines)"
    WARN_COUNT=$((WARN_COUNT + 1))
  fi
done

if [ "$WARN_COUNT" -gt 0 ]; then
  warn "${WARN_COUNT} quality warning(s) — review before publishing"
fi

# ------------------------------------------------------------------
# 5a. Sync version in root marketplace.json
# ------------------------------------------------------------------
ROOT_MARKETPLACE="${REPO_ROOT}/marketplace.json"

if [ -f "$ROOT_MARKETPLACE" ]; then
  PLUGIN_NAME_VAL=$(python3 -c "
import json, sys
try:
    with open(sys.argv[1]) as f:
        print(json.load(f)['name'])
except Exception as e:
    print(f'ERROR: {e}', file=sys.stderr)
    sys.exit(1)
" "${PLUGIN_DIR}/.claude-plugin/plugin.json") || die "Cannot read plugin name from plugin.json"

  CURRENT_ROOT_V=$(python3 -c "
import json, sys
try:
    with open(sys.argv[1]) as f:
        data = json.load(f)
    name = sys.argv[2]
    match = [p for p in data.get('plugins', []) if p.get('name') == name]
    print('NOT_FOUND' if not match else str(match[0].get('version', 'UNKNOWN')))
except Exception as e:
    print(f'ERROR: {e}', file=sys.stderr)
    sys.exit(1)
" "$ROOT_MARKETPLACE" "$PLUGIN_NAME_VAL") || die "Cannot parse root marketplace.json"

  if [ "$CURRENT_ROOT_V" = "NOT_FOUND" ]; then
    warn "Plugin '${PLUGIN_NAME_VAL}' not found in root marketplace.json — add it manually"
  elif [ "$CURRENT_ROOT_V" != "$PLUGIN_VERSION" ]; then
    if [ "$DRY_RUN" = "--dry-run" ]; then
      log "DRY RUN — would update root marketplace.json: ${PLUGIN_NAME_VAL} ${CURRENT_ROOT_V} → ${PLUGIN_VERSION}"
    else
      python3 -c "
import json, sys
try:
    with open(sys.argv[1]) as f:
        data = json.load(f)
    name, version = sys.argv[2], sys.argv[3]
    for p in data.get('plugins', []):
        if p.get('name') == name:
            p['version'] = version
            break
    with open(sys.argv[1], 'w') as f:
        json.dump(data, f, indent=2)
        f.write('\n')
except Exception as e:
    print(f'ERROR: {e}', file=sys.stderr)
    sys.exit(1)
" "$ROOT_MARKETPLACE" "$PLUGIN_NAME_VAL" "$PLUGIN_VERSION" || die "Failed to update root marketplace.json"
      log "Updated root marketplace.json: ${PLUGIN_NAME_VAL} → ${PLUGIN_VERSION}"
    fi
  else
    log "Root marketplace.json already in sync: ${PLUGIN_NAME_VAL}@${PLUGIN_VERSION}"
  fi
else
  warn "Root marketplace.json not found at ${ROOT_MARKETPLACE} — skipping sync"
fi

# ------------------------------------------------------------------
# 5. Extract to clean temp directory
# ------------------------------------------------------------------
rsync -a \
  --exclude='.git' \
  --exclude='.omc' \
  --exclude='.claude/worktrees' \
  --exclude='node_modules' \
  --exclude='PLAN.md' \
  "${PLUGIN_DIR}/" "${TEMP_DIR}/"

log "Extracted to: ${TEMP_DIR}"

# ------------------------------------------------------------------
# 6. Publish or dry-run
# ------------------------------------------------------------------
if [ "$DRY_RUN" = "--dry-run" ]; then
  log "DRY RUN — would publish:"
  echo "  Plugin:  ${PLUGIN_NAME}"
  echo "  Version: ${PLUGIN_VERSION}"
  echo "  Source:  ${TEMP_DIR}"
  echo ""
  echo "Files:"
  find "$TEMP_DIR" -type f | sed "s|${TEMP_DIR}/|  |" | sort
  rm -rf "$TEMP_DIR"
  exit 0
fi

# TODO: Replace with actual marketplace publish command when available
# claude marketplace publish "${TEMP_DIR}"
log "Marketplace publish command not yet available"
log "Plugin extracted to: ${TEMP_DIR}"
log "Publish manually or wait for marketplace CLI support"

echo ""
log "Done! Plugin ${PLUGIN_NAME}@${PLUGIN_VERSION} ready for publish"
