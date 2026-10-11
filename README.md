# Hopper — addhopper.com

The landing page for Hopper, the Mac app that takes you straight back to the tab, doc, chat or coding session you were in.
A landing page plus feature pages (`/features`, `/features/search`, `/features/navigation`, `/features/agents`, `/features/windows`), built to be fast, accessible and honest about
what Hopper does today.

## Run it

```bash
npm install
npm run dev        # http://localhost:4321, with /api/waitlist working (dry run without a Loops key)
npm run verify     # type checks, production build, all browser tests
npm run build && npm run serve   # the production build at http://localhost:4322, served like Vercel serves it
```

Node 22 or later. Tests need Playwright's Chromium (`npx playwright install chromium`); add WebKit with
`npx playwright install webkit` and run `WEBKIT=1 npm test` to cover Safari and iPhone too.

## How it's built

- **Astro, static output.** Every page is plain HTML; the only JavaScript is the small script for each interactive
  moment (about 7 KB gzipped for the whole page). No UI framework.
- **One Vercel Function**, `api/waitlist.ts`, for sign-ups. Its logic lives in `api/_lib/waitlist.ts`, which the dev
  server and `scripts/serve.mjs` also run, so local and production behave the same.
- **Self-hosted font** (Archivo, variable weight and width, subset) and locally stored app icons. No third-party
  requests except Vercel's own analytics on the live domain.

```
src/
  content/facts.ts      every claim about Hopper + the demo data (keep true to hopper-native)
  moments/              one file per section of the page, each with its own layout and script
    Hero.astro          the live launcher demo on a Mac desktop
    Scatter.astro       the scroll moment: a scattered workday collapses into one result
    Back.astro          "A Back button for your whole Mac" with working Back / Forward keys
    Agents.astro        agents list, a session flips to Needs You and opens
    Toolkit.astro       the rest of the launcher, as one typographic line
    Privacy.astro       on-device promises + the real first-run switches
    Join.astro          closing waitlist
  features/hub/         /features: a launcher over the features, then Search, Back & Now Playing, Agents, Windows,
                        and the Toolkit tiles (each tile a small working version)
  features/agents/      /features/agents: the live Agents list, Next Agent, the agents it works with, past sessions
  features/navigation/  /features/navigation: a small Mac moved with Back / Forward / Toggle / Toggle Tab (buttons or
                        the real keys), places vs apps, History, Recently Closed, Now Playing
  features/windows/     /features/windows: the command launcher + display, Repeat a Half, custom commands,
                        layouts, hotkey presets
  components/           the few things that repeat: Launcher, MacWindow, WaitlistForm, Header, Footer, HopperMark
  scripts/              client scripts (hero, waitlist, shared launcher logic, analytics)
  styles/               global tokens and the launcher recreation's styles
api/                    the waitlist Vercel Function
public/icons            app icons (see ASSETS.md)
scripts/                local server, OG image generator, icon tile generator
tests/                  Playwright: content, accessibility (axe), layout, links, metadata, CLS, demos, waitlist
```

## The page hop

Moving between pages is a cross-document view transition (`@view-transition` in `global.css`, no framework): the
page leaves one way and the next arrives on a small arc from the other side. Going back (history, or up a level)
mirrors it; `public/hop.js` picks the direction. Elements with the same `view-transition-name` on both pages morph
(the hub's Windows stage and heading grow into the Windows page's hero). The header stays put. Reduced motion turns
it off; browsers without view transitions just navigate. In-page jumps from the features launcher scroll, then the
section "lands" (`.hop-land`).

## Waitlist setup (Loops)

1. Create a Loops account, then **Settings → API** → create a key.
2. Optional: create a mailing list and copy its id; turn on double opt-in for it if you want confirmed emails.
3. In Vercel → Project → Settings → Environment Variables, set `LOOPS_API_KEY`, `WAITLIST_SECRET`
   (any long random string) and optionally `LOOPS_MAILING_LIST_ID`. See `.env.example`.
4. Recommended: a Vercel WAF rate-limit rule on `/api/waitlist` (e.g. 20 requests / minute / IP).

Without `LOOPS_API_KEY`, sign-ups are a dry run locally (the response says so) and **refused in production**, so a
missing key can never silently lose emails. The optional follow-up answers are saved as Loops contact properties
`launcherToday` and `runsCodingAgents`.

## Deploying (Vercel)

1. Import the repo in Vercel (framework: Astro; `vercel.json` sets the rest).
2. Set the environment variables above for Production (and Preview, with a test list).
3. Add `addhopper.com` and `www.addhopper.com`; `www` redirects to the apex.
4. Turn on **Web Analytics** and **Speed Insights** in the project (cookieless; already wired for the live domain).
5. After each production deploy: load the page, join with a real address, check it in Loops, check the OG preview.

Security headers (CSP with `script-src 'self'`, HSTS, frame-ancestors, etc.) are in `vercel.json`; `npm run serve`
sends the same CSP so the tests enforce it.

## Swapping in real assets

- **Hopper's icon:** replace the SVG in `src/components/Wordmark.astro`, `public/favicon.svg`, then `npm run og`
  (regenerates `public/og.png` and `apple-touch-icon.png`).
- **App icons:** drop a 128×128 WebP into `public/icons/` with the same name. See `ASSETS.md`.
- **Real recordings:** the demos are recreations calibrated to Hopper's real launcher (760×480 panel, row and footer
  layout from `HopperUI/Launcher`). If you'd rather show a capture somewhere, it replaces a moment's scene markup; keep
  the reduced-motion still frame and the pause control.

## Keeping it true

`src/content/facts.ts` holds every product claim and is referenced from `hopper-native/docs/SITE.md`. If a feature
changes in the app, change it there. Things deliberately not claimed yet: Search by Meaning (off by default), windows
on other Spaces, pricing, and Needs You for Codex or Cursor.

## Blog

Posts are Markdown in `src/content/blog/` (schema: `src/content.config.ts`). Each one gets its page, a cover drawn
from frontmatter (`src/components/blog/Cover.astro`), JSON-LD, RSS (`/rss.xml`), a sitemap entry, a line in
`/llms.txt` and a Markdown copy at `/blog/<slug>.md`. After adding or changing a post, run `npm run blog:covers` to
write its social image to `public/blog/<slug>.png`. How to write one: `.claude/skills/hopper-blog/SKILL.md`.
