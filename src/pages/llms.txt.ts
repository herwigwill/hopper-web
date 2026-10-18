/**
 * /llms.txt (llmstxt.org): a plain summary of Hopper and links to its pages, so AI assistants describe it accurately.
 * Same facts as the site (content/facts.ts); blog posts link to their Markdown copies.
 */
import type { APIRoute } from "astro";
import { site, pillars } from "../content/facts";
import { getPosts } from "../lib/blog";

export const GET: APIRoute = async () => {
  const posts = await getPosts();
  const u = (p: string) => new URL(p, site.url).href;
  const txt = `# Hopper

> Hopper is a Mac app (${site.minimumOS} or later) that takes you straight back to the tab, doc, chat or coding session you were in, whatever app it's in. It's in private testing; join the waitlist at ${site.url}.

- Search with ${site.shortcut.join("")}: tabs, docs, chats, files and coding sessions from one box. Search runs on your Mac.
- Back (${site.back.join("")}) and Forward (${site.forward.join("")}) move between places across every app, not just apps.
- Agents (⌥Space): Claude Code, Codex and Cursor sessions in one list, sorted by which needs you.
- Windows: 42 window commands, custom sizes and whole layouts on one key.
- Made by a small independent team. Contact: ${site.contact}

## Features

- [Getting started](${u("/getting-started")}): setup in about two minutes, and five keys to try.
- [Help](${u("/help")}): answers about permissions, shortcuts, search, agents, windows and privacy.
- [Hopper Tips](${u("/tips")}): short narrated videos of each feature and shortcut, the same ones the app shows.
${pillars.map((p) => `- [${p.name}](${u("href" in p ? p.href : `/features#${p.id}`)}): ${p.line}`).join("\n")}
- [Hotkeys & Gestures](${u("/features/hotkeys")}): every default shortcut.
- [On-Device Only](${u("/features/on-device")}): what stays on your Mac, and the one exception.
- [Privacy Controls](${u("/features/privacy-controls")}): what Hopper reads and how to turn it off.
- [Compare](${u("/compare")}): Hopper next to Raycast and Alfred, feature by feature, with what each charges for.

## Blog

${posts.map((p) => `- [${p.data.title}](${u(`/blog/${p.id}.md`)}): ${p.data.description}`).join("\n")}

## Company

- [About](${u("/about")})
- [Privacy policy](${u("/privacy")})
- [Terms](${u("/terms")})
`;
  return new Response(txt, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
