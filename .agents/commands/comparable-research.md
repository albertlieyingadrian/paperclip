# Comparable research and screenshots

Run the comparable research workflow. You can also use the **comparable-research** skill (`.cursor/skills/comparable-research/` or `.agents/skills/comparable-research/`) or the **comparable-research subagent** for an isolated run that returns a summary—good for long screenshot runs.

## Scope (use parameters if needed)

- **Add companies**: If I said "add [slug] [url]" after the command, create that company's folder and FINDINGS, add it to `scripts/capture-all-comparables.js` COMPANIES, then include it in this run.
- **Exclude companies**: If I said "exclude slug1, slug2", skip those (run script with `COMPANIES=...` for the rest only).
- Otherwise run for **all** companies in the script's COMPANIES array.

## Steps

1. **Research**
   For each company in scope: ensure `docs/research/comparables/[company-slug]/FINDINGS.md` exists and follows `docs/research-templates/COMPARABLE_RESEARCH_TEMPLATE.md`. Fill value props and citations from primary URL where still placeholder. Update `docs/research/TLDR_RESEARCH.md` if needed.

2. **Screenshots (compact)**
   Use viewport **1024x768** and **JPEG quality 82** so files stay smaller but still full-page.
   - **If Playwright MCP is available**: For each company, go to primary URL, collect same-origin links (and sitemap if useful). For each URL: visit, wait ~1.5s, full-page screenshot to `docs/research/comparables/[company-slug]/screenshots/[YYYY-MM-DD]/[url-path-slug].jpg`. Update FINDINGS section 7 with table: Date | URL/path | File.
   - **If MCP fails or is disabled**: Run from repo root: `npm install && npx playwright install chromium`, then `node scripts/capture-all-comparables.js [date]` (or `COMPANIES=slug1,slug2 node scripts/capture-all-comparables.js [date]` for a subset). The script uses JPEG 82 and 1024x768 by default and updates section 7 automatically.

3. **Summary**
   List which companies were updated, how many screenshots per company, and any failures (timeout, browser crash) so I can re-run those.

Use today's date in YYYY-MM-DD for new screenshots unless I specified a different date.
