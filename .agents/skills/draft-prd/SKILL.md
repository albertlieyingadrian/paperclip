---
name: draft-prd
description: "Drafts the PRD and Q&A for a tech spec (1_PRODUCT_REQUIREMENTS.md and 3_QUESTIONS_AND_ANSWERS.md) in docs/tech-specs. Asks questions in chat until those sections are clear, drafts a plan in chat for approval, then writes only those two files. Use first when drafting a new tech spec; use when the user asks to draft a PRD or product requirements for a tech spec."
---

# Draft PRD (and Q&A)

Draft **only** `1_PRODUCT_REQUIREMENTS.md` and `3_QUESTIONS_AND_ANSWERS.md` in `docs/tech-specs/YYYY-MM-DD-feature-slug/`. Follow the **same template** as the unified tech-spec template (see "Template to follow" below). Three phases: **clarify by section** → **plan in chat** → **execute after approval**. Repo only; no Notion. Works in **any repo** that has or will have `docs/tech-specs/`; create the folder in that repo if needed.

---

## Phase 1: Clarify until PRD and Q&A sections are draftable

Ask questions until **each** of the following is clear enough to draft. Do not move to Phase 2 until the user agrees.

**Feature name / slug** – Short, lowercase (e.g. `follow-up-table`, `user-account-connections`). Folder: `docs/tech-specs/YYYY-MM-DD-<slug>` (today or user's date).

**1_PRODUCT_REQUIREMENTS.md** (sections to clarify):

- **0. Context & Reference Links** – Related specs, implementations, naming decisions.
- **1. Why** – User problem, user wish, hypothesis, how success is measured.
- **2. Win: Proof of Success** – Goals, what "done" looks like, speed/cost notes.
- **3. User Journey** – Main flows, who does what, steps.
- **4. How (product solution)** – Product-level solution (no implementation detail).
- **5. Scope V1** – What's in for the first version.
- **6. Not in Scope V1** – Explicitly out for V1.
- **7. Plan / Phases** – High-level order of work.
- **8. Open Questions** – Decisions still needed.

**3_QUESTIONS_AND_ANSWERS.md** – Q&A log; can be seeded from this conversation.

Ask one or a few things at a time. If the user shares a Linear link or brief, use it and ask only what's missing. **Proceed to Phase 2 only when the user confirms these sections are clear enough to draft.**

---

## Phase 2: Plan mode — draft in chat (no files)

Produce a **draft plan** in chat for **only** `1_PRODUCT_REQUIREMENTS.md` and `3_QUESTIONS_AND_ANSWERS.md` (structured outline or full draft text). User reviews and approves or requests changes. **Do not write any files until the user explicitly approves** (e.g. "looks good", "go ahead", "execute").

---

## Phase 3: Execute — write only PRD and Q&A

**Only after** explicit approval: create the folder if needed and write **only**:

- `1_PRODUCT_REQUIREMENTS.md`
- `3_QUESTIONS_AND_ANSWERS.md`

**When writing files,** follow the template below so output matches existing specs. The rest of the tech spec (2_TECH_SPEC, 4_QA_CHECKLIST, 5_TLDR, 0_CHANGELOG) is produced by the **draft-tech-spec** skill.

---

## Template to follow

### 1_PRODUCT_REQUIREMENTS.md

- **Title:** `# [Feature Name] — Product Requirements`
- **Source line:** Use the path to this file in the repo where the spec is created, e.g. `**Source:** \`docs/tech-specs/YYYY-MM-DD-slug/1_PRODUCT_REQUIREMENTS.md\``.
- **Horizontal rule** `---`
- **ADR block:** `# Architecture Decision Record: [Feature Name]` then a short intro paragraph describing the feature.
- **Horizontal rule** then **Table of Contents** with anchor links:
  - `[0. Context & Reference Links](#0-context--reference-links)` through `[8. Open Questions](#8-open-questions)`
- **Related Documents (in repo):** List `2_TECH_SPEC.md`, `4_QA_CHECKLIST.md`, `5_TLDR.md`, and any reference specs.
- **Sections in order:** `## 0. Context & Reference Links`, `## 1. Why`, `## 2. Win: Proof of Success`, `## 3. User Journey`, `## 4. How (product solution)`, `## 5. Scope V1`, `## 6. Not in Scope V1`, `## 7. Plan / Phases`, `## 8. Open Questions`. Use the same heading text and numbering.

### 3_QUESTIONS_AND_ANSWERS.md

- **Title:** `# Questions and Answers`
- **Intro:** Short line that this document contains Q&A from spec development.
- **Table of Contents** with anchors for Format, main Q&A section(s), Resolved summary, Unresolved questions if used.
- **Related Documents:** Links to 5_TLDR, 1_PRODUCT_REQUIREMENTS, 2_TECH_SPEC, 4_QA_CHECKLIST, 0_CHANGELOG.
- **Format section:** State that each entry follows "**Question Title:** …" and "**Answer:** …". For unresolved, list question without answer.
- **Q&A entries:** Numbered or grouped by topic; each with **Question:** and **Answer:** (or marked unresolved).

---

## Reference

- **Next step:** Use **draft-tech-spec** to generate the remaining files (and to update PRD or Q&A if needed after further chat).
- **Optional:** For a single shareable business-case doc and PDF (TOC + ONE_PAGER + TL;DR + PRD + Q&A + embedded screenshots), use the **business-case-doc** skill.
