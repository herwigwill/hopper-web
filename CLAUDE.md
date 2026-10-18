# hopper-web (addhopper.com)

Marketing site for Hopper, a Mac app (source: `~/hopper-native`). Astro static, hosted on GitHub Pages (waitlist is an email link).

- Node 22: prefix commands with `PATH=/opt/homebrew/bin:$PATH`. Dev: preview tool (own port per worktree). Full check: `npm run verify`.
- Every product claim must be true in hopper-native. Claims live in `src/content/facts.ts`.
- This folder is its own git repo (`herwigwill/hopper-web`). `~` is a different repo: never commit from there.
- Owner workflow: build first, verify (screenshots/tests) only when asked, but run `npm run verify` before a PR.
  Commit, push or publish only when asked.

Skills (load when relevant):
- `hopper-site`: how it's built, adding pages, gotchas, testing.
- `hopper-design`: design and copy principles, owner's taste, reusable components.
- `hopper-blog`: writing and publishing blog posts.

Hopper Tips (`/tips`): the app's tip videos, made in `~/hopper-studio` with its `hopper-tips` skill
(`.claude/skills/hopper-tips/SKILL.md`), which publishes them to the app and here at once (`npm run publish-tips` there).
`src/content/tips.json` and `public/tips/` come from that step: don't edit them here.

Architecture and deploy details: `README.md`.
