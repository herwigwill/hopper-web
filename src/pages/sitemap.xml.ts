import type { APIRoute } from "astro";
import { getPosts, postUrl, isoDate } from "../lib/blog";

const pages = [
  { loc: "https://addhopper.com/", priority: "1.0" },
  { loc: "https://addhopper.com/features", priority: "0.8" },
  { loc: "https://addhopper.com/features/search", priority: "0.7" },
  { loc: "https://addhopper.com/features/navigation", priority: "0.7" },
  { loc: "https://addhopper.com/features/agents", priority: "0.7" },
  { loc: "https://addhopper.com/features/hotkeys", priority: "0.6" },
  { loc: "https://addhopper.com/features/privacy-controls", priority: "0.5" },
  { loc: "https://addhopper.com/features/on-device", priority: "0.5" },
  { loc: "https://addhopper.com/features/windows", priority: "0.7" },
  { loc: "https://addhopper.com/compare", priority: "0.6" },
  { loc: "https://addhopper.com/getting-started", priority: "0.6" },
  { loc: "https://addhopper.com/help", priority: "0.6" },
  { loc: "https://addhopper.com/blog", priority: "0.6" },
  { loc: "https://addhopper.com/about", priority: "0.5" },
  { loc: "https://addhopper.com/privacy", priority: "0.3" },
  { loc: "https://addhopper.com/terms", priority: "0.3" },
];
export const GET: APIRoute = async () => {
  const posts = (await getPosts()).map((p) => ({ loc: postUrl(p), priority: "0.6", lastmod: isoDate(p.data.updated ?? p.data.date) }));
  const urls = [...pages, ...posts] as { loc: string; priority: string; lastmod?: string }[];
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map((p) => `  <url><loc>${p.loc}</loc>${p.lastmod ? `<lastmod>${p.lastmod}</lastmod>` : ""}<priority>${p.priority}</priority></url>`)
      .join("\n")}\n</urlset>\n`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
};
