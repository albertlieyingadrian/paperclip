# claude-agents-design-gtm

A portable collection of AI agents, skills, commands, and rules for design research and GTM (go-to-market) workflows. Works with **Cursor** (`.cursor/`) and **Claude Code** (`.claude/`) via symlinks from a single source of truth in `.agents/`.

## TODO
- [ ] add Substack writer

## Quick start

```bash
# Set up symlinks + check all required tools are installed
bash scripts/setup-symlinks.sh
```

The setup script also runs `scripts/check-deps.sh` automatically to verify all CLI tools are present.

This creates:

```
.agents/             ← single source of truth
.cursor/agents   → ../.agents/agents
.cursor/skills   → ../.agents/skills
.cursor/commands → ../.agents/commands
.cursor/rules    → ../.agents/rules
.claude/agents   → ../.agents/agents
.claude/skills   → ../.agents/skills
.claude/commands → ../.agents/commands
```

Edit files in `.agents/` and both Cursor and Claude Code pick up the changes automatically.

### Recommended plugins (Claude Code)

This repo recommends plugins via `.claude/settings.json` (like VS Code’s “Recommended Extensions”). When you open the project in Claude Code, you may be prompted to add the marketplace and install the plugin.

| Plugin | Purpose |
|--------|---------|
| **[Compound Engineering](https://github.com/EveryInc/compound-engineering-plugin)** | Plan → Work → Review → Compound workflow; agents, commands, and skills that compound over time. |

**Manual install** (if you weren’t prompted):

```bash
# In Claude Code REPL:
/plugin marketplace add https://github.com/EveryInc/compound-engineering-plugin
/plugin install compound-engineering
```

Personal overrides (e.g. API keys, `bypassPermissions`) go in `.claude/settings.local.json` (see `.claude/settings.local.json.example`). Local settings are gitignored.

---

## Agents

Agents are autonomous subagents that run a workflow end-to-end and return a summary. Invoke them by name in Cursor or Claude Code.

| Agent | What it does |
|-------|-------------|
| **product-manager** | Moves a product from research → PRD → business case. Adapts by stage (skips what's done). Orchestrates the research, draft-prd, and business-case-doc skills. |
| **technical-researcher** | Deep-dives into a codebase or OSS project. Produces RESEARCH.md (summary) and RESEARCH_DETAILED.md (code-level analysis with Mermaid diagrams). Optionally publishes to [oss-researcher](https://github.com/albertlieyingadrian/oss-researcher) via `gh pr create`. |
| **landing-page-design-analysis** | Captures screenshots and 5s demo videos of competitor landing pages, then writes per-company DESIGN_ANALYSIS.md covering layout, typography, color, CTAs, and more. |
| **self-improvement** | Reviews and improves existing skills based on conversation feedback, user notes, or Cursor best practices. Proposes changes and asks for confirmation before applying. |

### Example usage

```
# In Cursor chat or Claude Code:
"Use the product-manager agent to draft a PRD for our new onboarding flow"
"Run the technical-researcher agent on https://github.com/owner/repo"
"Research https://github.com/owner/repo and publish a PR to oss-researcher"
"Use the landing-page-design-analysis agent to analyze stripe.com and linear.app"
"Review and improve the draft-prd skill" → triggers self-improvement agent
```

---

## Skills

Skills are step-by-step procedures the agent follows when a task matches. Invoke with `/skill-name` or by describing what you need.

| Skill | What it does | When to use |
|-------|-------------|-------------|
| **draft-prd** | Drafts `1_PRODUCT_REQUIREMENTS.md` and `3_QUESTIONS_AND_ANSWERS.md` in `docs/tech-specs/`. Three phases: clarify → plan in chat → write after approval. | "Draft a PRD for feature X" |
| **draft-tech-spec** | Drafts `2_TECH_SPEC.md`, `4_QA_CHECKLIST.md`, `5_TLDR.md`, `0_CHANGELOG.md`. Updates PRD/Q&A if needed. Requires draft-prd to have run first. | "Write the tech spec for the onboarding feature" |
| **business-case-doc** | Creates a single CONSOLIDATED_SPEC.md (ONE_PAGER + TL;DR + PRD + Q&A + screenshots) and a PDF via `npm run spec:pdf`. | "Create a shareable business case PDF" |
| **comparable-research** | Researches competitor/comparable companies: creates FINDINGS.md per company, captures screenshots, updates TLDR. | "Research competitors for our product" |
| **landing-page-design-analysis** | Analyzes landing page design (layout, typography, color, CTAs) with screenshots and 5s demo videos. | "Analyze the design of competitor landing pages" |
| **review-and-improve-skills** | Reviews skills against conversation feedback and Cursor best practices, proposes edits, applies only after user confirms. | "Improve the draft-prd skill based on our last conversation" |

### Example usage

```
# Invoke directly
/draft-prd
/comparable-research exclude acme,globex
/landing-page-design-analysis add newco https://newco.com

# Or describe what you need
"Draft product requirements for a user authentication feature"
"Run comparable research for all companies"
"Create a business case PDF for the exec team"
```

### Skill workflow (product lifecycle)

```
comparable-research  →  draft-prd  →  draft-tech-spec  →  business-case-doc
    (research)          (PRD+Q&A)     (tech spec+QA)      (exec PDF)
```

The **product-manager** agent orchestrates this entire flow and skips steps that are already done.

---

## Commands

Commands are shortcut entry points for skills. Type `/command-name` in Cursor.

| Command | Triggers |
|---------|----------|
| `/comparable-research` | Runs the comparable-research skill |
| `/landing-page-design-analysis` | Runs the landing-page-design-analysis skill |

Parameters go after the command name:

```
/comparable-research exclude stripe,linear
/comparable-research add newco https://newco.com
/landing-page-design-analysis add newco https://newco.com
```

---

## Rules

Rules are conventions that apply automatically when editing matching files.

| Rule | Applies to | What it enforces |
|------|-----------|-----------------|
| **comparable-research** | `docs/research/**/*.md`, `scripts/capture*.js`, `docs/research-templates/*.md` | FINDINGS.md structure, screenshot path conventions, URL-to-slug mapping, capture script patterns |

---

## Prerequisites

Agents depend on various CLI tools. Run the checker any time to see what's installed and what's missing:

```bash
bash scripts/check-deps.sh
```

| Tool | Required by | Install |
|------|------------|---------|
| `git` | all agents | https://git-scm.com/downloads |
| `node` / `npm` | comparable-research, business-case-doc | https://nodejs.org/ |
| `gh` | technical-researcher (publish PR) | `brew install gh` or https://cli.github.com/ |
| `agent-browser` | landing-page-design-analysis (preferred) | `npm install -g agent-browser && agent-browser install` |
| `ffmpeg` | landing-page-design-analysis (5s video/GIF) | `brew install ffmpeg` |

After installing `gh`, authenticate once:

```bash
gh auth login
```

The setup script runs `check-deps.sh` automatically, so you'll see any missing tools right away.

### Replit / Nix (System Dependencies)

If you use **Replit**, system packages are declared in **`replit.nix`** so the Dependencies → System UI shows them. The same set of tools as `check-deps.sh` is listed there (git, nodejs, gh, ffmpeg). After changing `replit.nix`, reload the shell for packages to apply. `agent-browser` is installed via npm (`npm install -g agent-browser`) and is not in Nix.

### Local Nix (not Replit)

When you’re **not in Replit**, use **`shell.nix`** to get the same tools via Nix. You need [Nix](https://nixos.org/download/) installed.

**One-off shell (enter env, run commands, exit):**

```bash
nix-shell
# git, node, gh, ffmpeg are now on PATH
bash scripts/check-deps.sh
# exit when done
exit
```

**Auto-activate with direnv (recommended):**

```bash
# One-time: install direnv, then allow this repo
direnv allow
# From now on, cd’ing into this repo loads the Nix env automatically
```

`.envrc` contains `use nix` so direnv will run `nix-shell` when you enter the directory. `agent-browser` is still installed via npm inside the env: `npm install -g agent-browser && agent-browser install`.

---

## Architecture

```
.agents/                          ← master (edit here)
├── agents/                       ← autonomous subagents
│   ├── product-manager.md
│   ├── technical-researcher.md
│   ├── landing-page-design-analysis.md
│   └── self-improvement.md
├── skills/                       ← step-by-step procedures
│   ├── draft-prd/SKILL.md
│   ├── draft-tech-spec/SKILL.md
│   ├── business-case-doc/SKILL.md
│   ├── comparable-research/SKILL.md
│   ├── landing-page-design-analysis/SKILL.md
│   └── review-and-improve-skills/SKILL.md
├── commands/                     ← shortcut entry points
│   ├── comparable-research.md
│   └── landing-page-design-analysis.md
└── rules/                        ← auto-applied conventions
    └── comparable-research.mdc

.cursor/agents   → ../.agents/agents     (symlink)
.cursor/skills   → ../.agents/skills     (symlink)
.cursor/commands → ../.agents/commands   (symlink)
.cursor/rules    → ../.agents/rules      (symlink)

.claude/agents   → ../.agents/agents     (symlink)
.claude/skills   → ../.agents/skills     (symlink)
.claude/commands → ../.agents/commands   (symlink)

scripts/
└── setup-symlinks.sh             ← creates/repairs all symlinks
```

## Re-running setup

The script is idempotent. If symlinks already exist and point to the right target, it skips them. If a real directory exists where a symlink should be, it backs it up to `*.bak` before creating the symlink.

```bash
bash scripts/setup-symlinks.sh
```

---

## References

- https://www.linkedin.com/posts/christian-pickett_run-your-entire-gtm-workflow-directly-in-ugcPost-7431869550465335296-3o3w
- https://x.com/robjama/status/2026067747692798067
