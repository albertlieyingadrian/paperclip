# Local Nix shell — same tools as replit.nix / check-deps.sh.
# Use when NOT in Replit.
#
# Enter the environment:
#   nix-shell
#
# Or with direnv (auto-activate on cd):
#   echo 'use nix' > .envrc && direnv allow

{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  name = "claude-agents-design-gtm";
  buildInputs = [
    pkgs.git
    pkgs.nodejs
    pkgs.gh
    pkgs.ffmpeg
  ];
  shellHook = ''
    echo "claude-agents-design-gtm: git, node, npm, gh, ffmpeg available."
    echo "Run: bash scripts/check-deps.sh"
  '';
}
