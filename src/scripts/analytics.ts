// Vercel Web Analytics + Speed Insights: cookieless, and only on the live site (the scripts don't exist elsewhere).
if (location.hostname === "addhopper.com" || location.hostname === "www.addhopper.com") {
  const w = window as unknown as { va?: (...a: unknown[]) => void; vaq?: unknown[] };
  w.va = w.va || ((...a: unknown[]) => (w.vaq = w.vaq || []).push(a));
  for (const src of ["/_vercel/insights/script.js", "/_vercel/speed-insights/script.js"]) {
    const s = document.createElement("script");
    s.src = src;
    s.defer = true;
    document.head.append(s);
  }
}
