---
name: hopper-design
description: Design and copy principles for the Hopper marketing site, including the owner's stated preferences and the reusable components. Use when designing, writing or reviewing any page or section of hopper-web.
---

# Hopper site design

## Principles
- **One idea**: "Never lose your place." Every section proves it from a new angle.
- **Simple**: one headline and one sentence per section. Cut anything the visual already says.
- **Show, don't explain**: a live, interactive recreation of the real app beats a description. Interactive beats watched.
- **Reuse before making**: build from existing components, demos, icons and data. No new illustration styles or stock art.
- **Honest**: only what hopper-native does today. No fake stats, testimonials, dates or prices. Say the exception
  plainly (Online Lookups is the one network use).

## Owner's taste (from feedback)
- Copy is plain, calm and human. Never scary or legalistic ("keep backups", "lost data"). Quotes must sound like a
  person said them, not a company ("creepy" was the verdict on a corporate one).
- Modern and stripped down. No decorative pills/badges, gimmicks (bunny ears) or uppercase eyebrow labels.
- Mention location (Jersey City, NJ) once, on About. Team: Matt Herwig, Founder; Will Herwig, Growth. No photos.
- Not funded; core features free; pricing undecided (don't state prices).
- Punchy headlines with a period ("Move like butter.", "Every agent, at a glance."). `&nbsp;` before the last word.

## Visual system (tokens in `styles/global.css`)
- Colors: `--blue #2b3bf5` (the brand), `--sun #ffc93c` (only for "this is the thing": selection, focus, highlight),
  `--paper` page, `--white` alternating sections, `--ink`/`--ink-2` text, `--night` dark sections. Light page, dark product.
- Type: Archivo (`--display`, condensed 800 headlines); `--mac` system font inside product recreations; `--step-*` sizes.
- Signature object: keycaps (`.key`, `.keys`). Signature motion: the hop (`--ease-hop`).
- Section stage: blue rounded panel, `radial-gradient(120% 90% at 85% 0%, #4a58ff 0%, transparent 55%), var(--blue)`,
  with a `.lx` launcher inside.
- Brand art: five abstract glow pieces (deep blue, one violet-to-sun light source, film grain). Originals in
  `art/` next to this file; web copies (720px webp) in `public/art/`. Use them as full-bleed card or panel backgrounds,
  words on the dark lower-left corner over a soft blue scrim. One piece per feature, never reassigned:
  | Art | Feature | Why |
  | --- | --- | --- |
  | `orbit` | Search | a ring and handle, a loose magnifier |
  | `flow` | Navigation | a winding path back and forth |
  | `rays` | Agents | many lines meeting at one point |
  | `stack` | Windows | stacked rounded panes |
  | `dunes` | Toolkit | layered folds, many tools in one |
  New art must match this set (same palette, grain, single light source), not a new style. To make web copies:
  `sharp(src).resize({ width: 720 }).webp({ quality: 74 })` (~10-18 KB each).
- Banners: four wide pieces in the same style, three with a moving loop (`public/banners/`, notes in `ASSETS.md`).
  Placed with `components/Banner.astro`. One moving banner per page; check white text against the loop's middle
  frames, not just the still.
- Page head pattern: breadcrumb (`.crumbs`), big h1 left, lede right (`.intro` 1.3fr / 1fr grid), aligned to the bottom.

## Reusable parts
| Need | Use |
| --- | --- |
| App UI | `launcher.css` `.lx` panel; `components/Launcher.astro`; `MacWindow.astro`; `desk.css` |
| Simple feature page | `NotePage.astro` |
| End of feature page | `features/MoreFeatures.astro` (art cards: 4 on a feature page, 5 elsewhere; swipe row when narrow) |
| Waitlist | `moments/Join.astro`, `Waitlist.astro` |
| Brand mark | `HopperMark.astro` (inherits color) |
| Picture for a post | `components/blog/Cover.astro` (keys, launcher, windows, mac) |
| Line icons | `scripts/icons.ts` (`featureIcons`) |

## Accessibility (tested by axe)
- Toggles: `button role="switch" aria-checked`. Choice groups: radios with roving focus (`scripts/controls.ts`
  `check`, `radioKeys`). Demo narration in a `role="status"` line.
- Visible text must match the accessible name. No `aria-label` on role-less spans; use `.visually-hidden` text.
- Decorative recreations `aria-hidden="true"`; give the figure a real label if it carries meaning.
- Every animation has a `prefers-reduced-motion` version. Keyboard works everywhere; focus is visible.
- Mobile is redesigned, not squeezed: hide subtitles/secondary columns, stack grids, 16px+ gutters.
