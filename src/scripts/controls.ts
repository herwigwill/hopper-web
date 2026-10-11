/** Small helpers for the demos' own controls. */

/** Marks one radio checked; only it is in the tab order (roving tabindex). */
export function check(btns: HTMLButtonElement[], on: (b: HTMLButtonElement) => boolean) {
  btns.forEach((b) => {
    const c = on(b);
    b.setAttribute("aria-checked", String(c));
    b.tabIndex = c ? 0 : -1;
  });
}

/** Arrow keys move between a radio group's buttons and choose (WAI-ARIA radio group). */
export function radioKeys(e: KeyboardEvent, btns: HTMLButtonElement[]) {
  const i = btns.indexOf(document.activeElement as HTMLButtonElement);
  if (i < 0) return;
  const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
  if (!d) return;
  e.preventDefault();
  const next = btns[(i + d + btns.length) % btns.length];
  next.focus();
  next.click();
}
