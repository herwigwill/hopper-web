# hopper-web (addhopper.com)

Marketing site for Hopper, a Mac app (source: `~/hopper-native`). Astro static, hosted on GitHub Pages (waitlist is an email link).

- Node 22: prefix commands with `PATH=/opt/homebrew/bin:$PATH`. Dev: `npm run dev` (port 4321). Full check: `npm run verify`.
- Every product claim must be true in hopper-native. Claims live in `src/content/facts.ts`.
- This folder is its own git repo (`herwigwill/hopper-web`). `~` is a different repo: never commit from there.
- Owner workflow: build first, verify (screenshots/tests) only when asked, but run `npm run verify` before a PR.
  Commit, push or publish only when asked.

Skills (load when relevant):
- `hopper-site`: how it's built, adding pages, gotchas, testing.
- `hopper-design`: design and copy principles, owner's taste, reusable components.
- `hopper-blog`: writing and publishing blog posts.

Architecture and deploy details: `README.md`.
