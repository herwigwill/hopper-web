/**
 * The hero's bunny ears. They pop up beside the headline (CSS), then stay alive: a twitch now and then, a hop each
 * time the demo hops (`hero:hop`), a hop when you hover the headline, a duck-and-peek when you tap it, and a lean
 * toward the pointer. Idle twitches stop off-screen, in background tabs and when the demo is paused. Nothing moves
 * under reduced motion.
 */
import { reducedMotion } from "./launcher";

type Move = (ear: "l" | "r") => Keyframe[];

const spring = (deg: number) => [deg, -deg * 0.55, deg * 0.25, -deg * 0.1, 0];
const wobble = (degs: number[]): Keyframe[] => degs.map((d) => ({ transform: `rotate(${d}deg)` }));

/** Keyframes per move, per ear. Rotations are clockwise-positive; translations are in the mark's units (172 tall). */
const moves: Record<string, { duration: number; frames: Move; lag?: number }> = {
  twitch: { duration: 520, frames: (e) => wobble([0, ...spring(e === "l" ? -13 : 16)]) },
  flick: {
    duration: 760,
    frames: (e) => wobble([0, e === "l" ? -12 : 14, 0, e === "l" ? -9 : 10, -2, 0]),
  },
  flop: {
    duration: 1100,
    frames: (e) =>
      e === "r"
        ? [
            { transform: "none", easing: "cubic-bezier(.5,0,.75,0)" },
            { transform: "rotate(38deg)", offset: 0.35 },
            { transform: "rotate(36deg)", offset: 0.55, easing: "cubic-bezier(.2,1.6,.4,1)" },
            { transform: "none" },
          ]
        : wobble([0, 0, 4, -2, 0]),
  },
  perk: {
    duration: 900,
    frames: (e) => [
      { transform: "none" },
      { transform: `rotate(${e === "l" ? 4 : -8}deg) scaleY(1.08)`, offset: 0.25 },
      { transform: `rotate(${e === "l" ? 4 : -8}deg) scaleY(1.08)`, offset: 0.6 },
      { transform: `rotate(${e === "l" ? -2 : 4}deg) scaleY(.98)`, offset: 0.8 },
      { transform: "none" },
    ],
  },
  hop: {
    duration: 680,
    lag: 40,
    frames: (e) => [
      { transform: "none" },
      { transform: "translateY(6px) scale(1.06, .9)", offset: 0.16 },
      { transform: `translateY(-46px) rotate(${e === "l" ? 6 : -10}deg) scaleY(1.04)`, offset: 0.46 },
      { transform: `translateY(4px) rotate(${e === "l" ? -9 : 16}deg) scale(1.05, .92)`, offset: 0.72 },
      { transform: `rotate(${e === "l" ? 3 : -5}deg)`, offset: 0.86 },
      { transform: "none" },
    ],
  },
  peek: {
    duration: 1150,
    lag: 70,
    frames: (e) => [
      { transform: "none", easing: "cubic-bezier(.5,0,.9,.4)" },
      { transform: "translateY(185px)", offset: 0.2 },
      { transform: "translateY(185px)", offset: 0.5, easing: "cubic-bezier(.2,1.4,.4,1)" },
      { transform: `translateY(-10px) rotate(${e === "l" ? -4 : 8}deg)`, offset: 0.74 },
      { transform: `rotate(${e === "l" ? 2 : -5}deg)`, offset: 0.88 },
      { transform: "none" },
    ],
  },
};
const idleMoves = ["twitch", "twitch", "flick", "flop", "perk"];

export function initEars(root: HTMLElement) {
  if (reducedMotion()) return;
  const svg = root.querySelector<SVGSVGElement>("svg")!;
  const ears = { l: root.querySelector<SVGElement>(".ear-l")!, r: root.querySelector<SVGElement>(".ear-r")! };
  const headline = root.closest("h1") ?? root;
  let busy = false;
  let visible = false;
  let paused = false;
  let timer = 0;

  /** Plays a move on one ear or both. Skipped while another move is running, so they never pile up. */
  const play = (name: string, only?: "l" | "r") => {
    if (busy) return;
    const m = moves[name];
    const which = only ? [only] : (["l", "r"] as const);
    busy = true;
    // Easing per keyframe (a whole-animation easing would shift the offsets the moves are timed to).
    const runs = which.map((e, i) =>
      ears[e].animate(
        m.frames(e).map((f) => ({ easing: "ease-in-out", ...f })),
        { duration: m.duration, delay: i * (m.lag ?? 0) },
      ).finished,
    );
    Promise.allSettled(runs).then(() => (busy = false));
  };

  /* Idle: something small every few seconds, while on-screen and not paused. */
  const schedule = () => {
    clearTimeout(timer);
    if (!visible || paused || document.hidden) return;
    timer = window.setTimeout(() => {
      const name = idleMoves[Math.floor(Math.random() * idleMoves.length)];
      play(name, name === "twitch" ? (Math.random() < 0.6 ? "r" : "l") : undefined);
      schedule();
    }, 3200 + Math.random() * 4800);
  };
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    schedule();
  }).observe(root);
  document.addEventListener("visibilitychange", schedule);

  /* The demo's Pause button stills the ears too. */
  const pauseBtn = document.querySelector<HTMLButtonElement>("[data-pause]");
  if (pauseBtn) {
    const sync = () => {
      paused = pauseBtn.getAttribute("aria-label") === "Play demo";
      schedule();
    };
    new MutationObserver(sync).observe(pauseBtn, { attributes: true, attributeFilter: ["aria-label"] });
    sync();
  }

  /* Reactions. Wait for the pop-up entrance (CSS) to finish first. */
  let ready = false;
  root.addEventListener("animationend", (e) => {
    if ((e.target as Element).classList.contains("ear-r")) ready = true;
  });
  setTimeout(() => (ready = true), 1600);
  document.addEventListener("hero:hop", () => ready && play("hop"));
  headline.addEventListener("pointerenter", (e) => ready && (e as PointerEvent).pointerType === "mouse" && play("hop"));
  headline.addEventListener("click", () => ready && play("peek"));

  /* Lean toward the pointer, as if listening. */
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    let frame = 0;
    let x = 0;
    let y = 0;
    window.addEventListener(
      "pointermove",
      (e) => {
        x = e.clientX;
        y = e.clientY;
        if (frame || !visible) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          const r = svg.getBoundingClientRect();
          const dx = x - (r.left + r.width / 2);
          const dy = y - (r.top + r.height / 2);
          const lean = Math.max(-1, Math.min(1, dx / 700)) * (dy > r.height * 3 ? 0.5 : 1);
          svg.style.setProperty("--lean", `${(lean * 9).toFixed(2)}deg`);
        });
      },
      { passive: true },
    );
  }
}
