/**
 * The hero demo: the launcher types a few searches on its own and hops to each result. Clicking the search field
 * hands it to the visitor. Pauses off-screen, in background tabs, with the Pause button, and never autoplays under
 * reduced motion.
 */
import { places, heroScript, apps, type Place } from "../content/facts";
import { search, rowHTML, wait, reducedMotion, press } from "./launcher";

type WinId = "notion" | "chrome" | "claude" | "slack" | "other";

export function initHero(stage: HTMLElement) {
  const canvas = stage.querySelector<HTMLElement>("[data-canvas]")!;
  const lx = stage.querySelector<HTMLElement>("[data-launcher]")!;
  const input = lx.querySelector<HTMLInputElement>(".lx-input")!;
  const text = lx.querySelector<HTMLElement>("[data-text]")!;
  const placeholder = lx.querySelector<HTMLElement>("[data-placeholder]")!;
  const list = lx.querySelector<HTMLElement>("[data-list]")!;
  const section = lx.querySelector<HTMLElement>("[data-section]")!;
  const enterKey = lx.querySelector<HTMLElement>("[data-enter]")!;
  const arc = stage.querySelector<SVGSVGElement>("[data-arc]")!;
  const arcPath = arc.querySelector("path")!;
  const arcDot = arc.querySelector("circle")!;
  const menubarApp = stage.querySelector<HTMLElement>("[data-menubar-app]")!;
  const reopen = stage.querySelector<HTMLButtonElement>("[data-reopen]")!;
  const pauseBtn = document.querySelector<HTMLButtonElement>("[data-pause]")!;
  const live = document.querySelector<HTMLElement>("[data-hero-live]")!;
  const wins = new Map<WinId, HTMLElement>();
  stage.querySelectorAll<HTMLElement>("[data-win]").forEach((w) => wins.set(w.dataset.win as WinId, w));

  let results: Place[] = places;
  let selected = 0;
  let order: WinId[] = ["notion", "slack", "claude", "chrome"]; // back → front
  let mode: "auto" | "user" = reducedMotion() ? "user" : "auto";
  let paused = reducedMotion();
  let visible = false;
  let run: AbortController | null = null;

  /* Layout: scale the 1200×720 desktop (640 wide on narrow screens) to the stage. */
  const fit = () => {
    const narrow = matchMedia("(max-width: 52rem)").matches;
    const w = narrow ? 640 : 1200;
    const k = Math.min(stage.clientWidth / w, (stage.clientHeight - 28) / 720);
    stage.style.setProperty("--k", k.toFixed(4));
  };
  new ResizeObserver(fit).observe(stage);
  fit();

  /* Window stacking. */
  const stack = (front: WinId, animate: boolean) => {
    order = [...order.filter((w) => w !== front && w !== "other"), front];
    wins.forEach((el, id) => {
      const z = order.indexOf(id);
      el.style.setProperty("--z", String(z < 0 ? 0 : z + 1));
      el.classList.toggle("is-front", id === front);
    });
    const el = wins.get(front)!;
    if (animate && !reducedMotion()) {
      el.classList.remove("is-arriving");
      void el.offsetWidth;
      el.classList.add("is-arriving");
    }
    stage.dataset.front = front;
  };
  stack("chrome", false);

  /* Rendering the list. */
  const render = (query: string) => {
    results = search(places, query).slice(0, 8);
    selected = 0;
    text.textContent = query;
    placeholder.hidden = query.length > 0;
    section.textContent = query ? "Results" : "Recent";
    list.innerHTML = results.length
      ? results.map((p, i) => rowHTML(p, i === 0, "hero-lx")).join("")
      : `<li class="lx-empty" role="presentation">No matches in this demo. Try “slack” or “maya”.</li>`;
    syncSelection();
  };
  const syncSelection = () => {
    list.querySelectorAll<HTMLElement>(".lx-row").forEach((r, i) => r.setAttribute("aria-selected", String(i === selected)));
    const id = results[selected] ? `hero-lx-${results[selected].id}` : "";
    if (id) input.setAttribute("aria-activedescendant", id);
    else input.removeAttribute("aria-activedescendant");
  };

  const setOpen = (open: boolean) => {
    stage.dataset.open = String(open);
    reopen.hidden = open || mode === "auto";
  };

  /* The hop itself. */
  const hop = async (place: Place, signal?: AbortSignal) => {
    const row = list.querySelector<HTMLElement>(`[data-id="${place.id}"]`);
    let target: WinId = place.window ?? "other";
    if (target === "other") {
      const other = wins.get("other")!;
      other.querySelector<HTMLImageElement>("[data-other-icon]")!.src = apps[place.app].icon;
      other.querySelector("[data-other-title]")!.textContent = place.title;
      other.querySelector("[data-other-name]")!.textContent = place.title;
      other.querySelector("[data-other-sub]")!.textContent = `${apps[place.app].name} · ${place.kind}`;
    }
    press(enterKey);
    const from = row?.getBoundingClientRect();
    setOpen(false);
    stack(target, true);
    menubarApp.textContent = apps[place.app].short;
    live.textContent = `Opened ${place.title} in ${apps[place.app].name}.`;
    document.dispatchEvent(new CustomEvent("hero:hop")); // the headline's ears hop along (ears.ts)
    if (from && !reducedMotion()) await drawArc(from, wins.get(target)!.getBoundingClientRect(), signal);
  };

  const drawArc = async (from: DOMRect, to: DOMRect, signal?: AbortSignal) => {
    const s = stage.getBoundingClientRect();
    const x1 = from.left - s.left + from.width * 0.3;
    const y1 = from.top - s.top + from.height / 2;
    const x2 = to.left - s.left + to.width / 2;
    const y2 = to.top - s.top + 18;
    const cx = (x1 + x2) / 2;
    const cy = Math.min(y1, y2) - Math.max(60, Math.abs(x2 - x1) * 0.35);
    arcPath.setAttribute("d", `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`);
    const len = arcPath.getTotalLength();
    const t0 = performance.now();
    const dur = 460;
    await new Promise<void>((resolve) => {
      const step = (now: number) => {
        if (signal?.aborted) return resolve();
        const t = Math.min(1, (now - t0) / dur);
        const e = 1 - Math.pow(1 - t, 3);
        arcPath.style.strokeDashoffset = String(1 - e);
        const p = arcPath.getPointAtLength(len * e);
        arcDot.setAttribute("cx", String(p.x));
        arcDot.setAttribute("cy", String(p.y));
        arcDot.style.opacity = "1";
        if (t < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
    arcPath.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, delay: 250, fill: "forwards" });
    arcDot.animate([{ opacity: 1, r: 6 }, { opacity: 0, r: 16 }], { duration: 450, delay: 100, fill: "forwards" });
    setTimeout(() => {
      arcPath.getAnimations().forEach((a) => a.cancel());
      arcDot.getAnimations().forEach((a) => a.cancel());
      arcPath.style.strokeDashoffset = "1";
      arcDot.style.opacity = "0";
    }, 800);
  };

  /* Autoplay. */
  const autoplay = async (signal: AbortSignal) => {
    let i = 0;
    // A first frame people can read before anything moves.
    await wait(1400, signal);
    while (!signal.aborted) {
      const step = heroScript[i % heroScript.length];
      render("");
      setOpen(true);
      await wait(700, signal);
      lx.dataset.typing = "";
      for (let c = 1; c <= step.query.length; c++) {
        render(step.query.slice(0, c));
        await wait(70 + Math.random() * 60, signal);
      }
      delete lx.dataset.typing;
      const idx = results.findIndex((p) => p.id === step.pick);
      selected = Math.max(0, idx);
      syncSelection();
      await wait(650, signal);
      await hop(results[selected], signal);
      await wait(2300, signal);
      i++;
    }
  };

  const start = () => {
    if (mode !== "auto" || paused || !visible || document.hidden || run) return;
    run = new AbortController();
    autoplay(run.signal).catch(() => {});
  };
  const stop = () => {
    run?.abort();
    run = null;
    delete lx.dataset.typing;
  };

  const updatePause = () => {
    pauseBtn.setAttribute("aria-pressed", String(paused));
    pauseBtn.setAttribute("aria-label", paused ? "Play demo" : "Pause demo");
    pauseBtn.querySelector<HTMLElement>("[data-icon-pause]")!.toggleAttribute("hidden", paused);
    pauseBtn.querySelector<HTMLElement>("[data-icon-play]")!.toggleAttribute("hidden", !paused);
  };
  let pausedByButton = false;
  const wallpaper = stage.querySelector<HTMLVideoElement>("[data-banner-video]");
  pauseBtn.addEventListener("click", () => {
    paused = !paused;
    pausedByButton = paused;
    /* The button stops all the stage's motion, the moving wallpaper too. */
    wallpaper?.toggleAttribute("data-hold", paused);
    wallpaper?.dispatchEvent(new Event("banner:hold"));
    if (!paused) {
      mode = "auto";
      reopen.hidden = true;
      start();
    } else stop();
    updatePause();
  });
  updatePause();

  new IntersectionObserver(
    ([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    },
    { threshold: 0.35 },
  ).observe(stage);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

  /* After a visitor tries it, the demo picks up again once they've left it alone for a while. */
  let idle = 0;
  const resumeLater = () => {
    clearTimeout(idle);
    if (reducedMotion()) return;
    idle = window.setTimeout(() => {
      if (mode !== "user" || pausedByButton) return;
      if (document.activeElement === input) return resumeLater();
      mode = "auto";
      paused = false;
      reopen.hidden = true;
      updatePause();
      start();
    }, 9000);
  };

  /* The visitor takes over. */
  const takeOver = () => {
    if (mode === "user" && stage.dataset.open === "true") return;
    stop();
    mode = "user";
    paused = true;
    updatePause();
    setOpen(true);
    input.value = text.textContent ?? "";
    render(input.value);
    resumeLater();
  };
  lx.addEventListener("pointerdown", () => {
    takeOver();
    requestAnimationFrame(() => input.focus());
  });
  input.addEventListener("focus", takeOver);
  input.addEventListener("input", () => {
    render(input.value);
    resumeLater();
  });
  input.addEventListener("blur", resumeLater);
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!results.length) return;
      selected = (selected + (e.key === "ArrowDown" ? 1 : results.length - 1)) % results.length;
      syncSelection();
    } else if (e.key === "Enter") {
      e.preventDefault();
      const place = results[selected];
      if (place) {
        hop(place).then(() => reopen.focus({ preventScroll: true }));
      }
    } else if (e.key === "Escape") {
      if (input.value) {
        input.value = "";
        render("");
      } else {
        setOpen(false);
        reopen.focus({ preventScroll: true });
      }
    }
  });
  list.addEventListener("click", (e) => {
    const row = (e.target as HTMLElement).closest<HTMLElement>(".lx-row");
    if (!row) return;
    const i = results.findIndex((p) => p.id === row.dataset.id);
    if (i >= 0) {
      selected = i;
      syncSelection();
      hop(results[i]).then(() => reopen.focus({ preventScroll: true }));
    }
  });
  reopen.addEventListener("click", () => {
    resumeLater();
    mode = "user";
    setOpen(true);
    input.value = "";
    render("");
    input.focus({ preventScroll: true });
  });

  // Reduced motion: a still, complete frame with a search already typed.
  if (reducedMotion()) {
    render("q4 plan");
    input.value = "q4 plan";
  }
}
