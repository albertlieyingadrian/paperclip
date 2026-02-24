#!/usr/bin/env bash
set -euo pipefail

# Sets up .cursor/ and .claude/ to reference .agents/ as the single source of truth.
#
# .agents/           ← master location (agents, skills, commands, rules)
# .cursor/agents     → ../.agents/agents     (symlink)
# .cursor/skills     → ../.agents/skills     (symlink)
# .cursor/commands   → ../.agents/commands   (symlink)
# .cursor/rules      → ../.agents/rules      (symlink)
# .claude/agents     → ../.agents/agents     (symlink)
# .claude/skills     → ../.agents/skills     (symlink)
# .claude/commands   → ../.agents/commands   (symlink)
#
# Safe to re-run: skips if symlink already exists and points to the right target.
# Backs up existing directories (non-symlink) to *.bak before replacing.

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

AGENTS_DIR=".agents"

CURSOR_DIRS=("agents" "skills" "commands" "rules")
CLAUDE_DIRS=("agents" "skills" "commands")

link_or_skip() {
  local parent="$1"   # e.g. .cursor
  local subdir="$2"   # e.g. agents
  local target="../${AGENTS_DIR}/${subdir}"
  local link_path="${parent}/${subdir}"

  mkdir -p "$parent"

  if [ -L "$link_path" ]; then
    current="$(readlink "$link_path")"
    if [ "$current" = "$target" ]; then
      echo "  ✓ ${link_path} → ${target} (already correct)"
      return
    else
      echo "  ↻ ${link_path} → ${current} (wrong target, relinking to ${target})"
      rm "$link_path"
    fi
  elif [ -d "$link_path" ]; then
    echo "  ⚠ ${link_path} is a real directory — backing up to ${link_path}.bak"
    mv "$link_path" "${link_path}.bak"
  elif [ -e "$link_path" ]; then
    echo "  ⚠ ${link_path} exists but is not a directory or symlink — backing up to ${link_path}.bak"
    mv "$link_path" "${link_path}.bak"
  fi

  ln -s "$target" "$link_path"
  echo "  ✓ ${link_path} → ${target} (created)"
}

echo "Setting up symlinks from .cursor/ and .claude/ → .agents/"
echo ""

if [ ! -d "$AGENTS_DIR" ]; then
  echo "ERROR: ${AGENTS_DIR}/ directory not found in repo root."
  echo "       Make sure .agents/ exists with agents/, skills/, commands/, rules/ subdirectories."
  exit 1
fi

echo ".cursor/"
for dir in "${CURSOR_DIRS[@]}"; do
  link_or_skip ".cursor" "$dir"
done

echo ""
echo ".claude/"
for dir in "${CLAUDE_DIRS[@]}"; do
  link_or_skip ".claude" "$dir"
done

echo ""
echo "Done. .agents/ is the single source of truth."
echo ""
echo "Verify with:"
echo "  ls -la .cursor/agents .cursor/skills .cursor/commands .cursor/rules"
echo "  ls -la .claude/agents .claude/skills .claude/commands"

echo ""
echo "Running dependency check..."
echo ""
bash "${REPO_ROOT}/scripts/check-deps.sh" || true
