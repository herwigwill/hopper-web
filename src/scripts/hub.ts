/**
 * The features hub: a launcher over the features themselves. Return on a feature hops to its section (an in-page hop:
 * scroll, then the section lands) or to its page (the page-to-page hop, a cross-document view transition).
 * It types a few searches on its own until the visitor touches it; never under reduced motion.
 */
import { wait, reducedMotion, press, escape } from "./launcher";
import { featureIcons } from "./icons";
import { matchCommands } from "./windows";

type Item = { id: string; title: string; sub: string; href: string; page: boolean };

/** Scrolls to an in-page target, then plays the landing hop on it. Back returns to where you were. */
export function hopTo(target: HTMLElement, hash: string) {
  const smooth = !reducedMotion();
  history.pushState(null, "", hash);
  target.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
  const land = () => {
    target.classList.remove("hop-land");
    void target.offsetWidth;
    target.classList.add("hop-land");
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  };
  if (!smooth) return land();
  let done = false;
  const once = () => {
    if (done) return;
    done = true;
    land();
  };
  window.addEventListener("scrollend", once, { once: true });
  setTimeout(once, 900);
}

/** Hash links on the page hop instead of jumping. */
export function wireHopLinks(scope: ParentNode = document) {
  scope.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.getElementById(a.hash.slice(1));
      if (!target) return;
      e.preventDefault();
      hopTo(target, a.hash);
    });
  });
}

export function initHubLauncher(root: HTMLElement) {
  const lx = root.querySelector<HTMLElement>("[data-launcher]")!;
  const items: Item[] = JSON.parse(lx.dataset.items!);
  const input = lx.querySelector<HTMLInputElement>(".lx-input")!;
  const text = lx.querySelector<HTMLElement>("[data-text]")!;
  const placeholder = lx.querySelector<HTMLElement>("[data-placeholder]")!;
  const list = lx.querySelector<HTMLElement>("[data-list]")!;
  const section = lx.querySelector<HTMLElement>("[data-section]")!;
  const primary = lx.querySelector<HTMLElement>("[data-primary]")!;
  const enterKey = lx.querySelector<HTMLElement>("[data-enter]")!;
  const searchable = items.map((it) => ({ ...it, words: it.sub }));
  let results = searchable;
  let selected = 0;
  let auto: AbortController | null = null;

  const render = (q: string) => {
    results = matchCommands(searchable, q);
    selected = 0;
    text.textContent = q;
    placeholder.hidden = q.length > 0;
    section.textContent = q ? "Results" : "All Features";
    list.innerHTML = results.length
      ? results
          .map(
            (it, i) => `<li class="lx-row" role="option" id="hh-${it.id}" data-id="${it.id}" aria-selected="${i === 0}">
              <span class="lx-ico">${featureIcons[it.id] ?? ""}</span>
              <span class="lx-title">${escape(it.title)}</span>
              <span class="lx-sub">${escape(it.sub)}</span>
              <span class="lx-acc"><span>${it.page ? "Page" : "Section"}</span></span>
            </li>`,
          )
          .join("")
      : `<li class="lx-empty" role="presentation">No feature by that name. Try “clipboard” or “agents”.</li>`;
    list.scrollTop = 0;
    sync();
  };
  const sync = () => {
    const rows = [...list.querySelectorAll<HTMLElement>(".lx-row")];
    rows.forEach((r, i) => r.setAttribute("aria-selected", String(i === selected)));
    const row = rows[selected];
    if (row) {
      input.setAttribute("aria-activedescendant", row.id);
      if (row.offsetTop < list.scrollTop) list.scrollTop = row.offsetTop - 6;
      else if (row.offsetTop + row.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = row.offsetTop + row.offsetHeight - list.clientHeight + 6;
    } else input.removeAttribute("aria-activedescendant");
    primary.textContent = results[selected]?.page ? "Open Page" : "Go to Section";
  };

  const go = () => {
    const it = results[selected];
    if (!it) return;
    press(enterKey);
    if (it.page) {
      // A real navigation: the browser plays the page hop (global.css @view-transition).
      setTimeout(() => (location.href = it.href), 120);
      return;
    }
    const target = document.getElementById(it.href.slice(1));
    if (target) setTimeout(() => hopTo(target, it.href), 120);
  };

  const stopAuto = () => {
    auto?.abort();
    auto = null;
    delete lx.dataset.typing;
  };
  input.addEventListener("focus", stopAuto);
  input.addEventListener("input", () => render(input.value));
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!results.length) return;
      selected = (selected + (e.key === "ArrowDown" ? 1 : -1) + results.length) % results.length;
      sync();
    } else if (e.key === "Enter") {
      e.preventDefault();
      go();
    } else if (e.key === "Escape") {
      input.value = "";
      render("");
    }
  });
  lx.addEventListener("pointerdown", (e) => {
    stopAuto();
    const row = (e.target as Element).closest<HTMLElement>(".lx-row");
    e.preventDefault();
    input.focus({ preventScroll: true });
    if (row) {
      selected = results.findIndex((r) => r.id === row.dataset.id);
      sync();
      go();
    }
  });

  wireHopLinks(root);

  // A few searches on its own, then it waits with the list showing everything.
  if (!reducedMotion()) {
    const play = async (signal: AbortSignal) => {
      await wait(1200, signal);
      for (const q of ["windows", "clip", "agents"]) {
        lx.dataset.typing = "";
        for (let i = 1; i <= q.length; i++) {
          input.value = q.slice(0, i);
          render(input.value);
          await wait(80 + Math.random() * 50, signal);
        }
        delete lx.dataset.typing;
        await wait(1500, signal);
        input.value = "";
        render("");
        await wait(500, signal);
      }
    };
    let started = false;
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) {
        started = true;
        auto = new AbortController();
        play(auto.signal).catch(() => {});
      } else if (!e.isIntersecting) stopAuto();
    }, { threshold: 0.5 }).observe(lx);
  }
}
