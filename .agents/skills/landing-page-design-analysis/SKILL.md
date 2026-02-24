---
name: landing-page-design-analysis
description: Analyzes landing page design (layout, typography, color, hierarchy, CTAs) for comparable companies, with screenshots. Use when the user wants design analysis of competitor/comparable sites, design inspiration, or design-focused research with screenshots—separate from product/value-prop comparable research.
disable-model-invocation: false
---

# Landing page design analysis

Run a **design-focused** analysis of comparables' landing pages (and key pages): layout, typography, color, visual hierarchy, CTAs, and trust signals. Output is per-company `DESIGN_ANALYSIS.md` plus optional summary. **Design research lives in `docs/design-research/`** (separate from product research in `docs/research/`). Reuses the same company list as comparable research; does not replace FINDINGS.md (product/value props).

## How to run: skill vs command vs agent

- **Skill** (this file): Invoke with `/landing-page-design-analysis` or by asking e.g. "run landing page design analysis." The agent applies this skill and runs the workflow in the current chat.
- **Command**: Same workflow via `.cursor/commands/landing-page-design-analysis.md`; parameters (add / exclude / date) go after the command name.
- **Agent (Cursor agent)**: A dedicated subagent runs the workflow in its own context and returns a summary. File: `.cursor/agents/landing-page-design-analysis.md`. Invoke by selecting the landing-page-design-analysis agent or saying "Use the landing-page-design-analysis agent to run design analysis." Best for long runs (many companies + screenshots) so the main chat stays clean.

## When to use

- Analyze **design** of competitor/comparable landing pages (not just value props).
- Get design inspiration: layout, typography, color, CTAs.
- Produce design notes and screenshots for design reviews or UI decisions.
- Run after or alongside comparable research (screenshots can be shared).

## Scope

- **Companies**: Same list as comparable research — `scripts/capture-all-comparables.js` (COMPANIES array). Or specify subset.
- **Add company**: User may say "add [slug] [primary-url]". Ensure `docs/research/comparables/[slug]/FINDINGS.md` exists (product research; create from research-templates if needed), add to COMPANIES if missing, then run design analysis for that company (output goes to `docs/design-research/`).
- **Exclude**: User may say "exclude [slug1, slug2]". Run only for the rest.

## Output location

- **Per company**: `docs/design-research/comparables/[company-slug]/DESIGN_ANALYSIS.md`
- **Screenshots & video**: `docs/design-research/comparables/[company-slug]/screenshots/[YYYY-MM-DD]/`
- **Template**: `docs/design-templates/LANDING_PAGE_DESIGN_TEMPLATE.md`
- **Optional**: Add or update `docs/design-research/DESIGN_ANALYSIS_TLDR.md` with 1–2 design bullets per company.

## Workflow

### 1. Ensure screenshots exist

**Capture order:** (1) Vercel agent-browser — (2) Playwright MCP — (3) Node script. Use the next option only if the previous one is unavailable or fails (e.g. agent-browser not installed, timeout, or error).

- Screenshots and video live in **`docs/design-research/comparables/[slug]/screenshots/[YYYY-MM-DD]/`** (design-research folder, not `docs/research/`).
- **Default (preferred)**: Use **Vercel agent-browser** (agent-browser skill / CLI) for capture — more robust. For each URL: `agent-browser open <url>`, `agent-browser wait 1500` (or wait for content), then `agent-browser screenshot --full <abs-path>` saving to `docs/design-research/comparables/[slug]/screenshots/[YYYY-MM-DD]/[url-path-slug].png`. Create the date folder if needed. If agent-browser is not installed, run: `npm install -g agent-browser && agent-browser install`.
- **Fallback** (only if agent-browser fails or is unavailable): Use **Playwright MCP** (viewport 1024x768, full-page, JPEG 82) saving to `docs/design-research/.../screenshots/[date]/`.
- Use today's date in YYYY-MM-DD unless the user specifies another. If screenshots already exist for a date, reuse them; link to them in DESIGN_ANALYSIS section 8.

### 1b. Per-landing-page 5-second video or GIF (feature-video workflow)

For **each** company's **landing page** (primary URL), produce a **~5-second video or GIF** walkthrough.

- **Capture**: Use agent-browser to open the landing URL, wait for content (~1.5–2s), take a full-page or viewport screenshot; optionally scroll down once and screenshot again; optionally scroll back to top and screenshot. Aim for 3–5 frames so the sequence feels like a short walkthrough.
- **Build video/GIF**: Use **ffmpeg** to turn the frames into a ~5s clip. Save frames to a temp folder or directly into `docs/design-research/comparables/[slug]/screenshots/[YYYY-MM-DD]/` with names like `landing-01.png`, `landing-02.png`, then:
  - **MP4** (recommended): `ffmpeg -y -framerate 0.6 -i .../landing-%02d.png -c:v libx264 -pix_fmt yuv420p -vf "scale=1280:-2" .../landing-demo.mp4` (e.g. 3 frames at 0.6 fps = 5s).
  - **GIF**: `ffmpeg -y -framerate 0.6 -i .../landing-%02d.png -vf "scale=640:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse" -loop 0 .../landing-demo.gif`.
- **Output path**: Save to `docs/design-research/comparables/[slug]/screenshots/[YYYY-MM-DD]/landing-demo.mp4` and/or `landing-demo.gif`.
- **Prerequisites**: agent-browser (already used for screenshots), **ffmpeg** (required for video/GIF). If ffmpeg is missing, skip the video step and note in the summary; still capture static screenshots.

### 2. Visit and analyze each site

For each company in scope:

- Open primary URL (and other key pages: pricing, features, signup if relevant).
- Observe and note:
  - **Layout & structure**: Grid, sections, density, above-the-fold, scroll flow.
  - **Typography**: Headings vs body, scale, readability.
  - **Color & contrast**: Palette, accent usage, accessibility.
  - **Visual hierarchy**: What draws the eye first, secondary focus.
  - **CTAs & conversion**: Primary/secondary CTAs, placement, clarity.
  - **Navigation & trust**: Header, trust signals, footer.
  - **Company story, team & culture**: Narrative the page tells (mission, origin, tone). How the team is presented (About/Team, photos, roles). Culture inferred from design (bold vs safe, corporate vs indie, imagery, voice).
  - **What's fun**: Playful elements (animations, humor, easter eggs), personality in copy/CTAs, one thing that delights or is memorable.
- Use the page snapshot (accessibility tree) or screenshot to ground the analysis.

### 3. Write DESIGN_ANALYSIS.md

- Create or update `docs/design-research/comparables/[slug]/DESIGN_ANALYSIS.md` from `docs/design-templates/LANDING_PAGE_DESIGN_TEMPLATE.md`.
- Fill every section (1–12). Link screenshots in section 10 (Screenshots & video). If you produced a 5s video/GIF per landing page (step 1b), add the "Video walkthrough" row there. Fill section 8 (Company story, team & culture) and section 9 (What's fun) from the same visit.
- In section 11 (Design summary), add strengths, weaknesses, and reusable ideas.

### 4. Optional: design summary doc

- If useful, create or update `docs/design-research/DESIGN_ANALYSIS_TLDR.md` with 1–2 design bullets per company and links to each DESIGN_ANALYSIS.md.

## Screenshot convention (design-research only)

- **Path**: `docs/design-research/comparables/[slug]/screenshots/[YYYY-MM-DD]/[url-path-slug].(jpg|png)`
- **Preferred (agent-browser)**: Full-page screenshot via `agent-browser screenshot --full <path>`. PNG is fine.
- **Fallback (Playwright/script)**: Viewport 1024x768; JPEG quality 82 (or PNG) for full-page capture.
- **Slug from path**: `/` → `landing`; `/pricing` → `pricing`. Sanitize to `[a-z0-9-]`.

## Relation to comparable research

- **comparable-research**: Product/value props, `docs/research/comparables/`, FINDINGS.md, TLDR_RESEARCH.md. Templates in `docs/research-templates/`.
- **landing-page-design-analysis**: Design only, `docs/design-research/comparables/`, DESIGN_ANALYSIS.md, design takeaways. Templates in `docs/design-templates/`. Same company list (COMPANIES); design has its own screenshots folder under design-research.

## Summary for the user

After the run, report: companies analyzed, DESIGN_ANALYSIS.md created/updated per company, screenshot count or "reused existing", whether a 5s video/GIF was created per landing page (and path), and any failures (timeout, unreachable URL, missing ffmpeg). If a design TLDR was updated, mention it.
