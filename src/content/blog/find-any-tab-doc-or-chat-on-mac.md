---
title: How to find any open tab, doc or chat on your Mac
description: "Stop clicking through windows to find a tab. Press ⌘Space in Hopper, type a few letters and go straight to the tab, doc, chat or coding session."
date: 2026-09-09
author: matt
feature: { label: Search, href: /features/search }
answer: "Use one search for everything you have open. In Hopper, press ⌘Space, type a few letters of what you remember, and press Return. You land in the exact Chrome tab, Notion page, Slack channel or Claude Code session, not just its app."
takeaways:
  - "⌘Tab and Mission Control find apps and windows. They can’t find a tab or a doc inside them."
  - "Hopper searches open tabs, docs, chats, files and coding sessions from one box."
  - "Press ⇥ to narrow the search to the app you’re in or to your agents."
  - "Search runs on your Mac. Personal apps stay out until you switch them on."
faq:
  - q: "Can Spotlight search my open Chrome tabs?"
    a: "No. Spotlight finds apps, files and some app content, but not the tabs open in Chrome or Safari. Hopper reads open tabs in both browsers and puts them in the same results as your files and apps."
  - q: "Does Hopper replace Spotlight?"
    a: "It can. Hopper defaults to ⌘Space and still finds apps, files and settings. If you want to keep Spotlight on ⌘Space, give Hopper a different shortcut in its Settings."
  - q: "Does Hopper upload what it finds?"
    a: "No. Hopper reads, stores and searches everything on your Mac. Messages, Notes, Slack, Calendar and browser history stay out of search until you turn them on."
  - q: "Which apps can Hopper search?"
    a: "Chrome and Safari tabs, bookmarks, Claude Code, Codex and Cursor sessions, Notion, Obsidian, Apple Notes, Slack, Messages, Contacts, Calendar, Reminders, Music, apps, windows and files, among others."
cover:
  kind: launcher
  query: q4
  rows:
    - { icon: notion, title: "Q4 Launch Plan", sub: "Product", acc: "Page" }
    - { icon: chrome, title: "Checkout funnel, Q4", sub: "analytics.internal", acc: "Tab" }
    - { icon: slack, title: "#q4-launch", sub: "Acme", acc: "Channel" }
    - { icon: claude, title: "Q4 pricing page copy", sub: "web", acc: "Session" }
coverAlt: "Hopper's search with “q4” typed, showing a Notion page, a Chrome tab, a Slack channel and a Claude Code session."
---

You know the feeling. The doc you need is open. You saw it ten minutes ago. Now it’s somewhere behind six windows and forty tabs, and you’re clicking through all of them.

## Why can’t I find a tab I already have open?

Because your Mac only knows about apps and windows. <kbd>⌘</kbd><kbd>Tab</kbd> shows apps. Mission Control shows windows. Neither knows that the thing you want is the third tab in the second Chrome window, or a Notion page, or a thread in Slack.

So you do the search yourself, one window at a time.

## The fix: one search for everything you have open

[Hopper](/features/search) keeps track of the places you work in: tabs, docs, chats, files and coding sessions. Press <kbd>⌘</kbd><kbd>Space</kbd>, type a few letters of whatever you remember, and press <kbd>↵</kbd>.

You don’t land in Chrome. You land in **that tab**. You don’t land in Slack. You land in **that channel**.

A few things that make it fast:

- **It ranks what you meant.** Recent places and the ones you pick often come first. Typos are fine.
- **Two letters is usually enough.** “q4” finds the Q4 plan, the Q4 dashboard and the Q4 channel, all in one list.
- **It remembers your search.** Close Hopper and open it again, and your text is still there. Press <kbd>esc</kbd> to start fresh.

## How to narrow it down

Sometimes “everything” is too much. Press <kbd>⇥</kbd> to move between three filter tabs without losing what you typed:

| Tab | What it shows |
| --- | --- |
| Search | Everything |
| The app you’re in | Only that app’s tabs, pages or chats, plus its own menu commands |
| Agents | Your coding agents, sorted by which one needs you |

The middle one is the sleeper. In Chrome, it’s your open tabs. In Notion, your pages. In Slack, your channels.

## What Hopper searches

Browsers (Chrome and Safari tabs, bookmarks), coding agents (Claude Code, Codex, Cursor), notes and docs (Notion, Obsidian, Apple Notes, recent files in your editor), people and plans (Slack, Messages, Contacts, Calendar, Reminders), and your Mac itself (apps, windows, files, Music, TV).

You choose which of these are on. Messages, Notes, Slack, Calendar and browser history start **off**, and private browser windows are never read. [See every source](/features/search#sources).

## Is my data uploaded?

No. Everything Hopper finds is read, stored and searched on your Mac. There’s no cloud copy of your tabs, docs or chats. [Here’s exactly what stays local](/features/on-device).

## Try it

Hopper is in private testing for macOS 26. [Join the waitlist](/#join) and we’ll send you a build.
