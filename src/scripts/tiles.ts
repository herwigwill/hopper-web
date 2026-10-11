/** The Toolkit tiles on /features: each a small working version of the feature it names. */
import { escape } from "./launcher";

export function initTiles(root: HTMLElement) {
  snippets(root);
  clipboard(root);
  calculator(root);
  emoji(root);
  menus(root);
  screenshots(root);
  quicklinks(root);
  notes(root);
}

const $ = <T extends Element = HTMLElement>(root: ParentNode, sel: string) => root.querySelector<T>(sel)!;

/* Snippets (ADR-054): a keyword at a word's start is replaced as soon as it's typed ("Immediately"). */
function snippets(root: HTMLElement) {
  const area = $<HTMLTextAreaElement>(root, "[data-sn]");
  const out = $(root, "[data-sn-out]");
  const expand: Record<string, { name: string; text: () => string }> = {
    ";date": { name: "Today’s Date", text: () => new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) },
    ";shrug": { name: "Shrug", text: () => "¯\\_(ツ)_/¯" },
  };
  area.addEventListener("input", () => {
    const caret = area.selectionStart;
    const before = area.value.slice(0, caret);
    for (const [kw, s] of Object.entries(expand)) {
      if (!before.endsWith(kw)) continue;
      const start = caret - kw.length;
      if (start > 0 && !/\s/.test(before[start - 1])) continue; // at a word's start only
      const text = s.text();
      area.value = area.value.slice(0, start) + text + area.value.slice(caret);
      area.selectionStart = area.selectionEnd = start + text.length;
      out.textContent = `${kw} became ${s.name}.`;
      area.animate([{ backgroundColor: "#fff4cc" }, { backgroundColor: "#fff" }], { duration: 600 });
      return;
    }
  });
}

/* Clipboard History (ADR-027): newest first; picking one pastes it. */
function clipboard(root: HTMLElement) {
  const hist = $(root, "[data-hist]");
  const out = $(root, "[data-cb-out]");
  const items: { text: string; at: number }[] = [];
  const render = (fresh: boolean) => {
    hist.innerHTML = items
      .map((it, i) => `<li class="${i === 0 && fresh ? "fresh" : ""}"><button type="button" data-i="${i}"><span>${escape(it.text)}</span><small>${ago(it.at)}</small></button></li>`)
      .join("");
  };
  const ago = (t: number) => {
    const s = Math.round((Date.now() - t) / 1000);
    return s < 5 ? "Just now" : s < 60 ? `${s} s ago` : `${Math.round(s / 60)} min ago`;
  };
  root.querySelectorAll<HTMLButtonElement>("[data-copy]").forEach((b) =>
    b.addEventListener("click", () => {
      const text = b.dataset.copy!;
      const had = items.findIndex((x) => x.text === text);
      if (had >= 0) items.splice(had, 1);
      items.unshift({ text, at: Date.now() });
      items.splice(6);
      render(true);
      out.textContent = `Copied “${text}”.`;
    }),
  );
  hist.addEventListener("click", (e) => {
    const b = (e.target as Element).closest<HTMLButtonElement>("button[data-i]");
    if (!b) return;
    const it = items[Number(b.dataset.i)];
    out.textContent = `Pasted “${it.text}” into the app you were in.`;
  });
  setInterval(() => items.length && render(false), 15000);
}

/* Calculator: sums with + − × ÷ ^ and parentheses, and unit conversions ("5 km in mi"). No eval. */
const UNITS: Record<string, { k: number; dim: string; label: string }> = {};
const unit = (names: string[], k: number, dim: string) => names.forEach((n) => (UNITS[n] = { k, dim, label: names[0] }));
unit(["mm", "millimeter", "millimeters"], 0.001, "len");
unit(["cm", "centimeter", "centimeters"], 0.01, "len");
unit(["m", "meter", "meters", "metre", "metres"], 1, "len");
unit(["km", "kilometer", "kilometers", "kilometre", "kilometres"], 1000, "len");
unit(["in", "inch", "inches"], 0.0254, "len");
unit(["ft", "foot", "feet"], 0.3048, "len");
unit(["yd", "yard", "yards"], 0.9144, "len");
unit(["mi", "mile", "miles"], 1609.344, "len");
unit(["g", "gram", "grams"], 0.001, "mass");
unit(["kg", "kilo", "kilos", "kilogram", "kilograms"], 1, "mass");
unit(["oz", "ounce", "ounces"], 0.0283495, "mass");
unit(["lb", "lbs", "pound", "pounds"], 0.453592, "mass");
unit(["ml", "milliliter", "milliliters"], 0.001, "vol");
unit(["l", "liter", "liters", "litre", "litres"], 1, "vol");
unit(["cup", "cups"], 0.236588, "vol");
unit(["gal", "gallon", "gallons"], 3.78541, "vol");
unit(["s", "sec", "second", "seconds"], 1, "time");
unit(["min", "minute", "minutes"], 60, "time");
unit(["h", "hr", "hour", "hours"], 3600, "time");
unit(["day", "days"], 86400, "time");
unit(["c", "°c", "celsius"], 1, "temp");
unit(["f", "°f", "fahrenheit"], 1, "temp");

export function evaluate(src: string): number | null {
  const s = src.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/,/g, "");
  let i = 0;
  const peek = () => s[i];
  const skip = () => {
    while (s[i] === " ") i++;
  };
  const num = (): number | null => {
    skip();
    if (peek() === "(") {
      i++;
      const v = expr();
      skip();
      if (peek() !== ")") return null;
      i++;
      return v;
    }
    if (peek() === "-") {
      i++;
      const v = num();
      return v === null ? null : -v;
    }
    const m = /^\d*\.?\d+(e[+-]?\d+)?/i.exec(s.slice(i));
    if (!m) return null;
    i += m[0].length;
    return Number(m[0]);
  };
  const pow = (): number | null => {
    const b = num();
    skip();
    if (b !== null && peek() === "^") {
      i++;
      const e = pow();
      return e === null ? null : b ** e;
    }
    return b;
  };
  const term = (): number | null => {
    let v = pow();
    for (;;) {
      skip();
      const op = peek();
      if (v === null || (op !== "*" && op !== "/" && op !== "%")) return v;
      i++;
      const r = pow();
      if (r === null) return null;
      v = op === "*" ? v * r : op === "/" ? v / r : v % r;
    }
  };
  const expr = (): number | null => {
    let v = term();
    for (;;) {
      skip();
      const op = peek();
      if (v === null || (op !== "+" && op !== "-")) return v;
      i++;
      const r = term();
      if (r === null) return null;
      v = op === "+" ? v + r : v - r;
    }
  };
  const v = expr();
  skip();
  return v !== null && i === s.length && Number.isFinite(v) ? v : null;
}

const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: Math.abs(n) < 1 ? 6 : 4 });

export function calculate(q: string): string | null {
  const t = q.trim().toLowerCase();
  if (!t) return null;
  const conv = /^(.+?)\s*([a-z°]+)\s+(?:in|to|as)\s+([a-z°]+)$/.exec(t);
  if (conv) {
    const v = evaluate(conv[1]);
    const a = UNITS[conv[2]], b = UNITS[conv[3]];
    if (v === null || !a || !b || a.dim !== b.dim) return null;
    if (a.dim === "temp") {
      const c = a.label === "c" ? v : ((v - 32) * 5) / 9;
      const r = b.label === "c" ? c : (c * 9) / 5 + 32;
      return `${fmt(r)} °${b.label.toUpperCase()}`;
    }
    return `${fmt((v * a.k) / b.k)} ${b.label}`;
  }
  if (!/[+\-*/×÷^%()]/.test(t)) return null;
  const v = evaluate(t);
  return v === null ? null : fmt(v);
}

function calculator(root: HTMLElement) {
  const input = $<HTMLInputElement>(root, "[data-calc]");
  const out = $(root, "[data-calc-out]");
  const run = () => {
    const r = calculate(input.value);
    if (r) out.textContent = r;
    else out.innerHTML = `<span class="muted">${input.value.trim() ? "Keep typing…" : "Type a sum"}</span>`;
  };
  input.addEventListener("input", run);
  run();
}

/* Emoji & Symbols (ADR-051): word-start search over names and keywords; Return/click pastes. */
const EMOJI: [string, string][] = [
  ["🫡", "saluting face salute respect yes sir"],
  ["🖖", "vulcan salute spock star trek"],
  ["👍", "thumbs up yes ok like approve"],
  ["👀", "eyes look watching"],
  ["🎉", "party popper celebrate tada congrats"],
  ["✨", "sparkles shiny magic new"],
  ["🔥", "fire hot lit"],
  ["❤️", "red heart love"],
  ["😂", "face with tears of joy laugh lol"],
  ["🙏", "folded hands please thanks pray"],
  ["🚀", "rocket launch ship fast"],
  ["✅", "check mark button done yes complete"],
  ["❌", "cross mark no wrong cancel"],
  ["⚠️", "warning caution alert"],
  ["💡", "light bulb idea"],
  ["🐛", "bug insect"],
  ["🧠", "brain think smart"],
  ["☕", "hot beverage coffee tea"],
  ["🍕", "pizza food"],
  ["🤔", "thinking face hmm think"],
  ["😅", "grinning face with sweat phew nervous"],
  ["🙌", "raising hands hooray yay"],
  ["👋", "waving hand hi hello bye wave"],
  ["💯", "hundred points 100 perfect"],
  ["📌", "pushpin pin"],
  ["📎", "paperclip attach"],
  ["📅", "calendar date"],
  ["⏰", "alarm clock time wake"],
  ["🌴", "palm tree vacation holiday"],
  ["✈️", "airplane travel flight"],
  ["🎯", "direct hit target goal"],
  ["🛠️", "hammer and wrench tools fix"],
  ["📈", "chart increasing growth up"],
  ["🤝", "handshake deal agree"],
  ["😎", "smiling face with sunglasses cool"],
  ["🥳", "partying face party birthday"],
  ["💬", "speech balloon chat comment"],
  ["🔒", "locked lock secure private"],
  ["⭐", "star favorite"],
  ["🚢", "ship boat"],
  ["→", "rightwards arrow right"],
  ["⌘", "place of interest sign command cmd"],
  ["⌥", "option key alt"],
  ["✓", "check mark tick"],
  ["°", "degree sign"],
  ["€", "euro sign currency"],
  ["™", "trade mark sign"],
  ["©", "copyright sign"],
];

function emoji(root: HTMLElement) {
  const input = $<HTMLInputElement>(root, "[data-em]");
  const grid = $(root, "[data-em-grid]");
  const section = $(root, "[data-em-section]");
  const out = $(root, "[data-em-out]");
  const name = (e: string) => EMOJI.find((x) => x[0] === e)![1].split(" ").slice(0, 3).join(" ");
  const render = () => {
    const q = input.value.toLowerCase().split(/\s+/).filter(Boolean);
    const hits = q.length ? EMOJI.filter(([, words]) => q.every((t) => words.split(" ").some((w) => w.startsWith(t)))) : EMOJI.slice(0, 12);
    section.textContent = q.length ? "Results" : "Frequently Used";
    grid.innerHTML = hits.length
      ? hits.slice(0, 12).map(([e]) => `<button type="button" data-e="${e}" aria-label="${escape(name(e))}">${e}</button>`).join("")
      : `<p class="none">No emoji for that. Try “ship” or “coffee”.</p>`;
  };
  input.addEventListener("input", render);
  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const first = grid.querySelector<HTMLButtonElement>("[data-e]");
    if (first) first.click();
  });
  grid.addEventListener("click", (e) => {
    const b = (e.target as Element).closest<HTMLButtonElement>("[data-e]");
    if (!b) return;
    out.textContent = `Pasted ${b.dataset.e} into the app you were in.`;
    b.animate([{ transform: "scale(1)" }, { transform: "scale(1.4)" }, { transform: "scale(1)" }], { duration: 320, easing: "ease-out" });
  });
  render();
}

/* Menu Commands (ADR-050): the front app's menu items, by title; a command that flips is found by either title. */
const MENU: { path: string; title: string; alt?: string; kb: string }[] = [
  { path: "View", title: "Show Sidebar", alt: "Hide Sidebar", kb: "⇧⌘L" },
  { path: "History", title: "Reopen Last Closed Tab", kb: "⇧⌘T" },
  { path: "File", title: "New Private Window", kb: "⇧⌘N" },
  { path: "View", title: "Show Reader", alt: "Hide Reader", kb: "⇧⌘R" },
  { path: "View", title: "Show Tab Overview", kb: "⇧⌘\\" },
  { path: "Bookmarks", title: "Add Bookmark…", kb: "⌘D" },
  { path: "History", title: "Show All History", kb: "⌘Y" },
  { path: "View", title: "Zoom In", kb: "⌘+" },
  { path: "View", title: "Zoom Out", kb: "⌘−" },
  { path: "File", title: "New Tab", kb: "⌘T" },
  { path: "Edit", title: "Find…", kb: "⌘F" },
  { path: "Window", title: "Minimize", kb: "⌘M" },
];

function menus(root: HTMLElement) {
  const input = $<HTMLInputElement>(root, "[data-mn]");
  const list = $(root, "[data-mn-list]");
  const out = $(root, "[data-mn-out]");
  let shown: { item: (typeof MENU)[number]; as: string }[] = [];
  const render = () => {
    const q = input.value.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    const words = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    shown = [];
    for (const item of MENU) {
      for (const title of [item.title, item.alt, item.alt && `Toggle ${item.title.replace(/^Show /, "")}`].filter(Boolean) as string[]) {
        const w = words(title);
        if (!q.length || q.every((t) => w.some((x) => x.startsWith(t)))) {
          shown.push({ item, as: title });
          break;
        }
      }
    }
    shown = shown.slice(0, 4);
    list.innerHTML = shown.length
      ? shown.map((s, i) => `<li><button type="button" data-i="${i}"><span>${escape(s.as)}</span><span class="path">${escape(s.item.path)}</span><span class="kb">${escape(s.item.kb)}</span></button></li>`).join("")
      : `<li class="none">No menu command like that in Safari.</li>`;
  };
  const choose = (i: number) => {
    const s = shown[i];
    if (s) out.textContent = `Chose ${s.item.path} ▸ ${s.as === s.item.alt ? s.item.alt : s.item.title} in Safari.`;
  };
  input.addEventListener("input", render);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") choose(0);
  });
  list.addEventListener("click", (e) => {
    const b = (e.target as Element).closest<HTMLButtonElement>("button[data-i]");
    if (b) choose(Number(b.dataset.i));
  });
  render();
}

/* Screenshots (ADR-028): text read on-device; search finds a screenshot by any word in it. */
function screenshots(root: HTMLElement) {
  const input = $<HTMLInputElement>(root, "[data-ss]");
  const shots = $(root, "[data-shots]");
  const out = $(root, "[data-ss-out]");
  const cards = [...shots.querySelectorAll<HTMLElement>(".shot")];
  const originals = cards.map((c) => [...c.querySelectorAll<HTMLElement>(".shot-img p")].map((p) => p.textContent ?? ""));
  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    let hits = 0;
    cards.forEach((c, k) => {
      const ps = [...c.querySelectorAll<HTMLElement>(".shot-img p")];
      let hit = false;
      ps.forEach((p, j) => {
        const text = originals[k][j];
        if (!q) return void (p.textContent = text);
        const re = new RegExp(`\\b(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
        if (re.test(text)) hit = true;
        p.innerHTML = escape(text).replace(re, "<mark>$1</mark>");
      });
      c.classList.toggle("hit", hit);
      if (hit) hits++;
    });
    shots.classList.toggle("filtering", q.length > 0);
    out.textContent = q ? (hits ? `${hits} screenshot${hits > 1 ? "s" : ""} with “${input.value.trim()}” in ${hits > 1 ? "them" : "it"}.` : "No screenshot says that.") : "";
  });
}

/* Quicklinks (ADR-037): a link with a blank; what you type fills it in, encoded. */
function quicklinks(root: HTMLElement) {
  const input = $<HTMLInputElement>(root, "[data-ql]");
  const out = $(root, "[data-ql-out]");
  const render = () => (out.textContent = `github.com/search?q=${encodeURIComponent(input.value.trim()).replace(/%20/g, "+")}`);
  input.addEventListener("input", render);
  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    out.classList.remove("flash");
    void out.offsetWidth;
    out.classList.add("flash");
  });
  render();
}

/* Scratch Notes (ADR-059): Markdown marks turn into what they mean as you type them. */
function notes(root: HTMLElement) {
  const input = $<HTMLInputElement>(root, "[data-nt]");
  const note = $(root, "[data-note]");
  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const raw = input.value;
    if (!raw.trim()) return;
    let el: HTMLElement;
    const m = /^(#{1,3} |- |\* |\[\s?\] |\[x\] )?(.*)$/i.exec(raw)!;
    const mark = (m[1] ?? "").toLowerCase();
    const text = m[2];
    if (mark.startsWith("#")) {
      el = document.createElement("h4");
      el.textContent = text;
    } else if (mark === "- " || mark === "* ") {
      const last = note.lastElementChild;
      const ul = last?.tagName === "UL" ? (last as HTMLElement) : note.appendChild(document.createElement("ul"));
      el = document.createElement("li");
      el.textContent = text;
      ul.appendChild(el);
      el.classList.add("fresh");
      input.value = "";
      note.scrollTop = note.scrollHeight;
      return;
    } else if (mark.startsWith("[")) {
      el = document.createElement("label");
      el.className = "task";
      const box = document.createElement("input");
      box.type = "checkbox";
      box.checked = mark.startsWith("[x");
      el.append(box, " ", text);
    } else {
      el = document.createElement("p");
      el.textContent = text;
    }
    el.classList.add("fresh");
    note.appendChild(el);
    input.value = "";
    note.scrollTop = note.scrollHeight;
  });
}
