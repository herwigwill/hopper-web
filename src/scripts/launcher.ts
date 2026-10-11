/** Shared logic for the launcher recreations: matching like Hopper's word-start search, and row rendering. */
import type { Place } from "../content/facts";
import { apps } from "../content/facts";

const words = (s: string) => s.toLowerCase().split(/[^a-z0-9#]+/).filter(Boolean);

/** Every typed word must start a word somewhere; title hits rank above the rest (ADR-029, simplified). */
export function search(places: Place[], query: string): Place[] {
  const q = words(query);
  if (!q.length) return places;
  const scored: { p: Place; s: number; i: number }[] = [];
  places.forEach((p, i) => {
    const title = words(p.title);
    const rest = words(`${p.subtitle} ${apps[p.app].name} ${p.kind} ${p.words ?? ""}`);
    let s = 0;
    for (const t of q) {
      if (title.some((w) => w.startsWith(t))) s += 10;
      else if (rest.some((w) => w.startsWith(t))) s += 4;
      else return;
    }
    scored.push({ p, s, i });
  });
  return scored.sort((a, b) => b.s - a.s || a.i - b.i).map((x) => x.p);
}

export function rowHTML(p: Place, selected: boolean, idPrefix: string): string {
  const app = apps[p.app];
  const status = p.status ? `<span class="lx-status" data-s="${p.status}">${p.status}</span>` : "";
  return `<li class="lx-row" role="option" id="${idPrefix}-${p.id}" data-id="${p.id}" aria-selected="${selected}">
    <img src="${app.icon}" alt="" width="22" height="22" draggable="false" />
    <span class="lx-title">${escape(p.title)}</span>
    <span class="lx-sub">${escape(p.subtitle)}</span>
    <span class="lx-acc">${status}<span>${p.kind}</span></span>
  </li>`;
}

export function escape(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}

export const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new DOMException("aborted", "AbortError"));
    });
  });

export const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Briefly presses a keycap-like element. */
export function press(el: Element | null, ms = 160) {
  if (!el) return;
  el.classList.add("is-down");
  setTimeout(() => el.classList.remove("is-down"), ms);
}
