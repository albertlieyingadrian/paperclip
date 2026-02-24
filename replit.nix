# System dependencies for claude-agents-design-gtm agents.
# Aligned with scripts/check-deps.sh — required and optional tools.
#
# After editing, reload the shell so the new packages are available.
# In Replit: Dependencies → System → changes sync on shell reload.

{ pkgs }: {
  deps = [
    # Core (required by check-deps.sh)
    pkgs.git
    pkgs.nodejs
    # GitHub CLI — technical-researcher (publish PR to oss-researcher)
    pkgs.gh
    # Optional: landing-page-design-analysis (5s video/GIF)
    pkgs.ffmpeg
  ];
}
