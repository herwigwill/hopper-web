/**
 * Landing on a #feature link, on every page. The browser's own jump happens before fonts and images settle, and puts
 * a small target (one button, one card) flush under the sticky header with no context. Instead: once the page has
 * laid out, a section lands just under the header and anything smaller lands in the middle of the screen, then it
 * flashes a ring so you can see what you came for. Same-page links do the same, smoothly.
 */
const HEADER = 72;

function reduced() {
  return matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function land(el: HTMLElement, smooth: boolean) {
  const r = el.getBoundingClientRect();
  // A page with more sticky chrome than the header says so with scroll-margin-top.
  const offset = Math.max(HEADER, parseFloat(getComputedStyle(el).scrollMarginTop) || 0);
  const small = r.height < innerHeight * 0.45 && el.tagName !== "SECTION";
  const top = small ? r.top + scrollY - Math.max(offset, (innerHeight - r.height) / 2) : r.top + scrollY - offset;
  scrollTo({ top: Math.max(0, top), behavior: smooth && !reduced() ? "smooth" : "auto" });
  if (small) {
    el.classList.remove("anchor-flash");
    void el.offsetWidth;
    el.classList.add("anchor-flash");
    setTimeout(() => el.classList.remove("anchor-flash"), 1800);
  }
}

function target(hash: string) {
  if (!hash || hash === "#") return null;
  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch {
    return null;
  }
}

/* Arriving with a hash: wait for layout (fonts, images), then land. */
if (location.hash) {
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  const go = () => {
    const el = target(location.hash);
    if (el) requestAnimationFrame(() => land(el, false));
  };
  if (document.readyState === "complete") go();
  else addEventListener("load", go, { once: true });
}

/* Same-page links. Handlers that already took the click (the hub's hops) win. */
document.addEventListener("click", (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = (e.target as Element).closest<HTMLAnchorElement>("a[href*='#']");
  if (!a || a.origin !== location.origin || a.pathname !== location.pathname) return;
  const el = target(a.hash);
  if (!el) return;
  e.preventDefault();
  history.pushState(null, "", a.hash);
  land(el, true);
});
