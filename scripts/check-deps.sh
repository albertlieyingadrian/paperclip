#!/usr/bin/env bash
set -euo pipefail

# Checks that all CLI tools required by agents/skills are installed.
# Run this after cloning or whenever something fails with "command not found".
#
# Exit codes:
#   0  all required deps found (warnings are OK)
#   1  one or more required deps missing

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BOLD='\033[1m'
NC='\033[0m'

missing_required=0
missing_optional=0

check() {
  local cmd="$1"
  local level="$2"     # required | optional
  local used_by="$3"
  local install_hint="$4"

  if command -v "$cmd" &>/dev/null; then
    version=$(command "$cmd" --version 2>/dev/null | head -1 || echo "installed")
    printf "  ${GREEN}✓${NC} %-20s %s\n" "$cmd" "$version"
  else
    if [ "$level" = "required" ]; then
      printf "  ${RED}✗${NC} %-20s ${RED}MISSING${NC}  (used by: %s)\n" "$cmd" "$used_by"
      printf "    ${YELLOW}→ Install: %s${NC}\n" "$install_hint"
      missing_required=$((missing_required + 1))
    else
      printf "  ${YELLOW}○${NC} %-20s ${YELLOW}optional${NC} (used by: %s)\n" "$cmd" "$used_by"
      printf "    ${YELLOW}→ Install: %s${NC}\n" "$install_hint"
      missing_optional=$((missing_optional + 1))
    fi
  fi
}

echo ""
echo "${BOLD}Dependency check for claude-agents-design-gtm${NC}"
echo ""

echo "${BOLD}Core tools${NC}"
check "git"           required "all agents"                     "https://git-scm.com/downloads"
check "node"          required "comparable-research, business-case-doc" "https://nodejs.org/ or: brew install node"
check "npm"           required "comparable-research, business-case-doc" "(comes with node)"

echo ""
echo "${BOLD}GitHub CLI${NC}"
check "gh"            required "technical-researcher (publish PR)" "brew install gh  or  https://cli.github.com/"

if command -v gh &>/dev/null; then
  if gh auth status &>/dev/null 2>&1; then
    printf "  ${GREEN}✓${NC} %-20s %s\n" "gh auth" "authenticated"
  else
    printf "  ${YELLOW}○${NC} %-20s ${YELLOW}not authenticated${NC}\n" "gh auth"
    printf "    ${YELLOW}→ Run: gh auth login${NC}\n"
  fi
fi

echo ""
echo "${BOLD}Browser automation${NC}"
check "agent-browser"  optional "landing-page-design-analysis, comparable-research" "npm install -g agent-browser && agent-browser install"
check "npx"            required "comparable-research (playwright fallback)" "(comes with npm)"

echo ""
echo "${BOLD}Media tools${NC}"
check "ffmpeg"         optional "landing-page-design-analysis (5s video/GIF)" "brew install ffmpeg  or  https://ffmpeg.org/download.html"

echo ""
echo "${BOLD}PDF generation${NC}"
check "npx"            required "business-case-doc (md-to-pdf)" "(comes with npm)"

echo ""
echo "────────────────────────────────────────"
if [ "$missing_required" -gt 0 ]; then
  echo "${RED}${BOLD}$missing_required required tool(s) missing.${NC} Install them before using the agents."
  exit 1
elif [ "$missing_optional" -gt 0 ]; then
  echo "${GREEN}${BOLD}All required tools installed.${NC} ${YELLOW}$missing_optional optional tool(s) missing — some features will be limited.${NC}"
  exit 0
else
  echo "${GREEN}${BOLD}All tools installed. You're good to go.${NC}"
  exit 0
fi
