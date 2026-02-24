# Landing page design analysis

Run the **design analysis** workflow for comparables: analyze layout, typography, color, hierarchy, CTAs; produce `DESIGN_ANALYSIS.md` per company with screenshots. Use the **landing-page-design-analysis** skill (`.cursor/skills/landing-page-design-analysis/` or `.agents/skills/landing-page-design-analysis/`) for full instructions.

## Scope (use parameters if needed)

- **Add companies**: If you said "add [slug] [url]" after the command, ensure that company has a comparables folder and FINDINGS (create from template if needed), add to `scripts/capture-all-comparables.js` COMPANIES if missing, then include it in this run.
- **Exclude companies**: If you said "exclude slug1, slug2", analyze only the rest (use COMPANIES=... when running the capture script for screenshots).
- Otherwise run for **all** companies in the script's COMPANIES array.

## Steps

1. **Screenshots & 5s video/GIF**
   For each company in scope, ensure screenshots exist under `docs/design-research/comparables/[slug]/screenshots/[YYYY-MM-DD]/`. If not: **prefer Vercel agent-browser** (agent-browser skill): for each URL run `agent-browser open <url>`, `agent-browser wait 1500`, then `agent-browser screenshot --full <path>` to that design-research folder (install with `npm install -g agent-browser && agent-browser install` if needed). **Only if agent-browser fails or is unavailable**: use Playwright MCP (1024x768, full-page) saving to the same design-research path. For each landing page, produce a ~5s video or GIF via the **feature-video** workflow (agent-browser frames + ffmpeg) to `screenshots/[date]/landing-demo.mp4` or `.gif`. Use today's date unless you specified another.

2. **Analyze design**
   For each company: open landing (and key pages), note layout, typography, color, hierarchy, CTAs, navigation/trust. Create or update `docs/design-research/comparables/[slug]/DESIGN_ANALYSIS.md` from `docs/design-templates/LANDING_PAGE_DESIGN_TEMPLATE.md`. Fill all sections (including Company story, team & culture and What's fun); link screenshots and the landing 5s video/GIF (if created) in the Screenshots & video section.

3. **Optional summary**
   Optionally update `docs/design-research/DESIGN_ANALYSIS_TLDR.md` with 1–2 design bullets per company.

4. **Report**
   List companies analyzed, DESIGN_ANALYSIS.md created/updated, screenshot and 5s video/GIF usage (new vs reused), and any failures (include missing ffmpeg if video was skipped).
