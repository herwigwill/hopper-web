import type { APIRoute } from "astro";
export const GET: APIRoute = () =>
  new Response(`User-agent: *\nAllow: /\nDisallow: /blog/cover/\n\nSitemap: https://addhopper.com/sitemap.xml\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
