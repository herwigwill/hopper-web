---
name: hopper-blog
description: Write, edit or review a post for the Hopper blog (addhopper.com/blog). Use when asked to add a blog post, draft an article, plan blog topics or improve a post's SEO. Covers the post format, fact-checking against hopper-native, the cover image, SEO and AI-search (GEO) rules, and how to publish.
---

# Writing for the Hopper blog

A post is one Markdown file in `src/content/blog/`. Its file name is its URL: `back-button-for-your-whole-mac.md` →
`/blog/back-button-for-your-whole-mac`. Everything else (page, cover, structured data, RSS, sitemap, llms.txt and the
`.md` copy for AI agents) is generated from it. Don't edit the templates to publish a post.

## 1. Pick the topic

- **One question per post**, the one a person would type into Google or ask ChatGPT ("how do I find an open tab on
  my Mac", "keep track of several Claude Code agents"). The title answers it or names it.
- **About one feature**, linked from `feature` and from the body. Existing pages: `/features/search`,
  `/features/navigation`, `/features/agents`, `/features/windows`, `/features/hotkeys`, `/features/privacy-controls`,
  `/features/on-device`.
- Check `src/content/blog/` first so two posts don't target the same question. Link between related posts.

## 2. Check every claim (non-negotiable)

Hopper is in private testing. Every fact must be true of hopper-native today:

1. `src/content/facts.ts` (already checked against the app). Prefer its wording.
2. `/Users/willherwig/hopper-native/docs/STATUS.md` (what's built) and `docs/DECISIONS.md` (ADRs: default keys,
   what's on or off by default, what's left out).
3. The Swift sources when the docs don't say.

Rules: no unbuilt features, no release dates, no prices, no numbers you can't source, no fake quotes, testimonials or
stats. Default keys: Search ⌘Space, Agents ⌥Space, Next Agent ⌥⌘], Back ⌃⌥←, Forward ⌃⌥→, Toggle ⌘⌘ (double tap),
Toggle Tab ⌥⌥ (double tap), History ⌃⌘ (press and release). Window commands have **no** keys by default. Clipboard
History and personal sources start **off**. Needs You is only for Claude Code and Claude. Online Lookups (Hulu/Netflix
public pages) is the one network use; never say "nothing ever leaves your Mac" without it. If unsure, leave it out and
tell the owner.

## 3. Frontmatter

The schema is in `src/content.config.ts`; `npx astro check` fails on a bad field.

```yaml
---
title: How to find any open tab, doc or chat on your Mac   # ≤ 60 chars, the question or its answer
description: "…"            # 80–160 chars, gives the answer, not a tease (meta description + card)
date: 2026-10-14            # publish date, YYYY-MM-DD
updated: 2026-11-02         # only when the content materially changes
author: matt                # matt (Founder) or will (Growth), see src/content/authors.ts
feature: { label: Search, href: /features/search }
answer: "…"                 # 2–3 sentences that answer the title on their own. Name Hopper, the keys, the outcome.
takeaways:                  # 2–5 short, factual bullets
  - "…"
faq:                        # 0–6 real questions people search, each answer 1–3 sentences, self-contained
  - q: "…?"
    a: "…"
cover: { … }                # see section 5
coverAlt: "…"               # describes the cover literally
draft: false                # true keeps it out of the build (still visible in `astro dev`)
---
```

## 4. Body

- **Voice**: the site's. Plain words, short sentences, second person, outcomes not internals. No "leverage",
  "seamless", "game-changer", "in today's fast-paced world". No hype. Sound like a person who uses the product.
- **Shape** (500–900 words):
  1. A 2–3 sentence hook naming a real situation ("forty tabs, six windows").
  2. `##` sections phrased as the questions people ask ("Why can't I find a tab I already have open?"), each opening
     with its direct answer in the first sentence.
  3. Lists and small tables where they help. Tables are good for "which X does what".
  4. End with `## Try it` and one line linking `/#join`. The page adds the waitlist below it.
- **Don't** repeat the h1 (the page shows `title`), or write the short answer or FAQ in the body (the page shows them).
- **Keys**: `<kbd>⌘</kbd><kbd>Space</kbd>`, one `<kbd>` per key, as Hopper shows them (⌘ ⌥ ⌃ ⇧ ↵ ⇥ esc ← →).
- **Links**: 2–4 internal links to feature pages or sections (`/features/search#sources`) and other posts. External links
  only to primary sources.

## 5. Cover

The cover is drawn from frontmatter by `src/components/blog/Cover.astro`, never a stock image. Pick the kind that
shows the post's moment, using demo data in the style of `facts.ts` (believable, fictional, no real people). Icons are
file names in `public/icons/` (chrome, safari, notion, slack, messages, notes, claude, codex, cursor, obsidian,
reminders, music, terminal, vscode). `tone`: blue (default), night or sun. Use a different kind or tone from the
previous post.

```yaml
cover: { kind: keys, keys: ["⌃", "⌥", "←"], caption: "Back, in every app.", tone: blue }     # 1–4 keycaps + caption
cover:                                                                                      # a Hopper search
  kind: launcher
  query: q4
  tab: Agents        # optional: shows the filter tabs with this one selected
  rows:              # 1–4; first is selected. status: Needs You | Done | Working | Idle (replaces acc)
    - { icon: notion, title: "Q4 Launch Plan", sub: "Product", acc: "Page" }
cover:                                                                                      # windows on a screen
  kind: windows
  caption: "A whole layout, one key."
  layout:            # 1–4; x, y, w, h are fractions of the screen
    - { icon: cursor, label: "Cursor", x: 0, y: 0, w: 0.6667, h: 1 }
cover: { kind: mac, caption: "It all stays on your Mac.", icons: [chrome, notion, slack] }   # 3–12 icons on a Mac
```

Then run `npm run blog:covers`. It builds the site and writes `public/blog/<slug>.png` (1200×630), the image used for
social cards, Google and the structured data. Commit the PNG with the post. Open the PNG to check it.

## 6. SEO and AI search: what the template already does

So you don't add it by hand: canonical URL, Open Graph/Twitter card with the cover, `article:published_time`,
JSON-LD (`BlogPosting` with author and dates, `BreadcrumbList`, `FAQPage` from `faq`), the "short answer" box at the
top, RSS (`/rss.xml`), sitemap with `lastmod`, `/llms.txt` listing every post, and `/blog/<slug>.md`, a clean Markdown
copy for AI assistants.

What the writer controls, and what matters most for being quoted by Google's AI Overviews, ChatGPT, Perplexity and
Claude:

- **Answer first.** `answer` must stand alone if it's the only thing quoted. Same for every FAQ answer and the first
  sentence under each `##`.
- **Be specific and checkable.** Exact key names, setting paths (Settings ▸ Privacy ▸ Online Lookups), app names.
  Specific facts get cited; vague claims don't.
- **Use the words people search** in the title, description, first paragraph and one `##`, naturally. Name the
  alternatives people compare against (Spotlight, ⌘Tab, Rectangle, Raycast) fairly and accurately.
- **Fresh and dated.** Set `updated` when facts change (e.g. a default key moves in hopper-native).
- **One post, one intent.** Don't stuff a second topic in; write a second post and link it.

## 7. Publish checklist

1. File in `src/content/blog/<slug>.md`, slug = lowercase keywords with hyphens, no dates, no stop-word padding.
2. Every claim checked (section 2). List anything you couldn't verify for the owner.
3. `npx astro check` passes (frontmatter is valid).
4. `npm run blog:covers`, then look at `public/blog/<slug>.png`.
5. Look at `/blog` and `/blog/<slug>` in the dev server (`npm run dev`, port 4321), desktop and phone width, when
   the owner asks for verification. `npm test` covers every post's page, structured data and cover.
6. Don't commit, push or publish unless the owner asks.
