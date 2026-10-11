import type { APIRoute } from "astro";
import { site } from "../content/facts";
import { authors } from "../content/authors";
import { getPosts, postUrl, coverPng } from "../lib/blog";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const GET: APIRoute = async () => {
  const posts = await getPosts();
  const items = posts
    .map(
      (p) => `    <item>
      <title>${esc(p.data.title)}</title>
      <link>${postUrl(p)}</link>
      <guid isPermaLink="true">${postUrl(p)}</guid>
      <pubDate>${p.data.date.toUTCString()}</pubDate>
      <dc:creator>${esc(authors[p.data.author].name)}</dc:creator>
      <description>${esc(p.data.description)}</description>
      <enclosure url="${new URL(coverPng(p), site.url).href}" type="image/png" length="0" />
    </item>`,
    )
    .join("\n");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Hopper blog</title>
    <link>${site.url}/blog</link>
    <atom:link href="${site.url}/rss.xml" rel="self" type="application/rss+xml" />
    <description>Guides to getting around your Mac faster, from the team building Hopper.</description>
    <language>en-us</language>
${items}
  </channel>
</rss>
`,
    { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } },
  );
};
