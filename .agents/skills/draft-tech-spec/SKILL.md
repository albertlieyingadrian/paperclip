---
name: draft-tech-spec
description: "Drafts the rest of a tech spec (2_TECH_SPEC, 4_QA_CHECKLIST, 5_TLDR, optional 0_CHANGELOG) in docs/tech-specs. Can update 1_PRODUCT_REQUIREMENTS or 3_QUESTIONS_AND_ANSWERS if chat shows it is needed. Use after PRD and Q&A exist (draft-prd); clarify in chat, plan in chat, then write files after approval."
---

# Draft tech spec (rest, after PRD and Q&A)

Draft the **remaining** tech spec files in `docs/tech-specs/YYYY-MM-DD-feature-slug/`: `2_TECH_SPEC.md`, `4_QA_CHECKLIST.md`, `5_TLDR.md`, and optionally `0_CHANGELOG.md`. Follow the **same template** as the unified tech-spec template (see "Template to follow" below). **Update** `1_PRODUCT_REQUIREMENTS.md` or `3_QUESTIONS_AND_ANSWERS.md` if the conversation reveals changes. Three phases: **clarify** → **plan in chat** → **execute after approval**. Repo only; no Notion.

---

## Prerequisite

- The spec folder and at least `1_PRODUCT_REQUIREMENTS.md` (and ideally `3_QUESTIONS_AND_ANSWERS.md`) should already exist, e.g. from **draft-prd**. If the user is starting from scratch in one go, create the folder and a minimal 1* and 3* first, or ask them to run **draft-prd** first.

---

## Phase 1: Clarify until rest is draftable

Ask until the following are clear enough to draft. Use existing 1* and 3* as source of truth; ask only what's missing or unclear.

**2_TECH_SPEC.md**

- System architecture / scope, schema, API, key flows (e.g. OAuth), env/config, out-of-scope/deferred. Align with Scope V1 and How from the PRD.

**4_QA_CHECKLIST.md** – QA scenarios and acceptance criteria (traceable to PRD and tech decisions).

**5_TLDR.md** – Short summary of the spec.

**0_CHANGELOG.md** – (Optional) Requirement/spec updates.

**PRD or Q&A updates** – If chat reveals new open questions, scope changes, or Q&A, note that 1* or 3* will need updates and include those in the plan.

**Proceed to Phase 2 only when the user confirms the rest (and any PRD/Q&A changes) are clear enough to draft.**

---

## Phase 2: Plan mode — draft in chat (no files)

Produce a **draft plan** in chat for:

- `2_TECH_SPEC.md`, `4_QA_CHECKLIST.md`, `5_TLDR.md`, and `0_CHANGELOG.md` if used, and
- Any edits to `1_PRODUCT_REQUIREMENTS.md` or `3_QUESTIONS_AND_ANSWERS.md` (section and proposed change).

User reviews and approves or requests changes. **Do not write any files until the user explicitly approves** (e.g. "looks good", "go ahead", "execute").

---

## Phase 3: Execute — write rest and apply PRD/Q&A updates

**Only after** explicit approval:

- Write or overwrite: `2_TECH_SPEC.md`, `4_QA_CHECKLIST.md`, `5_TLDR.md`, and optionally `0_CHANGELOG.md`.
- If the approved plan includes changes to PRD or Q&A, **update** `1_PRODUCT_REQUIREMENTS.md` and/or `3_QUESTIONS_AND_ANSWERS.md` accordingly.

**When writing files,** follow the template below so output matches existing specs.

---

## Template to follow

### 2_TECH_SPEC.md

- **Title:** `# [Feature Name] — Technical Specification`
- **Context block:** `> **Context:** See [1_PRODUCT_REQUIREMENTS.md](./1_PRODUCT_REQUIREMENTS.md) for product goals and user journeys.`
- **Table of Contents** with anchor links to each numbered section (e.g. `[1. System Architecture & Scope](#1-system-architecture--scope)`). Section numbering and names depend on the feature; typical: System Architecture & Scope, Database Schema, API, key flows (e.g. OAuth), Environment Variables, Out of Scope / Deferred.
- **Related Documents:** Links to 1_PRODUCT_REQUIREMENTS.md, 4_QA_CHECKLIST.md, 5_TLDR.md.
- **Body:** Numbered sections (## 1. …, ## 2. …) with subsections and code blocks as in existing specs. Include high-level flow diagrams (e.g. code block), design decisions table, schema, API details.

### 4_QA_CHECKLIST.md

- **Title:** `# [Feature Name] — QA Checklist`
- **Intro:** One line that the checklist is for the feature, optionally "formatted in Gherkin-style scenarios."
- **Reference:** `**Reference:** [1_PRODUCT_REQUIREMENTS.md](./1_PRODUCT_REQUIREMENTS.md)` and **Last Updated:** date.
- **Table of Contents** with anchors (e.g. Setup, scenario groups, Test Execution Notes).
- **Setup:** Environment and access steps as checklists.
- **Scenario tables:** Gherkin-style (Given → When → Then); columns e.g. #, Scenario, Test Steps, Expected Output, What Actually Happened, Notes, Status.

### 5_TLDR.md

- **Title:** `# [Feature Name] — TL;DR`
- **Meta:** **Last Updated:** date; **Full Spec:** link to 1*; **Tech Spec:** link to 2*.
- **Sections:** System Overview (short paragraph), Core Logic (numbered flows: Triggers when, Process, Result), Important Constraints (bullets), Decision Summary (table: Decision, Choice, Rationale).

### 0_CHANGELOG.md (optional)

- **Title:** `# Changelog` or `# Requirement updates`; list dated entries for requirement/spec changes.

---

## Reference

- **Previous step:** **draft-prd** produces 1* and 3*.
- **Optional follow-up:** For one shareable business-case doc and PDF (TOC + ONE_PAGER + TL;DR + PRD + Q&A + screenshots), use the **business-case-doc** skill.
