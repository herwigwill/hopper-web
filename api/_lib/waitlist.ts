/**
 * Waitlist sign-ups. One handler, used by the Vercel Function (`api/waitlist.ts`), the dev server
 * (`astro.config.mjs`) and the local production server (`scripts/serve.mjs`), so all three behave the same.
 *
 * Two kinds of request, both POST:
 *   - `intent=join`    { email, company (honeypot), t (ms the form was open) } → adds the contact to Loops
 *   - `intent=details` { email, token, uses, agents } → saves the optional follow-up answers
 *
 * Forms post as `application/x-www-form-urlencoded` and work without JavaScript: those requests get a 303 redirect
 * to a static page. Requests sent with `Accept: application/json` (the enhanced form) get JSON.
 *
 * Nothing here logs an email address.
 */

export type Env = {
  LOOPS_API_KEY?: string;
  LOOPS_MAILING_LIST_ID?: string;
  WAITLIST_SECRET?: string;
  /** Requests per minute per address before 429 (default 6). */
  WAITLIST_RATE_LIMIT?: string;
  /** "production" on the live site (Vercel sets VERCEL_ENV). */
  VERCEL_ENV?: string;
  NODE_ENV?: string;
};

type Result =
  | { ok: true; status: "joined" | "already" | "saved"; token?: string; dryRun?: boolean }
  | { ok: false; code: ErrorCode; message: string };

type ErrorCode = "invalid_email" | "too_fast" | "rate_limited" | "unavailable" | "bad_request" | "failed";

const MESSAGES: Record<ErrorCode, string> = {
  invalid_email: "Enter an email address like name@example.com.",
  too_fast: "That was quick. Wait a second and press Join again.",
  rate_limited: "Too many tries from this network. Wait a minute and try again.",
  unavailable: "Sign-ups are paused for a moment. Try again in a few minutes.",
  bad_request: "Something in that request wasn't right. Reload the page and try again.",
  failed: "Your email didn't go through. Try again in a moment.",
};

const STATUS: Record<ErrorCode, number> = {
  invalid_email: 400,
  too_fast: 400,
  rate_limited: 429,
  unavailable: 503,
  bad_request: 400,
  failed: 502,
};

const fail = (code: ErrorCode): Result => ({ ok: false, code, message: MESSAGES[code] });

// RFC 5321 caps an address at 254 characters. The pattern is deliberately simple: one @, a dot in the domain,
// no spaces. Loops does its own deliverability checks.
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,253}\.[^\s@]{2,63}$/;

export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (email.length > 254 || !EMAIL.test(email)) return null;
  return email;
}

const USES = new Set(["spotlight", "raycast", "alfred", "other", "nothing"]);
const AGENTS = new Set(["yes", "sometimes", "no"]);

// Best-effort limit per instance: 6 requests a minute per address. Vercel keeps instances warm (Fluid compute), so
// this catches bursts; add a Vercel WAF rate-limit rule on /api/waitlist for a hard global limit.
const WINDOW_MS = 60_000;
const LIMIT = 6;
const hits = new Map<string, number[]>();

export function rateLimited(key: string, limit = LIMIT, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5_000) {
    for (const [k, v] of hits) if (now - v[v.length - 1] > WINDOW_MS) hits.delete(k);
  }
  return recent.length > limit;
}

async function hmac(secret: string, value: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return Buffer.from(sig).toString("base64url");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const limitOf = (env: Env) => Number(env.WAITLIST_RATE_LIMIT) || LIMIT;
const isProduction = (env: Env) => env.VERCEL_ENV === "production";

async function loops(env: Env, path: string, method: "POST" | "PUT", body: Record<string, unknown>) {
  return fetch(`https://app.loops.so/api/v1/${path}`, {
    method,
    headers: { Authorization: `Bearer ${env.LOOPS_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8_000),
  });
}

export async function join(fields: Record<string, string>, env: Env, client: string): Promise<Result> {
  // Bots fill every field; people never see this one.
  if (fields.company) return { ok: true, status: "joined" };
  const email = normalizeEmail(fields.email);
  if (!email) return fail("invalid_email");
  // `t` is set by the page's script; without JavaScript it's absent and the check is skipped.
  const openFor = Number(fields.t);
  if (fields.t && Number.isFinite(openFor) && openFor < 1_500) return fail("too_fast");
  if (rateLimited(client, limitOf(env))) return fail("rate_limited");

  const token = env.WAITLIST_SECRET ? await hmac(env.WAITLIST_SECRET, email) : undefined;

  if (!env.LOOPS_API_KEY) {
    // Never pretend in production: without a key, nothing would be stored.
    if (isProduction(env)) return fail("unavailable");
    return { ok: true, status: "joined", token, dryRun: true };
  }

  try {
    const res = await loops(env, "contacts/create", "POST", {
      email,
      source: "addhopper.com waitlist",
      userGroup: "Waitlist",
      ...(env.LOOPS_MAILING_LIST_ID ? { mailingLists: { [env.LOOPS_MAILING_LIST_ID]: true } } : {}),
    });
    if (res.ok) return { ok: true, status: "joined", token };
    // Loops answers 409 when the address is already a contact: tell them, kindly, without leaking anything else.
    if (res.status === 409) return { ok: true, status: "already", token };
    console.error(`[waitlist] Loops create failed with ${res.status}`);
    return fail("failed");
  } catch {
    console.error("[waitlist] Loops create did not respond");
    return fail("failed");
  }
}

export async function details(fields: Record<string, string>, env: Env, client: string): Promise<Result> {
  const email = normalizeEmail(fields.email);
  if (!email || !fields.token || !env.WAITLIST_SECRET) return fail("bad_request");
  if (!timingSafeEqual(fields.token, await hmac(env.WAITLIST_SECRET, email))) return fail("bad_request");
  if (rateLimited(client, limitOf(env))) return fail("rate_limited");
  const props: Record<string, string> = {};
  if (USES.has(fields.uses)) props.launcherToday = fields.uses;
  if (AGENTS.has(fields.agents)) props.runsCodingAgents = fields.agents;
  if (!Object.keys(props).length) return { ok: true, status: "saved" };
  if (!env.LOOPS_API_KEY) return isProduction(env) ? fail("unavailable") : { ok: true, status: "saved", dryRun: true };
  try {
    const res = await loops(env, "contacts/update", "PUT", { email, ...props });
    if (res.ok) return { ok: true, status: "saved" };
    console.error(`[waitlist] Loops update failed with ${res.status}`);
    return fail("failed");
  } catch {
    console.error("[waitlist] Loops update did not respond");
    return fail("failed");
  }
}

async function readFields(request: Request): Promise<Record<string, string> | null> {
  const type = request.headers.get("content-type") ?? "";
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > 4_096) return null;
  try {
    if (type.includes("application/json")) {
      const body = (await request.json()) as Record<string, unknown>;
      return Object.fromEntries(Object.entries(body).map(([k, v]) => [k, typeof v === "string" ? v : String(v ?? "")]));
    }
    if (type.includes("application/x-www-form-urlencoded") || type.includes("multipart/form-data")) {
      const form = await request.formData();
      return Object.fromEntries([...form.entries()].map(([k, v]) => [k, typeof v === "string" ? v : ""]));
    }
  } catch {
    return null;
  }
  return null;
}

/** The whole request → response cycle. `client` is the caller's IP (for the rate limit only; never stored). */
export async function handleWaitlist(request: Request, env: Env, client: string): Promise<Response> {
  const wantsJson = (request.headers.get("accept") ?? "").includes("application/json");
  const reply = (result: Result) => {
    if (wantsJson) {
      const status = result.ok ? 200 : STATUS[result.code];
      const headers: Record<string, string> = { "Cache-Control": "no-store" };
      if (result.ok && result.dryRun) headers["X-Waitlist"] = "dry-run";
      return Response.json(result, { status, headers });
    }
    // Without JavaScript: a static page that says what happened.
    const page = result.ok ? "/waitlist/joined" : `/waitlist/try-again?reason=${result.code}`;
    return new Response(null, { status: 303, headers: { Location: page, "Cache-Control": "no-store" } });
  };

  if (request.method !== "POST") {
    return new Response(null, { status: 405, headers: { Allow: "POST" } });
  }
  // Same-origin only: browsers send Origin on cross-site POSTs.
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) return reply(fail("bad_request"));

  const fields = await readFields(request);
  if (!fields) return reply(fail("bad_request"));
  const result = fields.intent === "details" ? await details(fields, env, client) : await join(fields, env, client);
  return reply(result);
}
