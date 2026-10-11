import { handleWaitlist } from "./_lib/waitlist.js";

/** Vercel Function: POST /api/waitlist. See `_lib/waitlist.ts`. */
export async function POST(request: Request): Promise<Response> {
  const client = request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return handleWaitlist(request, process.env, client);
}

export function GET(): Response {
  return new Response(null, { status: 405, headers: { Allow: "POST" } });
}
