/** Blog bylines. Real people only; `url` links their author box to the About page. */
export const authors = {
  matt: { name: "Matt Herwig", role: "Founder", initials: "MH", tone: "blue", bio: "Matt founded Hopper after years of hopping between apps.", url: "https://addhopper.com/about" },
  will: { name: "Will Herwig", role: "Growth", initials: "WH", tone: "night", bio: "Will runs growth at Hopper and talks to the people testing it.", url: "https://addhopper.com/about" },
} as const;
export type AuthorId = keyof typeof authors;
