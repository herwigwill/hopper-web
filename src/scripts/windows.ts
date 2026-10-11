/**
 * Window geometry for the window-management recreations, after HopperCore's WindowLayout (ADR-052): everything is a
 * fraction of the display's visible area (no menu bar or Dock), thirds and fourths are columns on a landscape display,
 * sixths are 3×2, the gap is whole at the display's edges and half on inner edges so neighbours are one gap apart.
 * Halves step ½ → ⅔ → ⅓ when run again on a window still where Hopper put it.
 */
import { windowCommands, type WindowCommandId } from "../content/facts";

export type Rect = { x: number; y: number; w: number; h: number };

export type WinState = {
  rect: Rect;
  /** The built-in layout it's in, while it's still there. */
  layout: WindowCommandId | null;
  step: number;
  /** Where it was before Hopper first moved it (Restore goes back there). */
  before: Rect | null;
  /** Whether the window gap applies (layouts yes; Center, moves and custom commands no). */
  gapped: boolean;
};

/** A nominal display in points, so gaps and Reasonable Size come out as Hopper's do. */
export const DISPLAY = { w: 1440, h: 860 };

const third = 1 / 3;
const fixed: Partial<Record<WindowCommandId, Rect>> = {
  maximize: { x: 0, y: 0, w: 1, h: 1 },
  "almost-maximize": { x: 0.05, y: 0.05, w: 0.9, h: 0.9 },
  "top-half": { x: 0, y: 0, w: 1, h: 0.5 },
  "bottom-half": { x: 0, y: 0.5, w: 1, h: 0.5 },
  "first-third": { x: 0, y: 0, w: third, h: 1 },
  "center-third": { x: third, y: 0, w: third, h: 1 },
  "last-third": { x: 2 * third, y: 0, w: third, h: 1 },
  "first-two-thirds": { x: 0, y: 0, w: 2 * third, h: 1 },
  "last-two-thirds": { x: third, y: 0, w: 2 * third, h: 1 },
  "first-fourth": { x: 0, y: 0, w: 0.25, h: 1 },
  "second-fourth": { x: 0.25, y: 0, w: 0.25, h: 1 },
  "third-fourth": { x: 0.5, y: 0, w: 0.25, h: 1 },
  "last-fourth": { x: 0.75, y: 0, w: 0.25, h: 1 },
  "top-left-quarter": { x: 0, y: 0, w: 0.5, h: 0.5 },
  "top-right-quarter": { x: 0.5, y: 0, w: 0.5, h: 0.5 },
  "bottom-left-quarter": { x: 0, y: 0.5, w: 0.5, h: 0.5 },
  "bottom-right-quarter": { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
  "top-left-sixth": { x: 0, y: 0, w: third, h: 0.5 },
  "top-center-sixth": { x: third, y: 0, w: third, h: 0.5 },
  "top-right-sixth": { x: 2 * third, y: 0, w: third, h: 0.5 },
  "bottom-left-sixth": { x: 0, y: 0.5, w: third, h: 0.5 },
  "bottom-center-sixth": { x: third, y: 0.5, w: third, h: 0.5 },
  "bottom-right-sixth": { x: 2 * third, y: 0.5, w: third, h: 0.5 },
};

/** Half widths by step: ½, then ⅔, then ⅓ (Repeat a Half's default). */
export const HALF_STEPS = [0.5, 2 / 3, 1 / 3];
export const HALF_LABELS = ["½", "⅔", "⅓"];

const isHalf = (c: WindowCommandId) => c === "left-half" || c === "right-half" || c === "top-half" || c === "bottom-half";

/** The rect a layout command puts a window in, at a step (only halves have steps). */
export function layoutRect(c: WindowCommandId, step = 0): Rect | null {
  const s = HALF_STEPS[step % 3];
  if (c === "left-half") return { x: 0, y: 0, w: s, h: 1 };
  if (c === "right-half") return { x: 1 - s, y: 0, w: s, h: 1 };
  if (c === "top-half") return { x: 0, y: 0, w: 1, h: s };
  if (c === "bottom-half") return { x: 0, y: 1 - s, w: 1, h: s };
  return fixed[c] ?? null;
}

export type Outcome = { state: WinState; label: string } | { message: string };

const clamp = (r: Rect): Rect => {
  const w = Math.min(r.w, 1), h = Math.min(r.h, 1);
  return { w, h, x: Math.min(Math.max(r.x, 0), 1 - w), y: Math.min(Math.max(r.y, 0), 1 - h) };
};

/** Runs a window command on a window. Commands this one-display demo can't show come back as a message. */
export function run(c: WindowCommandId, win: WinState): Outcome {
  const title = commandTitle(c);
  const remember = win.before ?? win.rect;
  const r = win.rect;

  if (c === "restore") {
    if (!win.before) return { message: "Nothing to restore" };
    return { state: { rect: win.before, layout: null, step: 0, before: null, gapped: false }, label: title };
  }

  const layout = layoutRect(c);
  if (layout) {
    const again = isHalf(c) && win.layout === c;
    const step = again ? (win.step + 1) % 3 : 0;
    return {
      state: { rect: layoutRect(c, step)!, layout: c, step, before: remember, gapped: true },
      label: isHalf(c) && again ? `${title}, ${HALF_LABELS[step]}` : title,
    };
  }

  const free = (rect: Rect): Outcome => ({ state: { rect: clamp(rect), layout: null, step: 0, before: remember, gapped: false }, label: title });
  switch (c) {
    case "reasonable-size": {
      const w = Math.min(0.6 * DISPLAY.w, 1025) / DISPLAY.w, h = Math.min(0.6 * DISPLAY.h, 900) / DISPLAY.h;
      return free({ x: (1 - w) / 2, y: (1 - h) / 2, w, h });
    }
    case "center":
      return free({ ...r, x: (1 - r.w) / 2, y: (1 - r.h) / 2 });
    case "maximize-height":
      return free({ ...r, y: 0, h: 1 });
    case "maximize-width":
      return free({ ...r, x: 0, w: 1 });
    case "move-up":
      return free({ ...r, y: 0 });
    case "move-down":
      return free({ ...r, y: 1 - r.h });
    case "move-left":
      return free({ ...r, x: 0 });
    case "move-right":
      return free({ ...r, x: 1 - r.w });
    case "previous-display":
    case "next-display":
      return { message: "There’s one display in this demo" };
    case "previous-space":
    case "next-space":
      return { message: "Desktops (Spaces) aren’t in this demo" };
    default:
      return { message: "Try this one on your Mac" };
  }
}

/** Gap insets in points for a rect: whole at the display's edges, half on inner edges. */
export function insets(r: Rect, gap: number) {
  const e = 0.001;
  return {
    l: r.x <= e ? gap : gap / 2,
    t: r.y <= e ? gap : gap / 2,
    r: r.x + r.w >= 1 - e ? gap : gap / 2,
    b: r.y + r.h >= 1 - e ? gap : gap / 2,
  };
}

/** Puts a window element where its state says (CSS does the math against the desk; see `.mw` in MacWindow). */
export function apply(el: HTMLElement, s: { rect: Rect; gapped: boolean }, gap: number) {
  const g = s.gapped ? insets(s.rect, gap) : { l: 0, t: 0, r: 0, b: 0 };
  const st = el.style;
  st.setProperty("--x", s.rect.x.toFixed(4));
  st.setProperty("--y", s.rect.y.toFixed(4));
  st.setProperty("--w", s.rect.w.toFixed(4));
  st.setProperty("--h", s.rect.h.toFixed(4));
  st.setProperty("--gl", String(g.l));
  st.setProperty("--gt", String(g.t));
  st.setProperty("--gr", String(g.r));
  st.setProperty("--gb", String(g.b));
}

export const commandTitle = (c: WindowCommandId) => windowCommands.find((w) => w.id === c)!.title;

export function commandSub(c: WindowCommandId): string {
  const cmd = windowCommands.find((w) => w.id === c)!;
  return "sub" in cmd ? cmd.sub : `Move the window to the ${cmd.title.toLowerCase()} of the display`;
}

/** A tiny picture of what a command does: the display, with where the window goes filled in. */
export function glyphSVG(c: WindowCommandId): string {
  const r = layoutRect(c);
  const box = (x: number, y: number, w: number, h: number) =>
    `<rect x="${(2 + x * 20).toFixed(2)}" y="${(2 + y * 14).toFixed(2)}" width="${(w * 20).toFixed(2)}" height="${(h * 14).toFixed(2)}" rx="1.2" class="g-fill"/>`;
  let inner = "";
  if (r) inner = box(r.x, r.y, r.w, r.h);
  else if (c === "almost-maximize") inner = box(0.08, 0.08, 0.84, 0.84);
  else if (c === "reasonable-size") inner = box(0.2, 0.2, 0.6, 0.6);
  else if (c === "center") inner = box(0.3, 0.25, 0.4, 0.5);
  else if (c === "maximize-height") inner = box(0.35, 0, 0.3, 1);
  else if (c === "maximize-width") inner = box(0, 0.32, 1, 0.36);
  else if (c === "move-up") inner = box(0.3, 0, 0.4, 0.5);
  else if (c === "move-down") inner = box(0.3, 0.5, 0.4, 0.5);
  else if (c === "move-left") inner = box(0, 0.25, 0.4, 0.5);
  else if (c === "move-right") inner = box(0.6, 0.25, 0.4, 0.5);
  else if (c === "restore") inner = `<path d="M15 12.5a5 5 0 1 0-5 -5" class="g-line"/><path d="M7.5 5l2.5 2.5-2.5 2.5" class="g-line"/>`;
  else if (c === "toggle-fullscreen") inner = `<path d="M5 8V5h3M19 12v3h-3M16 5h3v3M8 15H5v-3" class="g-line"/>`;
  else if (c.includes("display") || c.includes("space"))
    inner = `<path d="${c.startsWith("next") ? "M7 9h10m-3-3 3 3-3 3" : "M17 9H7m3-3-3 3 3 3"}" class="g-line"/>`;
  else if (c.startsWith("focus")) inner = `${box(0.1, 0.1, 0.55, 0.6)}<rect x="9" y="6" width="11" height="8.5" rx="1.2" class="g-back"/>`;
  else if (c === "minimize-on-display") inner = `<path d="M12 4v7m-3-3 3 3 3-3M7 14h10" class="g-line"/>`;
  return `<svg class="glyph" viewBox="0 0 24 18" aria-hidden="true"><rect x="0.75" y="0.75" width="22.5" height="16.5" rx="2.5" class="g-frame"/>${inner}</svg>`;
}

/** Word-start matching over a command's title and keywords, like Hopper's root search. */
export function matchCommands<T extends { title: string; words: string }>(items: T[], query: string): T[] {
  const words = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const q = words(query);
  if (!q.length) return items;
  const out: { it: T; s: number; i: number }[] = [];
  items.forEach((it, i) => {
    const title = words(it.title);
    const rest = words(it.words);
    let s = 0;
    for (const t of q) {
      if (title.some((w) => w.startsWith(t))) s += 10;
      else if (rest.some((w) => w.startsWith(t))) s += 3;
      else return;
    }
    out.push({ it, s, i });
  });
  return out.sort((a, b) => b.s - a.s || a.i - b.i).map((x) => x.it);
}
