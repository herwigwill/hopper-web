---
title: How to keep track of Claude Code, Codex and Cursor
description: "Running several coding agents at once? Hopper puts Claude Code, Codex and Cursor in one list, sorted by which agent needs you, one keystroke away."
date: 2026-09-23
author: matt
feature: { label: Agents, href: /features/agents }
answer: "Put every agent in one list sorted by status. In Hopper, press ⌥Space to see Claude Code, Codex and Cursor sessions grouped as Needs You, Done, Working and Idle, then press Return to jump into one. ⌥⌘] goes straight to the agent that has waited longest."
takeaways:
  - "The cost of parallel agents is checking on them. One list removes the checking."
  - "Agents are grouped Needs You, Done, Working and Idle."
  - "⌥⌘] (Next Agent) jumps to whoever has waited longest, then the next."
  - "Hopper reads each agent’s own files. Nothing is installed into the agents."
faq:
  - q: "Which coding agents does Hopper support?"
    a: "Claude Code, the Claude app, Codex and Cursor, plus agents running in herdr."
  - q: "Does Hopper need hooks or a plugin in Claude Code?"
    a: "No. Hopper reads each agent’s own files on your Mac. Nothing is installed into Claude Code, Codex or Cursor."
  - q: "What does “Done” mean?"
    a: "The agent finished its turn after you last looked at it. Once you’ve seen it, it moves to Idle."
  - q: "Does every agent show Needs You?"
    a: "Needs You is shown for Claude Code and Claude, which say when they stop to ask you something. Codex and Cursor show Working, Done and Idle."
  - q: "Can I find an old agent session?"
    a: "Yes. Past Claude Code and Codex sessions are in search. Type what the session was about and open it again."
cover:
  kind: launcher
  query: ""
  tab: Agents
  rows:
    - { icon: claude, title: "Fix auth token refresh", sub: "api", acc: "", status: "Needs You" }
    - { icon: cursor, title: "Refactor billing webhooks", sub: "web", acc: "", status: "Done" }
    - { icon: codex, title: "Add rate limiting to signup", sub: "api", acc: "", status: "Working" }
    - { icon: claude, title: "Write migration for teams table", sub: "api", acc: "", status: "Idle" }
  tone: night
coverAlt: "Hopper's Agents list on navy: a Claude Code session that needs you, a Cursor agent that's done, a Codex agent working and one idle."
---

Running three agents at once feels like a superpower until you notice where your time goes: checking on them. Which terminal was the auth fix in? Did Cursor finish? Has Claude been waiting on a permission prompt for ten minutes?

## The real cost of parallel agents

Agents are fast. The slow part is you finding out they need you. Every check is a hop: find the window, find the tab, read the last few lines, go back. Multiply by three agents and a workday.

## One list, sorted by who needs you

In [Hopper](/features/agents), press <kbd>⌥</kbd><kbd>Space</kbd> from anywhere. Every agent is in one list, grouped by status:

| Status | Means |
| --- | --- |
| **Needs You** | Stopped to ask you something, like permission to run a command |
| **Done** | Finished since you last looked |
| **Working** | Busy right now. Leave it be |
| **Idle** | Nothing new to see |

Press <kbd>↵</kbd> and you’re in that exact session, in the terminal, editor or app it’s running in. Once you’ve seen a Done agent, it moves to Idle on its own.

## One key to whoever’s waited longest

Don’t even open the list. **Next Agent**, <kbd>⌥</kbd><kbd>⌘</kbd><kbd>]</kbd>, jumps straight to the agent that needs you, then the ones that finished. Press it again for the next. It’s a queue you work through with one key.

## Find the session from last week

Past Claude Code and Codex sessions are in search too. Press <kbd>⌘</kbd><kbd>Space</kbd>, type what it was about (“rate limiting”, “teams migration”), and open it again.

## No hooks, nothing installed

Hopper doesn’t install hooks or plugins into your agents. It reads each agent’s own files on your Mac. Claude Code and Claude report when they’re waiting on you; Codex and Cursor show Working, Done and Idle.

It works with Claude Code, the Claude app, Codex and Cursor, plus agents running in herdr.

## Try it

Hopper is in private testing for macOS 26. [Join the waitlist](/#join).
