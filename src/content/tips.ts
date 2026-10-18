/**
 * Hopper Tips: the same short narrated videos the app shows on its Tips pages (hopper-native ADR-093). Made in
 * hopper-studio with its `hopper-tips` skill (`.claude/skills/hopper-tips/SKILL.md` there), which renders them and
 * publishes them to the app and this site together (`npm run publish-tips` in hopper-studio). Don't edit
 * `tips.json` or `public/tips/` here: change the tip in hopper-studio and publish again.
 */
import manifest from "./tips.json";

export type Tip = {
  order: number;
  skill: string;
  title: string;
  tip: string;
  category: string;
  section: string;
  video: string;
  poster: string;
  seconds: number;
  body: string;
  open: string;
};

export const tips: Tip[] = (manifest.tips as Tip[]).slice().sort((a, b) => a.order - b.order);

/** A tip's anchor on /tips ("command-clipboard-history"), as its file is named. */
export const tipId = (t: Tip) => t.video.replace(/\.mp4$/, "");

/** The tips in their sections, Basics first, in page order. */
export const tipSections = tips.reduce<{ title: string; tips: Tip[] }[]>((out, t) => {
  const s = out.find((x) => x.title === t.section);
  if (s) s.tips.push(t);
  else out.push({ title: t.section, tips: [t] });
  return out;
}, []);
