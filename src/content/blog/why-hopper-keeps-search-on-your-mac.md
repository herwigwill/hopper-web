---
title: Why Hopper keeps your search on your Mac
description: "Hopper reads your tabs, docs, chats and agents, so it has to be trustworthy. Here's what stays on your Mac, what's off by default, and the one exception."
date: 2026-10-07
author: will
feature: { label: On-Device Only, href: /features/on-device }
answer: "Hopper reads, stores and searches everything on your Mac, with no cloud copy of your tabs, docs or chats. Personal apps like Messages and Slack are off until you turn them on, private windows are never read, and the only thing it fetches online is a public page for Hulu and Netflix links, which you can turn off."
takeaways:
  - "Search runs on your Mac. There’s no cloud copy."
  - "Messages, Notes, Slack, Calendar and browser history start off."
  - "Incognito and private windows never reach Hopper."
  - "The one network use, Online Lookups, can be switched off."
faq:
  - q: "Does Hopper send my data to a server?"
    a: "No. Everything Hopper indexes is stored and searched on your Mac. The one exception is Online Lookups: for Hulu and Netflix links, Hopper fetches the public page, signed out and without cookies, to name the episode."
  - q: "Can I stop Hopper from seeing an app?"
    a: "Yes. Exclude any app in Settings ▸ Privacy. An excluded app is never indexed or recorded, won’t show up in search, Back or Clipboard History, and snippets never expand in it."
  - q: "Is Clipboard History on by default?"
    a: "No. It’s off until you turn it on, and it skips anything your password manager marks as secret."
  - q: "Does Hopper need Full Disk Access?"
    a: "No. Full Disk Access is optional. It lets Hopper search more apps; without it, Hopper works with what it can already see."
cover:
  kind: mac
  caption: "It all stays on your Mac."
  icons: [chrome, safari, notion, slack, messages, notes, claude, codex, cursor, obsidian, music, reminders]
  tone: blue
coverAlt: "A Mac display holding twelve app icons, including Chrome, Notion, Slack and Claude, captioned “It all stays on your Mac.”"
---

Hopper reads a lot. To take you back to the exact tab, doc, chat or coding session, it has to know where those are. That only works if you can trust it with that, so here is exactly how it’s built.

## Everything is searched on your Mac

Everything Hopper finds is read, stored and searched on this Mac. There’s no cloud copy of your tabs, docs or chats.

That goes for the clever parts too. The words in your screenshots are recognized with on-device text recognition. Agent status comes from each agent’s own files, with nothing installed into Claude Code, Codex or Cursor.

## The careful option is the default

Every privacy choice is a switch in **Settings ▸ Privacy**, and it starts in the careful position:

- **Personal apps start off.** Messages, Apple Notes, Slack, Calendar, browser history and past agent sessions stay out of search until you turn them on.
- **Clipboard History is opt-in.** It skips anything your password manager marks as secret.
- **Private windows stay private.** Incognito and private browser windows never reach Hopper.
- **Full Disk Access is optional.** It helps Hopper search more apps. Without it, Hopper works with what it can already see.

## You can take things back

- **Exclude any app.** It’s never indexed or recorded, and won’t appear in search, Back or Clipboard History.
- **Choose how long history lasts.** 30 days by default. Make it 7 or 90, or clear it whenever you like.
- **Forget a pick.** Hopper learns which result you choose for what you type. Reset Ranking from <kbd>⌘</kbd><kbd>K</kbd> forgets it.

[Every privacy control](/features/privacy-controls) is on one page.

## The one exception

We’d rather say it than bury it. Hulu and Netflix tab titles don’t name the episode, so for those links Hopper fetches the public page, signed out and without cookies, to find the name. That’s it. Turn it off in **Settings ▸ Privacy ▸ Online Lookups**, and the saved names are deleted.

## Why we built it this way

Hopper is free for every core feature, and it isn’t funded by your data. We don’t store it, so there’s nothing to sell, leak or lose.

## Try it

Hopper is in private testing for macOS 26. [Join the waitlist](/#join).
