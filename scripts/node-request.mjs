// Turns a Node request into a Web Request and writes a Web Response back. Used by the dev server and
// scripts/serve.mjs so /api/waitlist runs the same code locally as on Vercel.
export async function toWebRequest(req, base) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const body = Buffer.concat(chunks);
  return new Request(new URL(req.url, base), {
    method: req.method,
    headers: Object.entries(req.headers).flatMap(([k, v]) => (Array.isArray(v) ? v.map((x) => [k, x]) : v ? [[k, v]] : [])),
    body: ["GET", "HEAD"].includes(req.method) ? undefined : body,
  });
}

export async function sendWebResponse(res, response) {
  res.statusCode = response.status;
  response.headers.forEach((v, k) => res.setHeader(k, v));
  res.end(Buffer.from(await response.arrayBuffer()));
}
