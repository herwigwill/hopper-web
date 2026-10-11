/**
 * The help center (/help). Every answer must be true of hopper-native today, like facts.ts: default keys from
 * ADR-023…026, 045, 057, 062; permissions from OnboardingView.swift and ADR-007; sources off by default ADR-018;
 * agents ADR-006; clipboard ADR-027; Online Lookups ADR-032; Switch Hotkeys ADR-044.
 *
 * `a` is plain text (it also goes into the page's FAQ structured data). `words` are extra search terms people might
 * type that aren't in the question or answer. `link` is where to read more on the site.
 */
import { site } from "./facts";

export type HelpArticle = { id: string; q: string; a: string; words?: string; link?: { label: string; href: string } };
export type HelpTopic = { id: string; title: string; articles: HelpArticle[] };

export const helpTopics: HelpTopic[] = [
  {
    id: "setup",
    title: "Getting set up",
    articles: [
      { id: "requirements", q: "What do I need to run Hopper?", a: "A Mac running macOS 26 or later.", words: "requirements version system os compatible" },
      {
        id: "permissions",
        q: "Which permissions does Hopper need?",
        a: "Accessibility is recommended: it lets Hopper see your windows and tabs and switch apps. Full Disk Access is optional and adds browser history, bookmarks, Notes and Messages. macOS also asks once per browser before Hopper reads its tabs. Hopper works without any of them, but sees much more with them.",
        words: "accessibility full disk access fda automation allow grant privacy security",
        link: { label: "Setup, step by step", href: "/getting-started#permissions" },
      },
      {
        id: "spotlight",
        q: "⌘Space opens Spotlight instead of Hopper.",
        a: "Turn off Spotlight’s shortcut in System Settings ▸ Keyboard ▸ Keyboard Shortcuts ▸ Spotlight, or record a different key for Hopper in its Settings.",
        words: "command space cmd shortcut conflict clash not opening",
      },
      {
        id: "raycast",
        q: "Can I use Hopper alongside Raycast?",
        a: "Yes. Switch Hotkeys hands Hopper’s hotkeys and gestures to Raycast and takes them back. The menu bar item tells you which app has them.",
        words: "alfred launcher both together switch hotkeys",
      },
      {
        id: "change-shortcut",
        q: "How do I change a shortcut?",
        a: "Open Hopper’s Settings and go to Shortcuts. Click a shortcut and press the keys you want. You can record any combination.",
        words: "hotkey rebind remap keyboard custom record",
        link: { label: "Every default shortcut", href: "/features/hotkeys" },
      },
    ],
  },
  {
    id: "search",
    title: "Search",
    articles: [
      {
        id: "tabs-missing",
        q: "My browser tabs don’t show up.",
        a: "Open System Settings ▸ Privacy & Security ▸ Automation and allow Hopper for Chrome or Safari, and check that Accessibility is on for Hopper. Private and incognito windows are never shown.",
        words: "chrome safari not showing missing empty results",
      },
      {
        id: "sources",
        q: "Which apps can Hopper search?",
        a: "Chrome and Safari tabs, bookmarks, Claude Code, Codex and Cursor, Notion, Obsidian, Apple Notes, your editor’s recent files, Slack, Messages, Contacts, Calendar, Reminders, Music, TV, and your apps, windows and files. Personal ones are off until you switch them on.",
        words: "sources supported integrations notion slack obsidian",
        link: { label: "See every source", href: "/features/search#sources" },
      },
      {
        id: "filter-tabs",
        q: "How do I search only the app I’m in?",
        a: "Press ⇥ in Hopper to move between Search, the app you’re in and Agents. The text you typed stays put.",
        words: "tab key filter narrow current app front",
      },
      {
        id: "keeps-search",
        q: "Why is my last search still there?",
        a: "Hopper keeps your search when you close it, so you can pick up where you left off. Press Esc to start fresh.",
        words: "esc escape clear reset remember text",
      },
      {
        id: "screenshots",
        q: "Can I find a screenshot by the words in it?",
        a: "Yes. Hopper reads the text in your screenshots with on-device text recognition, so you can search for any word in them.",
        words: "ocr image text recognition screenshot",
      },
      {
        id: "actions",
        q: "How do I see everything I can do with a result?",
        a: "Select the result and press ⌘K.",
        words: "cmd k menu options actions copy",
      },
    ],
  },
  {
    id: "navigation",
    title: "Back & Toggle",
    articles: [
      {
        id: "back",
        q: "How do I go back to where I was?",
        a: "Press ⌃⌥← to go Back to the place you were before, in any app: the exact tab, doc, window or session. ⌃⌥→ goes Forward again.",
        words: "back forward previous control option arrow history",
        link: { label: "How navigation works", href: "/features/navigation" },
      },
      {
        id: "toggle",
        q: "What’s the difference between Toggle and Toggle Tab?",
        a: "Toggle (double-tap ⌘) flips between your two most recent apps. Toggle Tab (double-tap ⌥) flips between your two most recent tabs, windows or sessions, even inside one app.",
        words: "double tap command option switch apps",
      },
      {
        id: "history",
        q: "How long does Hopper keep my history?",
        a: "30 days by default. You can make it 7 or 90 days, or clear it whenever you like. Press and release ⌃⌘ to see it.",
        words: "history retention delete clear days",
      },
      {
        id: "reopen-tab",
        q: "Can I reopen a tab I closed by accident?",
        a: "Yes. Recently Closed keeps tabs that closed while their browser kept running, and reopens them in the same browser.",
        words: "recently closed undo close tab restore",
      },
    ],
  },
  {
    id: "agents",
    title: "Agents",
    articles: [
      {
        id: "agents-supported",
        q: "Which coding agents work with Hopper?",
        a: "Claude Code, the Claude app, Codex and Cursor, plus agents running in herdr. Press ⌥Space to see them all.",
        words: "claude code codex cursor herdr ai agents supported",
        link: { label: "About Agents", href: "/features/agents" },
      },
      {
        id: "statuses",
        q: "What do Needs You, Done, Working and Idle mean?",
        a: "Needs You: stopped to ask you something. Done: finished since you last looked. Working: busy right now. Idle: nothing new. Once you’ve seen a Done agent, it moves to Idle.",
        words: "status needs you done working idle",
      },
      {
        id: "needs-you",
        q: "Why don’t Codex or Cursor show Needs You?",
        a: "Claude Code and Claude say when they stop to ask you something, so Hopper can show Needs You for them. Codex and Cursor show Working, Done and Idle.",
        words: "needs you missing codex cursor waiting",
      },
      {
        id: "hooks",
        q: "Do I need to install hooks or plugins in my agents?",
        a: "No. Hopper reads each agent’s own files on your Mac. Nothing is installed into Claude Code, Codex or Cursor.",
        words: "hooks plugin extension install setup",
      },
    ],
  },
  {
    id: "windows",
    title: "Windows",
    articles: [
      {
        id: "window-keys",
        q: "Why don’t window shortcuts do anything?",
        a: "Window commands have no shortcuts until you set them. Type a command in search (“left half”), give it a hotkey, or import a preset.",
        words: "window snapping resize hotkey not working",
        link: { label: "About Windows", href: "/features/windows" },
      },
      {
        id: "presets",
        q: "Can I import shortcuts from Rectangle, Magnet or Spectacle?",
        a: "Yes, in one go. Hopper tells you first if one of them is already taken, like ⌃⌥← and ⌃⌥→, which are Back and Forward.",
        words: "rectangle magnet spectacle import migrate",
        link: { label: "Hotkey presets", href: "/features/windows#presets" },
      },
    ],
  },
  {
    id: "toolkit",
    title: "Clipboard & Snippets",
    articles: [
      {
        id: "clipboard",
        q: "How do I turn on Clipboard History?",
        a: "It’s off until you turn it on in Hopper’s Settings. It skips anything your password manager marks as secret, and you choose how long entries are kept.",
        words: "clipboard copy paste history enable",
      },
      {
        id: "snippets",
        q: "How do snippets work?",
        a: "Type a snippet’s keyword in any app and it becomes the snippet’s text. Snippets never expand in password managers or excluded apps.",
        words: "snippet text expansion keyword abbreviation",
      },
    ],
  },
  {
    id: "privacy",
    title: "Privacy",
    articles: [
      {
        id: "uploads",
        q: "Does Hopper upload my data?",
        a: "No. Hopper reads, stores and searches everything on your Mac. The one exception is Online Lookups: for Hulu and Netflix links it fetches the public page, signed out, to name the episode. Turn it off in Settings ▸ Privacy ▸ Online Lookups.",
        words: "privacy cloud server upload data local on-device",
        link: { label: "What stays on your Mac", href: "/features/on-device" },
      },
      {
        id: "exclude-app",
        q: "How do I stop Hopper from seeing an app?",
        a: "Exclude it in Settings ▸ Privacy. An excluded app is never indexed or recorded, and won’t show up in search, Back or Clipboard History.",
        words: "exclude block hide ignore app",
        link: { label: "Every privacy control", href: "/features/privacy-controls" },
      },
      {
        id: "private-windows",
        q: "Does Hopper see private or incognito windows?",
        a: "No. Incognito and private browser windows never reach Hopper.",
        words: "incognito private browsing",
      },
    ],
  },
  {
    id: "waitlist",
    title: "Waitlist & testing",
    articles: [
      {
        id: "get-hopper",
        q: "How do I get Hopper?",
        a: "Hopper is in private testing. Join the waitlist and we’ll email you when there’s a build for you. One email when Hopper is ready, nothing else.",
        words: "download install beta access invite release",
        link: { label: "Join the waitlist", href: "/#join" },
      },
      {
        id: "leave-waitlist",
        q: "How do I leave the waitlist?",
        a: `Use the unsubscribe link in any email from us, or email ${site.contact} and we’ll remove you.`,
        words: "unsubscribe remove delete email",
      },
      {
        id: "feedback",
        q: "How do I report a bug or suggest something?",
        a: `Email ${site.contact}. We’d love to hear it.`,
        words: "bug report feedback feature request idea contact",
      },
    ],
  },
];
