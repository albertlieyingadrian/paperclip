---
name: business-case-doc
description: "Creates a single business-case document (problem, solution, scope, evidence) as Markdown and PDF from ONE_PAGER, TL;DR, PRD, Q&A and optional screenshots. Adds npm script for md-to-pdf. Use when the user wants one shareable doc or PDF that mirrors a Notion-style spec (vision + summary + requirements + Q&A) with embedded prototype evidence."
disable-model-invocation: false
---

# Business case doc (shareable Markdown + PDF)

Produces one **business-case document** in the tech-spec folder: Notion-style structure (TOC + ONE_PAGER + TL;DR + Product Requirements + Q&A) with optional **embedded screenshots** and a **PDF** export. Use for sharing with stakeholders, pitching the feature, or a single artifact that makes the "case" (problem, solution, scope, evidence).

**Prerequisite:** The spec folder has at least `1_PRODUCT_REQUIREMENTS.md` and `3_QUESTIONS_AND_ANSWERS.md`; ideally `5_TLDR.md` and repo-root `ONE_PAGER.md`. Optional: `screenshots/` with prototype images.

---

## When to use

- User wants **one doc or PDF** that combines vision (one-pager), summary (TL;DR), full requirements, and Q&A.
- User wants to **share** the spec as a single Markdown file or PDF (e.g. mirrors a Notion page).
- User has **prototype evidence** (Loom links, screenshots) to embed in the doc.

---

## Steps

### 1. Create the business-case Markdown file

**File:** `docs/tech-specs/YYYY-MM-DD-<slug>/CONSOLIDATED_SPEC.md` (or name it `BUSINESS_CASE.md` if you prefer).

**Structure:**

- **Title** and short intro (e.g. "Generate PDF from repo root: `npm run spec:pdf`").
- **Table of contents** with anchor links to the four sections below.
- **# 1. ONE_PAGER — Problem & Vision**
  Content from repo root `ONE_PAGER.md`: one-liner, Problem/Situation, Solution/Action, What's new, Why this idea, Why you, How it works, Built With, Impact, Additional notes. Use relative paths for in-repo links.
- **# 2. TL;DR**
  Summary and "Current prototype" table (e.g. Loom links) from `5_TLDR.md`.
  **Screenshots:** For each image in `screenshots/`, add a subsection: heading, one-sentence description, optional Loom link, and embedded image: `![Description](screenshots/<filename>.png)`. Use `%20` for spaces in paths if the PDF tool requires it.
- **# 3. Product Requirements**
  Full content of `1_PRODUCT_REQUIREMENTS.md`.
- **# 4. Questions and Answers**
  Full content of `3_QUESTIONS_AND_ANSWERS.md`.

All paths are relative to the tech-spec folder so images resolve when generating the PDF from that directory.

### 2. Screenshot linkage

- **PRD Section 0:** Ensure `1_PRODUCT_REQUIREMENTS.md` Section 0 (Context & Reference Links) includes a **screenshot table** (Screenshot | Description | Prototype video) and Loom links so the PRD alone is a valid reference.
- **screenshots/README.md:** Keep it as a short pointer to the PRD (e.g. "Screenshot list and prototype links are in 1_PRODUCT_REQUIREMENTS.md Section 0").

### 3. PDF generation

- In **repo root** `package.json`:
  - Add **devDependency:** `"md-to-pdf": "^5.2.0"` (or current stable).
  - Add **script** (e.g. `spec:pdf`): `cd` into the tech-spec folder, run `npx md-to-pdf CONSOLIDATED_SPEC.md --basedir .`, then rename the output (e.g. `mv CONSOLIDATED_SPEC.pdf <Feature-Name>-Spec.pdf`). md-to-pdf writes a PDF with the same base name as the Markdown file by default; there is no `-o` flag.
- **Note:** Conversion can take 1–2 minutes with several embedded images (Puppeteer/Chromium).

### 4. Optional

- **README** in the tech-spec folder: point to the consolidated file and "Generate PDF: `npm run spec:pdf` (from repo root)."
- **.gitignore:** Add the generated PDF path if the repo should not commit it.

---

## Related skills

- **draft-prd** produces 1* and 3*; **draft-tech-spec** produces 2*, 4*, 5*, 0*. Either can be followed by **business-case-doc** when the user wants one shareable business-case doc and PDF.
