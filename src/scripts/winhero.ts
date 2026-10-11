/**
 * The Windows page hero: a launcher listing Hopper's window commands, and a display whose front window they move.
 * Autoplays a short script (types a command, runs it, picks another window…) until the visitor touches anything;
 * pauses off-screen, in background tabs and with the Pause button; never autoplays under reduced motion.
 */
import { apps, windowCommands, windowKeywords, type WindowCommandId } from "../content/facts";
import { wait, reducedMotion, press, escape } from "./launcher";
import { check, radioKeys } from "./controls";
import { run, apply, glyphSVG, commandSub, matchCommands, type WinState } from "./windows";

type App = "notion" | "slack" | "chrome";
type Item = { id: WindowCommandId; title: string; words: string };

const items: Item[] = windowCommands.map((c) => ({
  id: c.id,
  title: c.title,
  words: `window snap tile ${windowKeywords[c.id] ?? ""}`,
}));

const script: ({ front: App; q: string } | { gap: number })[] = [
  { front: "notion", q: "left half" },
  { front: "chrome", q: "top right" },
  { front: "slack", q: "bottom right" },
  { gap: 16 },
  { front: "chrome", q: "max" },
  { front: "chrome", q: "restore" },
  { front: "notion", q: "first third" },
];

export function initWindowsHero(root: HTMLElement) {
  const lx = root.querySelector<HTMLElement>("[data-launcher]")!;
  const input = lx.querySelector<HTMLInputElement>(".lx-input")!;
  const text = lx.querySelector<HTMLElement>("[data-text]")!;
  const placeholder = lx.querySelector<HTMLElement>("[data-placeholder]")!;
  const list = lx.querySelector<HTMLElement>("[data-list]")!;
  const section = lx.querySelector<HTMLElement>("[data-section]")!;
  const target = lx.querySelector<HTMLElement>("[data-target]")!;
  const enterKey = lx.querySelector<HTMLElement>("[data-enter]")!;
  const hud = root.querySelector<HTMLElement>("[data-hud]")!;
  const menubarApp = root.querySelector<HTMLElement>("[data-menubar-app]")!;
  const live = root.querySelector<HTMLElement>("[data-wh-live]")!;
  const pauseBtn = root.querySelector<HTMLButtonElement>("[data-pause]")!;
  const frontBtns = [...root.querySelectorAll<HTMLButtonElement>("[data-front]")];
  const gapBtns = [...root.querySelectorAll<HTMLButtonElement>("[data-gap]")];
  const stage = root.querySelector<HTMLElement>("[data-stage]")!;

  const wins = new Map<App, { el: HTMLElement; state: WinState; initial: WinState }>();
  root.querySelectorAll<HTMLElement>("[data-win]").forEach((el) => {
    const s = el.style;
    const rect = { x: +s.getPropertyValue("--x"), y: +s.getPropertyValue("--y"), w: +s.getPropertyValue("--w"), h: +s.getPropertyValue("--h") };
    const state: WinState = { rect, layout: null, step: 0, before: null, gapped: false };
    wins.set(el.dataset.win as App, { el, state, initial: { ...state } });
  });

  let order: App[] = ["notion", "slack", "chrome"];
  let front: App = "chrome";
  let gap = 0;
  let results: Item[] = items;
  let selected = 0;
  let mode: "auto" | "user" = reducedMotion() ? "user" : "auto";
  let paused = reducedMotion();
  let visible = false;
  let playing: AbortController | null = null;

  /* The window in front. */
  const setFront = (app: App) => {
    front = app;
    order = [...order.filter((a) => a !== app), app];
    wins.forEach((w, a) => {
      w.el.style.setProperty("--z", String(order.indexOf(a) + 1));
      w.el.classList.toggle("is-front", a === app);
    });
    menubarApp.textContent = apps[app].short;
    target.innerHTML = `Moves <b>${apps[app].short}</b>`;
    check(frontBtns, (b) => b.dataset.front === app);
  };

  const setGap = (g: number) => {
    gap = g;
    check(gapBtns, (b) => Number(b.dataset.gap) === g);
    wins.forEach((w) => apply(w.el, w.state, gap));
  };

  const showHud = (msg: string) => {
    hud.hidden = false;
    hud.textContent = msg;
    hud.style.animation = "none";
    void hud.offsetWidth;
    hud.style.animation = "";
  };

  /* The list. */
  const render = (query: string) => {
    results = matchCommands(items, query);
    selected = 0;
    text.textContent = query;
    placeholder.hidden = query.length > 0;
    section.textContent = query ? "Results" : "Window Management";
    list.innerHTML = results.length
      ? results
          .map(
            (c, i) => `<li class="lx-row" role="option" id="wh-${c.id}" data-id="${c.id}" aria-selected="${i === 0}">
              <span class="lx-ico">${glyphSVG(c.id)}</span>
              <span class="lx-title">${escape(c.title)}</span>
              <span class="lx-sub">${escape(commandSub(c.id))}</span>
            </li>`,
          )
          .join("")
      : `<li class="lx-empty" role="presentation">No window command matches. Try “half” or “third”.</li>`;
    list.scrollTop = 0;
    sync();
  };
  const sync = () => {
    const rows = [...list.querySelectorAll<HTMLElement>(".lx-row")];
    rows.forEach((r, i) => r.setAttribute("aria-selected", String(i === selected)));
    const row = rows[selected];
    if (row) {
      input.setAttribute("aria-activedescendant", row.id);
      // Keep the selected row in view by scrolling the list only (never the page).
      if (row.offsetTop < list.scrollTop) list.scrollTop = row.offsetTop - 6;
      else if (row.offsetTop + row.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = row.offsetTop + row.offsetHeight - list.clientHeight + 6;
    } else input.removeAttribute("aria-activedescendant");
  };

  /* Running a command on the window in front. */
  const perform = (id: WindowCommandId) => {
    press(enterKey);
    const w = wins.get(front)!;
    if (id === "minimize-on-display") {
      wins.forEach((x) => x.el.classList.add("is-min"));
      showHud("Minimized 3 windows. Pick one to bring it back.");
      live.textContent = "Minimized every window on the display.";
      return;
    }
    if (id === "focus-next-window" || id === "focus-previous-window") {
      showHud("The app has no other window here");
      live.textContent = "The app has no other window here.";
      return;
    }
    if (w.el.classList.contains("is-min")) w.el.classList.remove("is-min");
    const out = run(id, w.state);
    if ("message" in out) {
      showHud(out.message);
      live.textContent = out.message + ".";
      return;
    }
    w.state = out.state;
    apply(w.el, w.state, gap);
    live.textContent = `${out.label}: ${apps[front].name}.`;
  };

  const choose = () => {
    const c = results[selected];
    if (c) perform(c.id);
  };

  /* The visitor takes over. */
  const takeOver = () => {
    if (mode === "user" && paused) return;
    mode = "user";
    stop();
    setPaused(true);
  };
  const setPaused = (p: boolean) => {
    paused = p;
    pauseBtn.setAttribute("aria-pressed", String(p));
    pauseBtn.setAttribute("aria-label", p ? "Play demo" : "Pause demo");
    pauseBtn.querySelector<HTMLElement>("[data-icon-pause]")!.hidden = p;
    pauseBtn.querySelector<HTMLElement>("[data-icon-play]")!.hidden = !p;
  };

  input.addEventListener("focus", takeOver);
  input.addEventListener("input", () => render(input.value));
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!results.length) return;
      selected = (selected + (e.key === "ArrowDown" ? 1 : -1) + results.length) % results.length;
      sync();
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose();
    } else if (e.key === "Escape") {
      input.value = "";
      render("");
    }
  });
  lx.addEventListener("pointerdown", (e) => {
    takeOver();
    const row = (e.target as Element).closest<HTMLElement>(".lx-row");
    if (row) {
      e.preventDefault();
      input.focus({ preventScroll: true });
      selected = results.findIndex((c) => c.id === row.dataset.id);
      sync();
      choose();
    } else if ((e.target as Element).closest(".lx-field")) {
      e.preventDefault();
      input.focus({ preventScroll: true });
    }
  });
  wins.forEach((w, app) =>
    w.el.addEventListener("pointerdown", () => {
      takeOver();
      w.el.classList.remove("is-min");
      setFront(app);
    }),
  );
  frontBtns.forEach((b) =>
    b.addEventListener("click", () => {
      takeOver();
      const app = b.dataset.front as App;
      wins.get(app)!.el.classList.remove("is-min");
      setFront(app);
      live.textContent = `${apps[app].name} is in front.`;
    }),
  );
  gapBtns.forEach((b) =>
    b.addEventListener("click", () => {
      takeOver();
      setGap(Number(b.dataset.gap));
    }),
  );
  root.querySelector<HTMLElement>("[data-front-group]")!.addEventListener("keydown", (e) => radioKeys(e, frontBtns));
  root.querySelector<HTMLElement>("[data-gap-group]")!.addEventListener("keydown", (e) => radioKeys(e, gapBtns));
  pauseBtn.addEventListener("click", () => {
    if (paused) {
      mode = "auto";
      setPaused(false);
      start();
    } else takeOver();
  });

  /* Autoplay. */
  const reset = () => {
    wins.forEach((w) => {
      w.state = { ...w.initial };
      w.el.classList.remove("is-min");
    });
    setGap(0);
    setFront("chrome");
    input.value = "";
    render("");
  };
  const type = async (q: string, signal: AbortSignal) => {
    lx.dataset.typing = "";
    for (let i = 1; i <= q.length; i++) {
      input.value = q.slice(0, i);
      render(input.value);
      await wait(55 + Math.random() * 45, signal);
    }
    delete lx.dataset.typing;
  };
  const play = async (signal: AbortSignal) => {
    reset();
    await wait(900, signal);
    for (;;) {
      for (const step of script) {
        if ("gap" in step) {
          press(gapBtns.find((b) => Number(b.dataset.gap) === step.gap) ?? null, 220);
          setGap(step.gap);
          live.textContent = `Window gap set to ${step.gap} points.`;
          await wait(1100, signal);
          continue;
        }
        if (step.front !== front) {
          setFront(step.front);
          await wait(550, signal);
        }
        input.value = "";
        render("");
        await wait(250, signal);
        await type(step.q, signal);
        await wait(550, signal);
        choose();
        await wait(1300, signal);
      }
      await wait(1600, signal);
      reset();
      await wait(1200, signal);
    }
  };
  const start = () => {
    stop();
    if (!visible || paused || mode !== "auto" || document.hidden) return;
    playing = new AbortController();
    play(playing.signal).catch(() => {});
  };
  const stop = () => {
    playing?.abort();
    playing = null;
    delete lx.dataset.typing;
  };
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) start();
    else stop();
  }, { threshold: 0.35 }).observe(stage);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

  render("");
  setFront("chrome");
  setPaused(paused);
}
