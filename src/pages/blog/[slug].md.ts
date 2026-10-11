/**
 * Each post as plain Markdown at /blog/<slug>.md, for AI assistants and agents that read the web (listed in llms.txt).
 * The answer and FAQ are written out so the file stands alone.
 */
import type { APIRoute } from "astro";
import { authors } from "../../content/authors";
import { getPosts, postUrl, isoDate, type Post } from "../../lib/blog";

export async function getStaticPaths() {
  return (await getPosts()).map((post) => ({ params: { slug: post.id }, props: { post } }));
}

export const GET: APIRoute = ({ props }) => {
  const post = (props as { post: Post }).post;
  const { data, body } = post;
  const a = authors[data.author];
  const md = [
    `# ${data.title}`,
    "",
    `${a.name}, ${a.role} · ${isoDate(data.date)}${data.updated ? ` · updated ${isoDate(data.updated)}` : ""} · ${postUrl(post)}`,
    "",
    `> ${data.answer}`,
    "",
    ...data.takeaways.map((t) => `- ${t}`),
    "",
    (body ?? "").trim(),
    ...(data.faq.length ? ["", "## Questions people ask", "", ...data.faq.flatMap((f) => [`### ${f.q}`, "", f.a, ""])] : []),
  ].join("\n");
  return new Response(md, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
};
