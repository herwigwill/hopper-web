/**
 * The blog. One Markdown file per post in src/content/blog; the file name is the URL (/blog/<file-name>).
 * How to write one: .claude/skills/hopper-blog/SKILL.md.
 */
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { authors } from "./content/authors";

const blog = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/blog" }),
  schema: z.object({
    // Shown as the h1 and the search result title. Under 60 characters so Google doesn't cut it.
    title: z.string().max(60),
    // The meta description and the card text. 120–160 characters, says the answer, not a tease.
    description: z.string().min(80).max(160),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    author: z.enum(Object.keys(authors) as [keyof typeof authors, ...(keyof typeof authors)[]]),
    // The feature page the post is about; linked from the post.
    feature: z.object({ label: z.string(), href: z.string().startsWith("/") }),
    // Answer-first: two or three sentences that answer the title on their own. AI answers and featured snippets quote this.
    answer: z.string().max(400),
    takeaways: z.array(z.string()).min(2).max(5),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).max(6).default([]),
    cover: z.discriminatedUnion("kind", [
      z.object({ kind: z.literal("keys"), keys: z.array(z.string()).min(1).max(4), caption: z.string(), tone: z.enum(["blue", "night", "sun"]).default("blue") }),
      z.object({
        kind: z.literal("launcher"),
        query: z.string(),
        tab: z.string().optional(),
        rows: z.array(z.object({ icon: z.string(), title: z.string(), sub: z.string(), acc: z.string(), status: z.enum(["Needs You", "Done", "Working", "Idle"]).optional() })).min(1).max(4),
        tone: z.enum(["blue", "night", "sun"]).default("blue"),
      }),
      z.object({ kind: z.literal("windows"), layout: z.array(z.object({ icon: z.string(), label: z.string(), x: z.number(), y: z.number(), w: z.number(), h: z.number() })).min(1).max(4), caption: z.string(), tone: z.enum(["blue", "night", "sun"]).default("night") }),
      z.object({ kind: z.literal("mac"), icons: z.array(z.string()).min(3).max(12), caption: z.string(), tone: z.enum(["blue", "night", "sun"]).default("blue") }),
    ]),
    // Describes the cover for screen readers and image search.
    coverAlt: z.string(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
