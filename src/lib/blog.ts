/** Shared by the blog pages, the RSS feed, llms.txt and the sitemap. */
import { getCollection, type CollectionEntry } from "astro:content";
import { site } from "../content/facts";
import { authors } from "../content/authors";

export type Post = CollectionEntry<"blog">;

/** Published posts, newest first. Drafts show up in `astro dev` only. */
export async function getPosts(): Promise<Post[]> {
  const all = await getCollection("blog", (p) => import.meta.env.DEV || !p.data.draft);
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const postPath = (p: Post) => `/blog/${p.id}`;
export const postUrl = (p: Post) => new URL(postPath(p), site.url).href;
/** The cover as a PNG, for social cards and search (npm run blog:covers writes it). */
export const coverPng = (p: Post) => `/blog/${p.id}.png`;

export function readingMinutes(p: Post) {
  const words = (p.body ?? "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

const fmt = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
export const formatDate = (d: Date) => fmt.format(d);
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

const publisher = {
  "@type": "Organization",
  name: site.name,
  url: site.url,
  logo: { "@type": "ImageObject", url: new URL("/apple-touch-icon.png", site.url).href },
};

/** Structured data for a post: the article, where it sits, and its FAQ. Search engines and AI answers read these. */
export function postJsonLd(p: Post) {
  const a = authors[p.data.author];
  const url = postUrl(p);
  const graph: object[] = [
    {
      "@type": "BlogPosting",
      "@id": `${url}#article`,
      headline: p.data.title,
      description: p.data.description,
      abstract: p.data.answer,
      image: new URL(coverPng(p), site.url).href,
      datePublished: p.data.date.toISOString(),
      dateModified: (p.data.updated ?? p.data.date).toISOString(),
      author: { "@type": "Person", name: a.name, jobTitle: a.role, url: a.url },
      publisher,
      mainEntityOfPage: url,
      url,
      wordCount: (p.body ?? "").split(/\s+/).filter(Boolean).length,
      about: { "@type": "SoftwareApplication", name: site.name, operatingSystem: "macOS", applicationCategory: "UtilitiesApplication", url: site.url },
      inLanguage: "en-US",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: site.url + "/" },
        { "@type": "ListItem", position: 2, name: "Blog", item: new URL("/blog", site.url).href },
        { "@type": "ListItem", position: 3, name: p.data.title, item: url },
      ],
    },
  ];
  if (p.data.faq.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: p.data.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

export function blogJsonLd(posts: Post[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "The Hopper blog",
    url: new URL("/blog", site.url).href,
    publisher,
    blogPost: posts.map((p) => ({ "@type": "BlogPosting", headline: p.data.title, url: postUrl(p), datePublished: p.data.date.toISOString() })),
  };
}

/** JSON-LD is data, not a script, so the CSP doesn't block it; `<` is escaped so text can't close the tag. */
export const ldJson = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");
