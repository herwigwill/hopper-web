/**
 * A working Hopper search over the demo Mac (facts.ts places): type, arrow keys, Return "opens" the result.
 * Used by the hub's Search section and the Search page's hero. `onResults` hears every new result list.
 */
import { places, apps, type Place } from "../content/facts";
import { search, rowHTML, press } from "./launcher";

export function initSearchDemo(
  lx: HTMLElement,
  opts: { prefix: string; status?: HTMLElement; live: HTMLElement; onResults?: (results: Place[], query: string) => void },
) {
  const input = lx.querySelector<HTMLInputElement>(".lx-input")!;
  const text = lx.querySelector<HTMLElement>("[data-text]")!;
  const placeholder = lx.querySelector<HTMLElement>("[data-placeholder]")!;
  const list = lx.querySelector<HTMLElement>("[data-list]")!;
  const section = lx.querySelector<HTMLElement>("[data-section]")!;
  const enterKey = lx.querySelector<HTMLElement>("[data-enter]")!;
  let results = places.slice(0, 8);
  let selected = 0;

  const render = (q: string) => {
    results = search(places, q).slice(0, 8);
    selected = 0;
    text.textContent = q;
    placeholder.hidden = q.length > 0;
    section.textContent = q ? "Results" : "Recent";
    list.innerHTML = results.length
      ? results.map((p, i) => rowHTML(p, i === 0, opts.prefix)).join("")
      : `<li class="lx-empty" role="presentation">Nothing like that on this demo Mac. Try “slack”.</li>`;
    opts.onResults?.(results, q);
    sync();
  };
  const sync = () => {
    list.querySelectorAll(".lx-row").forEach((r, i) => r.setAttribute("aria-selected", String(i === selected)));
    if (results[selected]) input.setAttribute("aria-activedescendant", `${opts.prefix}-${results[selected].id}`);
    else input.removeAttribute("aria-activedescendant");
  };
  const open = () => {
    const p = results[selected];
    if (!p) return;
    press(enterKey);
    const msg = `Opened ${p.title} in ${apps[p.app].name}.`;
    if (opts.status) opts.status.textContent = `↵ ${msg}`;
    opts.live.textContent = msg;
    list.querySelector<HTMLElement>(`[data-id="${p.id}"]`)?.animate([{ transform: "none" }, { transform: "translateX(6px)" }, { transform: "none" }], { duration: 260, easing: "ease-out" });
  };

  input.addEventListener("input", () => render(input.value));
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!results.length) return;
      selected = (selected + (e.key === "ArrowDown" ? 1 : -1) + results.length) % results.length;
      sync();
    } else if (e.key === "Enter") {
      e.preventDefault();
      open();
    } else if (e.key === "Escape") {
      input.value = "";
      render("");
    }
  });
  lx.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    input.focus({ preventScroll: true });
    const row = (e.target as Element).closest<HTMLElement>(".lx-row");
    if (row) {
      selected = results.findIndex((p) => p.id === row.dataset.id);
      sync();
      open();
    }
  });
}
