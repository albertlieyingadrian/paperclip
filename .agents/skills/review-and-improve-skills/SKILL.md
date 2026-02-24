---
name: review-and-improve-skills
description: Reviews existing Agent Skills based on recent Cursor conversations, user feedback, user notes, and Cursor's skills knowledge base (cursor.com/docs/context/skills). Proposes improvements with rationale; asks user to confirm before applying changes. Use when the user wants to review skills, incorporate feedback, or improve skill quality.
disable-model-invocation: true
---

# Review and Improve Skills

Reviews existing **skills** using conversation feedback, user notes, and Cursor's knowledge base. **Always asks the user to confirm** before applying any changes.

**Scope:** This skill reviews *skills* only (`.cursor/skills/`, `.agents/skills/`, `~/.cursor/skills/`). It does not review rules (`.cursor/rules/`) or commands (`.cursor/commands/`).

## When to Use

- User wants to review or improve a skill based on recent conversation feedback
- User has additional notes or preferences to incorporate into a skill
- User wants to align a skill with Cursor's best practices (https://cursor.com/docs/context/skills)
- User says "review this skill", "improve based on feedback", or similar

## Workflow

### 1. Identify skill(s) to review

- User may specify a skill by name or path (e.g. `complete-linear-description-from-slack`, `.cursor/skills/draft-prd/`)
- If unspecified, infer from conversation (e.g. skill that was just used or discussed)
- **Skill locations** (search these):
  - Project: `.cursor/skills/`, `.agents/skills/`, `.claude/skills/`, `.codex/skills/`
  - User: `~/.cursor/skills/`, `~/.claude/skills/`, `~/.codex/skills/`
- Do **not** review or modify `~/.cursor/skills-cursor/` (reserved for Cursor's built-in skills)

### 2. Read current skill(s)

- Read `SKILL.md` for each identified skill
- Note: structure, description, instructions, sections

### 3. Gather improvement signals

**A. From recent conversation (user feedback)**

- User corrections, preferences, or "actually do X" moments
- User requests for format changes (e.g. "TL;DR at the very top")
- User refinements (e.g. "archive only if no comment mentions archive")
- Patterns user reinforced multiple times

**B. From user's additional notes**

- User may paste or type notes: "Also add...", "Change X to Y", "Make sure we..."
- Treat these as explicit requirements

**C. From Cursor knowledge base / best practices**

Reference https://cursor.com/docs/context/skills and create-skill best practices:

- **Description**: Third person, specific, includes WHAT + WHEN, trigger terms
- **Structure**: `name` and `description` in frontmatter; clear sections
- **Length**: SKILL.md under ~500 lines; use progressive disclosure (references/) for details
- **Discovery**: Description drives relevance; include key terms user would say
- **Optional dirs**: `scripts/`, `references/`, `assets/` for progressive loading
- **Conciseness**: Agent is smart; only add context it doesn't have

### 4. Propose changes (do NOT apply yet)

Produce a **proposed changes** block:

```markdown
## Proposed changes for [skill-name]

**Rationale:** [Why these changes, from which source: conversation / user notes / knowledge base]

**Edits:**
1. [Section/line] – [Change] – [Reason]
2. ...

**Before → After** (for key edits):
[Show specific before/after snippets if helpful]
```

### 5. Ask user to confirm

**Required step.** Before making any edits, ask:

> "Do these changes make sense? Should I apply them, or would you like to adjust anything first?"

- If user says "yes", "go ahead", "apply" → proceed to step 6
- If user requests changes → update proposal and ask again
- If user says "no" or "skip" → do not apply; summarize what was proposed for their reference

### 6. Apply changes (only after confirmation)

- Edit the skill file(s) according to the approved proposal
- **Never edit** files under `~/.cursor/skills-cursor/` (reserved path)
- Summarize what was changed

## Knowledge base reference (Cursor skills docs)

Key points from https://cursor.com/docs/context/skills:

- **Paths:** Skills live in `.cursor/skills/<skill-name>/SKILL.md` (project) or `~/.cursor/skills/<skill-name>/SKILL.md` (user). Also: `.claude/skills/`, `.codex/skills/`, `.agents/skills/` for compatibility.
- **Never modify** `~/.cursor/skills-cursor/` — reserved for Cursor's built-in skills.
- **Frontmatter:** `name` (required, must match parent folder), `description` (required), `disable-model-invocation` (optional)
- **Description:** Used for relevance; write in third person, be specific; include WHAT + WHEN
- **Optional dirs:** `scripts/`, `references/`, `assets/` for progressive loading
- **Length:** Keep SKILL.md under ~500 lines; use progressive disclosure for details
- `disable-model-invocation: true` → skill only runs when user types `/skill-name`

## Output format

When proposing changes, use:

1. **Summary** – Which skill(s), what triggered the review
2. **Proposed changes** – Edits with rationale and source (convo / notes / knowledge base)
3. **Confirmation prompt** – "Do these changes make sense? Should I apply them?"

Only after user confirms: apply and report what was changed.
