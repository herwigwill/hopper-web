/** Enhances a [data-waitlist] block: inline validation, pending / success / error states, the optional follow-up. */

type JoinResult =
  | { ok: true; status: "joined" | "already" | "saved"; token?: string; dryRun?: boolean }
  | { ok: false; code: string; message: string };

const JOINED = "hopper:joined";
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,253}\.[^\s@]{2,63}$/;

async function post(form: HTMLFormElement): Promise<JoinResult> {
  const body = new URLSearchParams(new FormData(form) as unknown as Record<string, string>);
  try {
    const res = await fetch(form.action, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = (await res.json().catch(() => null)) as JoinResult | null;
    if (data) return data;
    return { ok: false, code: "failed", message: "Your email didn't go through. Try again in a moment." };
  } catch {
    return { ok: false, code: "offline", message: "You seem to be offline. Check your connection and press Join again." };
  }
}

function showDone(root: HTMLElement, email: string, result: Extract<JoinResult, { ok: true }>, focus: boolean) {
  const join = root.querySelector<HTMLFormElement>("[data-join]")!;
  const done = root.querySelector<HTMLElement>("[data-done]")!;
  const details = root.querySelector<HTMLFormElement>("[data-details]")!;
  if (result.status === "already") {
    root.querySelector("[data-done-title]")!.textContent = "You’re already on the list.";
  }
  join.hidden = true;
  done.hidden = false;
  if (result.token) {
    (details.elements.namedItem("email") as HTMLInputElement).value = email;
    (details.elements.namedItem("token") as HTMLInputElement).value = result.token;
  } else {
    details.hidden = true;
  }
  if (focus) done.focus();
}

export function enhanceWaitlist(root: HTMLElement) {
  const join = root.querySelector<HTMLFormElement>("[data-join]");
  const details = root.querySelector<HTMLFormElement>("[data-details]");
  if (!join || !details) return;
  const input = join.querySelector<HTMLInputElement>('input[type="email"]')!;
  const error = join.querySelector<HTMLElement>("[data-error]")!;
  const opened = join.querySelector<HTMLInputElement>("[data-opened]")!;
  const start = performance.now();
  let busy = false;

  const setError = (message: string) => {
    error.textContent = message;
    input.setAttribute("aria-invalid", message ? "true" : "false");
  };

  input.addEventListener("input", () => {
    if (error.textContent) setError("");
  });

  join.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy) return;
    const email = input.value.trim();
    if (!EMAIL.test(email)) {
      setError(email ? "Enter an email address like name@example.com." : "Enter your email address to join.");
      input.focus();
      return;
    }
    setError("");
    opened.value = String(Math.round(performance.now() - start));
    busy = true;
    join.setAttribute("aria-busy", "true");
    const label = join.querySelector(".label")!;
    const was = label.textContent;
    label.textContent = "Joining…";
    const result = await post(join);
    busy = false;
    join.removeAttribute("aria-busy");
    label.textContent = was;
    if (!result.ok) {
      setError(result.message);
      input.focus();
      return;
    }
    if (result.dryRun) console.info("[waitlist] Dry run: LOOPS_API_KEY isn't set, so nothing was stored.");
    showDone(root, email, result, true);
    (window as unknown as { va?: (e: string, d: object) => void }).va?.("event", { name: "waitlist_submitted" });
    document.dispatchEvent(new CustomEvent(JOINED, { detail: { email, result, from: root } }));
  });

  // Joining in one form updates the other.
  document.addEventListener(JOINED, (e) => {
    const { email, result, from } = (e as CustomEvent).detail;
    if (from !== root) showDone(root, email, result, false);
  });

  details.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = details.querySelector<HTMLElement>("[data-details-status]")!;
    const answered = new FormData(details);
    if (!answered.get("uses") && !answered.get("agents")) {
      status.textContent = "Pick an answer first, or leave it. You’re already on the list.";
      return;
    }
    status.textContent = "Saving…";
    const result = await post(details);
    if (result.ok) {
      details.querySelectorAll("fieldset, .save").forEach((el) => ((el as HTMLElement).hidden = true));
      details.querySelector(".ask")!.textContent = "";
      status.textContent = "Saved. Thanks, that helps.";
    } else {
      status.textContent = result.message;
    }
  });
}
