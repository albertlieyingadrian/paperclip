---
name: comparable-research
description: Runs comparable company research and screenshot capture. Use when the user wants to research competitor/comparable companies, add new comparables, exclude some companies, re-run screenshots, or update FINDINGS and TLDR from landing pages and sitemaps.
disable-model-invocation: false
---

# Comparable research and screenshots

Run the full comparable research workflow: ensure FINDINGS per company, capture screenshots (all key URLs per site), and update section 7 and TLDR.

## How to run: skill vs command vs subagent

- **Skill** (this file): Invoke with `/comparable-research` or by asking e.g. "run comparable research." The agent applies this skill and runs the workflow (research → capture → update FINDINGS).
- **Command**: Same workflow via `.cursor/commands/comparable-research.md`; type `/comparable-research` or `/comparable-research exclude gamma,momo`. Parameters (add/exclude/date) go after the command name.
- **Subagent (Cursor agent)**: A dedicated subagent runs the workflow in its own context and returns a summary. File: `.cursor/agents/comparable-research.md`. Best for long runs (many companies + screenshots) so the main chat stays clean.

## Scope

- **All companies**: Use the list in `scripts/capture-all-comparables.js` (COMPANIES array).
- **Add companies**: User may say "add [slug] [primary-url]". Create `docs/research/comparables/[slug]/FINDINGS.md` from `docs/research-templates/COMPARABLE_RESEARCH_TEMPLATE.md`, add entry to COMPANIES in the script, then include in research and capture.
- **Exclude companies**: User may say "exclude [slug1, slug2]". Skip those in research and capture.

## Research steps

1. For each company in scope, ensure `docs/research/comparables/[company-slug]/FINDINGS.md` exists with sections 1–10 per template.
2. Fetch primary URL (and key same-origin pages) to fill value props, citations, "what they don't solve" where still placeholder.
3. Update `docs/research/TLDR_RESEARCH.md` with 1–2 positioning bullets per company if missing.

## Screenshot convention

- **Path**: `docs/research/comparables/[company-slug]/screenshots/[YYYY-MM-DD]/[url-path-slug].(png|jpg)`
- **Compact (smaller files, still full-page)**: Use viewport 1024x768 and JPEG quality 82 (or PNG if user prefers). Saves disk and keeps full-page content readable.
- **Slug from path**: `/` → `landing`; `/pricing` → `pricing`; `/blog/name` → `blog-name`. Replace `/` with `-`, sanitize to `[a-z0-9-]`.
- **Discover URLs**: Same-origin links from landing; optionally `/sitemap.xml`. Skip `/api`, sitemap.xml, .pdf/.zip. Cap per site (e.g. 25 from page, 30 from sitemap) to avoid timeouts.

## Capture: Playwright MCP vs script

1. **Playwright MCP (preferred when available)**
   Set viewport to 1024x768; for each URL use full-page screenshot as **JPEG quality 82** (or PNG). Save to the path above. Update FINDINGS section 7 with table: Date | URL / path | File (link to `screenshots/[date]/[slug].jpg`).

2. **Fallback (no MCP or browser fails)**
   From repo root: `npm install && npx playwright install chromium`, then:
   - All: `node scripts/capture-all-comparables.js [date]`
   - Subset: `COMPANIES=slug1,slug2 node scripts/capture-all-comparables.js [date]`
   The script updates section 7 in each FINDINGS.md automatically.

## Add new company

1. Create `docs/research/comparables/[slug]/FINDINGS.md` from template; set primary URL.
2. Append `{ slug: '[slug]', primaryUrl: 'https://...' }` to COMPANIES in `scripts/capture-all-comparables.js`.
3. Run research and capture for that company (MCP or script subset).

## Output

After the run, summarize: companies updated, screenshot count per company, any failures (timeout, browser crash) for re-run.
