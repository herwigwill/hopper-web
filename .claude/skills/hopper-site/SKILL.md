---
name: hopper-site
description: How the Hopper marketing site (hopper-web) is built and maintained. Use before adding or changing pages, components, scripts, tests or SEO files in this repo, or when debugging it.
---

# Building and maintaining hopper-web

File map, deploy and waitlist: `README.md`. This file is what the README doesn't say.

## Source of truth
- `src/content/facts.ts`: every product claim and all demo data. Comment each fact with its source (ADR number,
  Swift file). Pages import from it; don't hardcode claims in pages.
- Check claims in `~/hopper-native`: `docs/STATUS.md` (built today), `docs/DECISIONS.md` (ADRs: default keys,
  defaults on/off), Swift sources (exact titles, subtitles, keys, e.g. `OnboardingView.swift`, `NavigateCommand.swift`).
- Also data files: `src/content/help.ts` (Help answers), `src/content/authors.ts`, `src/content/blog/*.md`.
- Open drift: STATUS.md says 30 sources; `facts.sourceCount` is 28. Onboarding text mentions ⌘D bookmarks (stale,
  ADR-037): don't claim it.

## Pages
| Kind | Pattern |
| --- | --- |
| Feature with demos | `src/pages/features/x.astro` composing sections in `src/features/x/*.astro` (one section per file, own script) |
| Feature, no demo | `components/NotePage.astro` (crumb, title, lede, points), e.g. `on-device.astro` |
| Doc-like | `privacy.astro` / `terms.astro` style (`.policy`) |
| Data-driven | Help (`help.ts`), Blog (content collection) |

Feature pages end with `<MoreFeatures current="id" />`; marketing pages end with `<Join />`.

**New page checklist:** footer link in `components/Footer.astro` (drop `soon: true`) or `featureIndex` in facts.ts;
`src/pages/sitemap.xml.ts`; `src/pages/llms.txt.ts`; `tests/page.spec.ts` link list (feature pages also
`tests/features.spec.ts` `pages`); README page list if structural. Header nav is Home / Features / Compare / Blog only.

## Techniques
- **Product recreations, not videos**: `styles/launcher.css` (`.lx*` classes) recreates Hopper's launcher. Wrap in
  a `container-type: inline-size` box and set `--lx-size: clamp(..., calc(100cqw / N), 14px)` so it scales.
  App icons: `public/icons/<name>.webp` via `apps[...]` in facts.ts. Mac desktop scenes: `styles/desk.css`, `MacWindow`.
- **Demo logic** in `src/scripts/*.ts` (pure, testable, e.g. `navigation.ts` Timeline) or the section's `<script>`.
  Autoplay starts on IntersectionObserver, runs once, stops when the user interacts, and never runs with reduced motion.
- **Page hop**: cross-document view transitions (`global.css`, `public/hop.js` sets direction). Hub ↔ feature morphs
  use paired names `title-<id>` / `stage-<id>`. Names must be unique per page.
- **Anchors**: `scripts/anchors.ts` lands `#hash` links after layout: sections under the header, small targets
  centered with a flash. Pages with sticky toolbars set `scroll-margin-top` on targets.
- **SEO/AI**: `Base.astro` props `image`, `imageAlt`, `article`, plus `<script slot="head" type="application/ld+json"
  is:inline set:html={ldJson(...)}>` for JSON-LD (`lib/blog.ts`). `/llms.txt`, `/rss.xml`, `/sitemap.xml`, `/blog/<slug>.md`.
- **Images**: `npm run og` (site card + touch icon), `npm run blog:covers` (Playwright screenshots of `/blog/cover/<slug>`).
  Favicon `public/favicon.svg`; bunny mark `components/HopperMark.astro` (currentColor).

## Gotchas
- **Scoped CSS doesn't reach `innerHTML` nodes.** Style re-rendered markup with `.parent :global(.child)`.
- **CSP `script-src 'self'`** (meta tag in `Base.astro`, build only; enforced in tests): no inline scripts, no third-party
  requests. Astro `<script>` bundles are fine. JSON-LD `is:inline` is data, so it's fine.
- **Global class collisions**: `global.css` and `desk.css` define global classes (`.key`, `.keys`, `.wrap`, `.lede`,
  `.mw`...). Give section classes distinctive names; grep before naming.
- **`build.format: "file"`**: on the built home page `Astro.url.pathname` is `/index.html`, not `/`. Normalize
  before comparing (see `Header.astro`). Dev and build can differ: tests run the build.
- **Content collections**: restart the dev server after changing `src/content.config.ts`.
- **zsh**: quote paths with brackets (`'src/pages/blog/[slug].astro'`) or the shell errors.
- **Hopper installed eats its own keys** (⌘Space, ⌃⌥←, ⌘⌘...). Pages for installed users (Getting Started) can't
  detect those keys; use checkboxes. Key demos elsewhere listen only while in view.
- `localStorage` only for per-visitor conveniences, always in try/catch.

## Dev server and previews
- Start it with the preview tool (`.claude/launch.json`, `autoPort`): each worktree gets its own port through `PORT`
  (`astro.config.mjs`). Several chats run at once, so **4321 is often another worktree's server, without this
  branch's changes.** Check the preview tool's result or logs for the real port, and give the owner that exact URL.
- Never stop the server the owner is looking at. If a restart is unavoidable, say so and give the new URL.
- Tests serve the build on 4399 (`TEST_PORT` to change), so they never fight a dev server. No need to stop anything.

## Testing: pick the smallest tier that proves the change
| When | Run | Time |
| --- | --- | --- |
| Iterating on design or copy | nothing (owner verifies by looking; screenshot only if asked) | 0 |
| Types or props changed | `npx astro check` | ~15s |
| One area changed | `npx playwright test tests/features.spec.ts --project=chromium` (or `-g "name"`) | ~30s |
| Broad change | `npm run build && npm run test:quick` (desktop only) | ~1m |
| Before a PR (required) | `npm run verify`, once | ~1.5m (longer if other chats are busy) |

- Tests run against `dist/`: **build first** or you test stale output (`verify` does it for you).
- Run the full suite **once**, in the background, with output to a file, then read the file. Never rerun to see output:
  `npm run verify > "$SCRATCH/verify.log" 2>&1; tail -40 "$SCRATCH/verify.log"` (`grep -B2 -A30 "✘"` for failures).
- After a failure, rerun only the failures: `npm run test:failed`. Passes on rerun = flake: say so, don't loop.
- `npm run verify` = `astro check` + build + Playwright (desktop Chromium + mobile Pixel; axe a11y, console errors,
  no sideways scroll, CLS, links and assets, metadata, demos, waitlist). `WEBKIT=1` adds Safari and iPhone.
- Ad hoc Playwright scripts: put them in the scratchpad and import
  `/Users/willherwig/hopper-web/node_modules/@playwright/test/index.mjs` (bare import fails outside the repo).
- New interactive section: add a test that clicks it and checks the visible result, plus it's covered by axe.
