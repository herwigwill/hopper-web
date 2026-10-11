# Hopper — addhopper.com

The landing page for Hopper, the Mac app that takes you straight back to the tab, doc, chat or coding session you were in.
A landing page, feature pages (`/features/*`), About, Blog, Getting Started, Help, Privacy and Terms, built to be fast,
accessible and honest about what Hopper does today. Agents working here: start with `CLAUDE.md`.

## Run it

```bash
npm install
npm run dev        # http://localhost:4321
npm run verify     # type checks, production build, all browser tests
npm run build && npm run serve   # the production build at http://localhost:4322, served like GitHub Pages serves it
```

Node 22 or later. Tests need Playwright's Chromium (`npx playwright install chromium`); add WebKit with
`npx playwright install webkit` and run `WEBKIT=1 npm test` to cover Safari and iPhone too.

## How it's built

- **Astro, static output.** Every page is plain HTML; the only JavaScript is the small script for each interactive
  moment (about 7 KB gzipped for the whole page). No UI framework.
- **No server.** Hosted on GitHub Pages; the waitlist is an email link.
- **Self-hosted font** (Archivo, variable weight and width, subset) and locally stored app icons. No third-party
  requests and no analytics.

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
  components/           the few things that repeat: Launcher, MacWindow, Waitlist, Header, Footer, HopperMark
  scripts/              client scripts (hero, shared launcher logic, anchors)
  styles/               global tokens and the launcher recreation's styles
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

## The waitlist

No service and no server: "Join the waitlist" is a `mailto:` link (`components/Waitlist.astro`) that opens the
visitor's email app with a ready note to `hello@addhopper.com`. The list lives in that inbox.

## Deploying (GitHub Pages)

`.github/workflows/deploy.yml` builds and publishes on every push to `main`.

One-time setup in the repo on GitHub:

1. **Settings → Pages → Source**: GitHub Actions.
2. **Custom domain**: `addhopper.com`, then Save. (`public/CNAME` holds the same.)
3. Once the DNS check passes, tick **Enforce HTTPS**.

DNS (at the registrar): four `A` records on the apex to GitHub Pages' IPs, and `www` as a `CNAME` to
`herwigwill.github.io`. GitHub redirects `www` to the apex.

GitHub Pages can't send custom headers, so the CSP (`script-src 'self'`, no third-party requests) is a meta tag in
`layouts/Base.astro`, built pages only. `npm run serve` serves `dist/` like Pages does, so the tests enforce it.

## Swapping in real assets

- **Hopper's icon:** replace the SVG in `src/components/HopperMark.astro`, `public/favicon.svg`, then `npm run og`
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
