/**
 * Everything the page claims about Hopper, and the demo data its recreations run on.
 *
 * Product facts must stay true to hopper-native (docs/STATUS.md, docs/DECISIONS.md). If a feature changes there,
 * change it here: hopper-native/docs/SITE.md points to this file.
 *
 * Demo data is a made-up but realistic workday. No real people, companies or private data.
 */

export const site = {
  name: "Hopper",
  url: "https://addhopper.com",
  title: "Hopper — Never lose your place on your Mac",
  description:
    "Hopper takes you straight back to the tab, doc, chat or coding session you were in, whatever app it's in. Join the waitlist for the Mac app.",
  minimumOS: "macOS 26",
  // Hopper's default shortcut (ADR-045).
  shortcut: ["⌘", "Space"],
  // Back / Forward (ADR-026).
  back: ["⌃", "⌥", "←"],
  forward: ["⌃", "⌥", "→"],
  contact: "hello@addhopper.com",
} as const;

/**
 * App icons. Real icons were copied from the apps installed on a Mac (scripts note the source in ASSETS.md);
 * where an app wasn't installed, the tile is built from the brand's official mark (scripts/make-icons.mjs).
 * Only apps Hopper actually reads appear on the page (Providers.swift).
 */
export const apps = {
  chrome: { name: "Google Chrome", short: "Chrome", icon: "/icons/chrome.webp" },
  safari: { name: "Safari", short: "Safari", icon: "/icons/safari.webp" },
  slack: { name: "Slack", short: "Slack", icon: "/icons/slack.webp" },
  notion: { name: "Notion", short: "Notion", icon: "/icons/notion.webp" },
  obsidian: { name: "Obsidian", short: "Obsidian", icon: "/icons/obsidian.webp" },
  notes: { name: "Notes", short: "Notes", icon: "/icons/notes.webp" },
  messages: { name: "Messages", short: "Messages", icon: "/icons/messages.webp" },
  reminders: { name: "Reminders", short: "Reminders", icon: "/icons/reminders.webp" },
  music: { name: "Music", short: "Music", icon: "/icons/music.webp" },
  claude: { name: "Claude", short: "Claude", icon: "/icons/claude.webp" },
  cursor: { name: "Cursor", short: "Cursor", icon: "/icons/cursor.webp" },
  codex: { name: "Codex", short: "Codex", icon: "/icons/codex.webp" },
  vscode: { name: "Visual Studio Code", short: "VS Code", icon: "/icons/vscode.webp" },
  terminal: { name: "Terminal", short: "Terminal", icon: "/icons/terminal.webp" },
} as const;

export type AppId = keyof typeof apps;

/** Kinds as Hopper's rows label them (PlaceKind.swift), in plain words. */
export type Kind = "Tab" | "Page" | "Session" | "Channel" | "Conversation" | "Note" | "Agent" | "Window" | "Reminder" | "Playlist" | "Folder";

export type Place = {
  id: string;
  app: AppId;
  title: string;
  subtitle: string;
  kind: Kind;
  /** Extra words the demo's search matches on, the way Hopper matches URLs, folders and app names. */
  words?: string;
  /** Which recreated window comes forward when this place is picked in the hero. */
  window?: "notion" | "chrome" | "claude" | "slack";
  status?: "Needs You" | "Working" | "Done";
};

/** The demo Mac's places. Order = the Recent list (newest first) shown when nothing is typed (ADR-030). */
export const places: Place[] = [
  { id: "claude-auth", app: "claude", title: "Fix auth token refresh", subtitle: "api", kind: "Session", words: "claude code login jwt", window: "claude", status: "Working" },
  { id: "chrome-checkout", app: "chrome", title: "Checkout funnel, Q4", subtitle: "analytics.internal", kind: "Tab", words: "dashboard conversion", window: "chrome" },
  { id: "slack-launch", app: "slack", title: "#launch", subtitle: "Northwind", kind: "Channel", words: "release", window: "slack" },
  { id: "notion-q4", app: "notion", title: "Q4 Launch Plan", subtitle: "Product", kind: "Page", words: "roadmap plan", window: "notion" },
  { id: "cursor-billing", app: "cursor", title: "Refactor billing webhooks", subtitle: "web", kind: "Agent", words: "stripe payments", status: "Working" },
  { id: "messages-maya", app: "messages", title: "Maya Okafor", subtitle: "iMessage", kind: "Conversation", words: "text" },
  { id: "notes-interview", app: "notes", title: "Interview questions, design lead", subtitle: "Hiring", kind: "Note", words: "hiring" },
  { id: "chrome-pricing", app: "chrome", title: "Pricing experiments: results", subtitle: "docs.internal", kind: "Tab", words: "price test", window: "chrome" },
  { id: "codex-ratelimit", app: "codex", title: "Add rate limiting to signup", subtitle: "api", kind: "Agent", status: "Working" },
  { id: "obsidian-research", app: "obsidian", title: "Onboarding research", subtitle: "Vault", kind: "Note", words: "user interviews" },
  { id: "reminders-invoice", app: "reminders", title: "Send the September invoice", subtitle: "Today", kind: "Reminder" },
  { id: "vscode-site", app: "vscode", title: "marketing-site", subtitle: "~/code", kind: "Folder", words: "website" },
  { id: "music-focus", app: "music", title: "Deep Focus", subtitle: "Playlist", kind: "Playlist" },
  { id: "safari-flights", app: "safari", title: "Flights to Lisbon", subtitle: "Safari", kind: "Tab", words: "travel trip" },
];

/** The hero's scripted queries, each ending on a different app. */
export const heroScript = [
  { query: "q4 plan", pick: "notion-q4" },
  { query: "auth", pick: "claude-auth" },
  { query: "checkout", pick: "chrome-checkout" },
] as const;

/** The Back moment: where you've been, oldest first. The last is where you are now. */
export const trail = [
  { app: "notion", title: "Q4 Launch Plan", detail: "Notion page" },
  { app: "slack", title: "#launch", detail: "Slack channel" },
  { app: "chrome", title: "Checkout funnel, Q4", detail: "Chrome tab" },
  { app: "cursor", title: "billing/webhooks.ts", detail: "Cursor window" },
  { app: "claude", title: "Fix auth token refresh", detail: "Claude Code session" },
] as const satisfies readonly { app: AppId; title: string; detail: string }[];

/** The Agents moment (ADR-046's Agents tab). Only Claude Code reports Needs You (ADR-006). */
export const agents: Place[] = [
  { id: "a-claude", app: "claude", title: "Fix auth token refresh", subtitle: "api", kind: "Agent", status: "Working" },
  { id: "a-cursor", app: "cursor", title: "Refactor billing webhooks", subtitle: "web", kind: "Agent", status: "Working" },
  { id: "a-codex", app: "codex", title: "Add rate limiting to signup", subtitle: "api", kind: "Agent", status: "Working" },
  { id: "a-claude-2", app: "claude", title: "Write migration for teams table", subtitle: "api", kind: "Agent", status: "Done" },
];

/** The toolkit line. Each is built and in Hopper today (STATUS.md). */
export const toolkit = [
  "Window snapping and layouts",
  "Clipboard history",
  "Snippets that type themselves",
  "Quicklinks",
  "Scratch notes",
  "Emoji and symbols",
  "Search inside your screenshots",
  "Your apps’ own menu commands",
  "A calculator that does units",
];

/** Personal sources are off until switched on (ADR-018); named as onboarding names them. */
export const personalSources = ["Messages", "Notes", "Slack", "Browser history", "Past agent sessions", "Calendar"];

/* ───────────────────────────── Features pages ───────────────────────────── */

/**
 * The features hub's pillars. `href` is set once a pillar has its own page; until then the hub's section is the page.
 * Each `id` is also the section's anchor on /features.
 */
export const pillars = [
  { id: "search", name: "Search", line: "Find anything you had open, in any app.", href: "/features/search" },
  { id: "navigation", name: "Navigation", line: "Back, Forward and Toggle across every app.", href: "/features/navigation" },
  // Hidden for now with its section (pages/features/index.astro).
  // { id: "back", name: "Back & Now Playing", line: "Go back across apps, or to whatever’s making sound." },
  { id: "agents", name: "Agents", line: "Every coding agent, and the one waiting on you.", href: "/features/agents" },
  { id: "windows", name: "Windows", line: "42 window commands, your own sizes and whole layouts.", href: "/features/windows" },
  { id: "toolkit", name: "Toolkit", line: "Clipboard, snippets, notes, emoji, a calculator and more." },
] as const;

/** How many places Hopper reads (STATUS.md: 28 sources in 9 families). */
export const sourceCount = 28;

/**
 * Window commands (HopperCore/Windows/WindowCommand.swift: titles and subtitles verbatim). 42 in all (ADR-052, ADR-055).
 * `demo` says how the recreation runs it: a layout, a move, or a message when it needs something the demo lacks.
 */
export const windowCommands = [
  { id: "left-half", title: "Left Half" },
  { id: "right-half", title: "Right Half" },
  { id: "top-half", title: "Top Half" },
  { id: "bottom-half", title: "Bottom Half" },
  { id: "maximize", title: "Maximize", sub: "Fill the display" },
  { id: "almost-maximize", title: "Almost Maximize", sub: "Nearly fill the display, centered" },
  { id: "maximize-height", title: "Maximize Height", sub: "Full height, same width" },
  { id: "maximize-width", title: "Maximize Width", sub: "Full width, same height" },
  { id: "reasonable-size", title: "Reasonable Size", sub: "A comfortable size in the middle of the display" },
  { id: "center", title: "Center", sub: "Center the window, same size" },
  { id: "restore", title: "Restore", sub: "Put the window back where it was before Hopper moved it" },
  { id: "first-third", title: "First Third" },
  { id: "center-third", title: "Center Third" },
  { id: "last-third", title: "Last Third" },
  { id: "first-two-thirds", title: "First Two Thirds" },
  { id: "last-two-thirds", title: "Last Two Thirds" },
  { id: "first-fourth", title: "First Fourth" },
  { id: "second-fourth", title: "Second Fourth" },
  { id: "third-fourth", title: "Third Fourth" },
  { id: "last-fourth", title: "Last Fourth" },
  { id: "top-left-quarter", title: "Top Left Quarter" },
  { id: "top-right-quarter", title: "Top Right Quarter" },
  { id: "bottom-left-quarter", title: "Bottom Left Quarter" },
  { id: "bottom-right-quarter", title: "Bottom Right Quarter" },
  { id: "top-left-sixth", title: "Top Left Sixth" },
  { id: "top-center-sixth", title: "Top Center Sixth" },
  { id: "top-right-sixth", title: "Top Right Sixth" },
  { id: "bottom-left-sixth", title: "Bottom Left Sixth" },
  { id: "bottom-center-sixth", title: "Bottom Center Sixth" },
  { id: "bottom-right-sixth", title: "Bottom Right Sixth" },
  { id: "move-up", title: "Move Up", sub: "Move the window to the up edge, same size" },
  { id: "move-down", title: "Move Down", sub: "Move the window to the down edge, same size" },
  { id: "move-left", title: "Move Left", sub: "Move the window to the left edge, same size" },
  { id: "move-right", title: "Move Right", sub: "Move the window to the right edge, same size" },
  { id: "toggle-fullscreen", title: "Toggle Fullscreen", sub: "Enter or leave fullscreen" },
  { id: "focus-next-window", title: "Focus Next App Window", sub: "Bring the app's next window to the front" },
  { id: "focus-previous-window", title: "Focus Previous App Window", sub: "Bring the app's previous window to the front" },
  { id: "minimize-on-display", title: "Minimize on This Display", sub: "Minimize every window on the display the window in front is on" },
  { id: "previous-display", title: "Move to Previous Display", sub: "Move the window to the previous display" },
  { id: "next-display", title: "Move to Next Display", sub: "Move the window to the next display" },
  { id: "previous-space", title: "Move to Previous Space", sub: "Move the window to the previous desktop (Space) on its display" },
  { id: "next-space", title: "Move to Next Space", sub: "Move the window to the next desktop (Space) on its display" },
] as const satisfies readonly { id: string; title: string; sub?: string }[];

export type WindowCommandId = (typeof windowCommands)[number]["id"];

/** Extra words root search finds window commands by (WindowCommand.keywords, abridged). "window" finds them all. */
export const windowKeywords: Partial<Record<WindowCommandId, string>> = {
  maximize: "resize zoom fill bigger",
  "almost-maximize": "resize zoom fill bigger",
  "maximize-height": "resize zoom fill bigger",
  "maximize-width": "resize zoom fill bigger",
  "reasonable-size": "resize default size smaller",
  center: "middle",
  "toggle-fullscreen": "fullscreen enter exit zoom",
  restore: "undo reset previous size unsnap",
};

/** The Window Gap menu (ADR-052: 0–128 points; the demo offers four of its values). */
export const windowGaps = [0, 8, 16, 32];

/**
 * Hotkey presets (HopperCore/Windows/HotkeyPreset.swift, ADR-057). Keys as Hopper displays them. Importing says first
 * which of Hopper's own hotkeys it takes: ⌃⌥← / ⌃⌥→ are Back / Forward.
 */
export const hotkeyPresets = [
  {
    id: "rectangle",
    name: "Rectangle",
    note: "Not in Hopper: Make Larger, Make Smaller, Center Two Thirds",
    takes: ["⌃⌥← from Back", "⌃⌥→ from Forward"],
    keys: [
      ["left-half", "⌃⌥←"], ["right-half", "⌃⌥→"], ["top-half", "⌃⌥↑"], ["bottom-half", "⌃⌥↓"],
      ["top-left-quarter", "⌃⌥U"], ["top-right-quarter", "⌃⌥I"], ["bottom-left-quarter", "⌃⌥J"], ["bottom-right-quarter", "⌃⌥K"],
      ["first-third", "⌃⌥D"], ["center-third", "⌃⌥F"], ["last-third", "⌃⌥G"], ["first-two-thirds", "⌃⌥E"], ["last-two-thirds", "⌃⌥T"],
      ["maximize", "⌃⌥↩"], ["maximize-height", "⌃⌥⇧↑"], ["center", "⌃⌥C"], ["restore", "⌃⌥⌫"],
      ["previous-display", "⌃⌥⌘←"], ["next-display", "⌃⌥⌘→"],
    ],
  },
  {
    id: "magnet",
    name: "Magnet",
    note: "Only the hotkeys Magnet documents: Left / Right Half, Maximize, Center",
    takes: ["⌃⌥← from Back", "⌃⌥→ from Forward"],
    keys: [["left-half", "⌃⌥←"], ["right-half", "⌃⌥→"], ["maximize", "⌃⌥↩"], ["center", "⌃⌥C"]],
  },
  {
    id: "spectacle",
    name: "Spectacle",
    note: "Not in Hopper: Make Larger, Make Smaller",
    takes: [],
    keys: [
      ["left-half", "⌥⌘←"], ["right-half", "⌥⌘→"], ["top-half", "⌥⌘↑"], ["bottom-half", "⌥⌘↓"],
      ["top-left-quarter", "⌃⌘←"], ["top-right-quarter", "⌃⌘→"], ["bottom-left-quarter", "⌃⇧⌘←"], ["bottom-right-quarter", "⌃⇧⌘→"],
      ["maximize", "⌥⌘F"], ["maximize-height", "⌃⌥⇧↑"], ["center", "⌥⌘C"], ["restore", "⌃⌥⌫"],
      ["previous-display", "⌃⌥⌘←"], ["next-display", "⌃⌥⌘→"],
    ],
  },
] as const satisfies readonly { id: string; name: string; note: string; takes: readonly string[]; keys: readonly (readonly [WindowCommandId, string])[] }[];

/** Custom window commands' nine anchors (CustomWindowCommand.Anchor), titles verbatim. */
export const anchors = [
  { id: "top-left", title: "Top Left", x: 0, y: 0 },
  { id: "top", title: "Top Center", x: 0.5, y: 0 },
  { id: "top-right", title: "Top Right", x: 1, y: 0 },
  { id: "left", title: "Left Center", x: 0, y: 0.5 },
  { id: "center", title: "Center", x: 0.5, y: 0.5 },
  { id: "right", title: "Right Center", x: 1, y: 0.5 },
  { id: "bottom-left", title: "Bottom Left", x: 0, y: 1 },
  { id: "bottom", title: "Bottom Center", x: 0.5, y: 1 },
  { id: "bottom-right", title: "Bottom Right", x: 1, y: 1 },
] as const;

/**
 * Window layouts for the demo (ADR-056): each window an app and a built-in position; `open` is what it opens first.
 * Windows a layout doesn't name are left alone. The hotkeys are examples of ones you'd set: none are set by default.
 */
export const windowLayouts = [
  {
    id: "focus",
    name: "Deep Work",
    hotkey: "⌃⌥1",
    windows: [
      { app: "cursor", at: "first-two-thirds" },
      { app: "terminal", at: "last-third" },
    ],
  },
  {
    id: "review",
    name: "Launch Review",
    hotkey: "⌃⌥2",
    windows: [
      { app: "notion", at: "left-half" },
      { app: "chrome", at: "top-right-quarter", open: "analytics.internal/checkout" },
      { app: "slack", at: "bottom-right-quarter" },
    ],
  },
  {
    id: "standup",
    name: "Standup",
    hotkey: "⌃⌥3",
    windows: [
      { app: "notion", at: "first-third" },
      { app: "slack", at: "center-third" },
      { app: "claude", at: "last-third" },
    ],
  },
] as const satisfies readonly { id: string; name: string; hotkey: string; windows: readonly { app: AppId; at: WindowCommandId; open?: string }[] }[];

/** Things in the Toolkit, with their demo's example input. All built today (STATUS.md). */
export const snippetExamples = [
  { keyword: ";date", name: "Today’s Date" },
  { keyword: ";shrug", name: "Shrug", text: "¯\\_(ツ)_/¯" },
];

/** The Toolkit on /features: each tile is a small working version (STATUS.md; ADR numbers in the tile scripts). */
export const toolkitTiles = [
  { id: "snippets", title: "Snippets", line: "Type a keyword anywhere and it becomes the text." },
  { id: "clipboard", title: "Clipboard History", line: "Everything you copied, a keystroke away." },
  { id: "calculator", title: "Calculator", line: "Sums and units, right in the search field." },
  { id: "emoji", title: "Emoji & Symbols", line: "Search every emoji by what it means." },
  { id: "menus", title: "Menu Commands", line: "Run the app in front’s own menu items by name." },
  { id: "screenshots", title: "Screenshots", line: "Find a screenshot by the words in it." },
  { id: "quicklinks", title: "Quicklinks", line: "Your searches and links, with blanks to fill in." },
  { id: "notes", title: "Scratch Notes", line: "A Markdown note floating over whatever you’re in." },
] as const;

/** Toggle (ADR-023, ADR-024): a double tap of ⌘ flips between your two most recent apps. */
export const toggleGesture = "⌘⌘";

/**
 * /features/navigation. The four moves (HopperCommands/Timeline/NavigateCommand.swift: titles, subtitles and default
 * keys verbatim; ADR-024…026). Back / Forward / Toggle Tab are place-level, Toggle is app-level.
 */
export const navMoves = [
  { id: "back", title: "Back", sub: "Go to the place you were before", keys: ["⌃", "⌥", "←"] },
  { id: "forward", title: "Forward", sub: "Undo a Back", keys: ["⌃", "⌥", "→"] },
  { id: "toggle", title: "Toggle", sub: "Flip between your two most recent apps", keys: ["⌘", "⌘"] },
  { id: "toggle-tab", title: "Toggle Tab", sub: "Flip between your two most recent tabs, windows or sessions", keys: ["⌥", "⌥"] },
] as const;
export type NavMove = (typeof navMoves)[number]["id"];

/** The demo's places, oldest visit first; the last is where you are. Two Chrome tabs and two Claude Code sessions. */
export const navPlaces = [
  { id: "notion", app: "notion", title: "Q4 Launch Plan", kind: "Notion page" },
  { id: "funnel", app: "chrome", title: "Checkout funnel, Q4", kind: "Chrome tab" },
  { id: "slack", app: "slack", title: "#launch", kind: "Slack channel" },
  { id: "pr", app: "chrome", title: "Pull request #482", kind: "Chrome tab" },
  { id: "auth", app: "claude", title: "Fix auth token refresh", kind: "Claude Code session" },
  { id: "copy", app: "claude", title: "Write onboarding copy", kind: "Claude Code session" },
] as const satisfies readonly { id: string; app: AppId; title: string; kind: string }[];

/**
 * /features/agents (HopperCommands/Agents/AgentsCommands.swift, HopperCore/Model/Place.swift). Agents (⌥Space) groups
 * every agent Needs You / Done / Working / Idle; Done = its turn ended after you last looked, until you look. Next
 * Agent (⌥⌘]) jumps to the one waiting longest, Needs You before Done. Needs You is shown for Claude only (ADR-006:
 * Codex can't report it, Cursor's is approximate).
 */
export const agentGroups = ["Needs You", "Done", "Working", "Idle"] as const;
export type AgentGroup = (typeof agentGroups)[number];
export const agentList = [
  { id: "auth", app: "claude", title: "Fix auth token refresh", where: "api · Claude Code", status: "Needs You", detail: "Waiting for permission", waited: 6 },
  { id: "rate", app: "codex", title: "Add rate limiting to signup", where: "api · Codex", status: "Done", detail: "Finished 4 min ago", waited: 4 },
  { id: "billing", app: "cursor", title: "Refactor billing webhooks", where: "web · Cursor", status: "Working", detail: "", waited: 0 },
  { id: "teams", app: "claude", title: "Write migration for teams table", where: "api · Claude Code", status: "Working", detail: "", waited: 0 },
  { id: "flags", app: "codex", title: "Clean up old feature flags", where: "web · Codex", status: "Idle", detail: "", waited: 0 },
] as const satisfies readonly { id: string; app: AppId; title: string; where: string; status: AgentGroup; detail: string; waited: number }[];

/** What each agent app brings (ADR-060, ADR-061, ADR-063; Agents also reads herdr). */
export const agentApps = [
  { id: "claude-code", app: "claude", name: "Claude Code", line: "Every session, in the Claude app or your terminal. It rises to Needs You the moment it asks for permission or has a question." },
  { id: "claude", app: "claude", name: "Claude", line: "Cloud sessions, chats and Cowork tasks from the Claude app, flagged when one is waiting on your input." },
  { id: "codex", app: "codex", name: "Codex", line: "Threads from the Codex app and terminal, working or done." },
  { id: "cursor", app: "cursor", name: "Cursor", line: "Cursor’s agents, working or done, next to all the others." },
] as const satisfies readonly { id: string; app: AppId; name: string; line: string }[];

/** Past sessions, searchable like anything else (Claude Code and Codex conversations). */
export const pastSessions = [
  { app: "claude", title: "Fix auth token refresh race", where: "api", when: "Today" },
  { app: "codex", title: "Add rate limiting to signup", where: "api", when: "Today" },
  { app: "claude", title: "Migrate auth to the new session store", where: "api", when: "Yesterday" },
  { app: "codex", title: "Write tests for checkout webhooks", where: "web", when: "Tuesday" },
  { app: "claude", title: "Speed up the pricing page build", where: "web", when: "Last week" },
  { app: "codex", title: "Rename teams to workspaces", where: "api", when: "Last week" },
  { app: "claude", title: "Draft the onboarding email copy", where: "marketing", when: "2 weeks ago" },
] as const satisfies readonly { app: AppId; title: string; where: string; when: string }[];

/**
 * The footer's feature index: everything Hopper does, by area (STATUS.md). Items with an `href` link to where the site
 * shows them; the rest are listed for now, pages to come. Not listed: Search by Meaning (off by default), Spaces.
 */
export const featureIndex: { title: string; items: { label: string; href?: string }[] }[] = [
  {
    title: "Search",
    items: [
      { label: "Search Everything", href: "/features/search" },
      { label: "Recent Places", href: "/features/search#recent" },
      { label: "Filter Tabs", href: "/features/search#filter-tabs" },
      { label: "Search the App in Front", href: "/features/search#app-in-front" },
      { label: "Files & Folders", href: "/features/search#files" },
      { label: "Settings Search", href: "/features/search#settings-search" },
      { label: "Your Privacy Choices", href: "/features/search#sources" },
    ],
  },
  {
    title: "Navigation",
    items: [
      { label: "Navigation", href: "/features/navigation" },
      { label: "Back & Forward", href: "/features/navigation#back" },
      { label: "Toggle", href: "/features/navigation#toggle" },
      { label: "Toggle Tab", href: "/features/navigation#toggle-tab" },
      { label: "Places, Not Apps", href: "/features/navigation#places" },
      { label: "History", href: "/features/navigation#history" },
      { label: "Recently Closed", href: "/features/navigation#recently-closed" },
      { label: "Now Playing", href: "/features/navigation#now-playing" },
    ],
  },
  {
    title: "Agents",
    items: [
      { label: "Agents", href: "/features/agents" },
      { label: "Needs You", href: "/features/agents#needs-you" },
      { label: "Next Agent", href: "/features/agents#next-agent" },
      { label: "Past Sessions", href: "/features/agents#past-sessions" },
      { label: "Claude Code", href: "/features/agents#claude-code" },
      { label: "Claude", href: "/features/agents#claude" },
      { label: "Codex", href: "/features/agents#codex" },
      { label: "Cursor", href: "/features/agents#cursor" },
    ],
  },
  {
    title: "Windows",
    items: [
      { label: "Window Management", href: "/features/windows" },
      { label: "Halves, Thirds & Quarters", href: "/features/windows#commands" },
      { label: "Window Gap", href: "/features/windows#commands" },
      { label: "Repeat a Half", href: "/features/windows#repeat" },
      { label: "Custom Window Commands", href: "/features/windows#custom" },
      { label: "Window Layouts", href: "/features/windows#layouts" },
      { label: "Exact Moves & Sizes", href: "/features/windows#exact" },
      { label: "Focus App Windows", href: "/features/windows#focus" },
      { label: "Move to Display", href: "/features/windows#displays" },
      { label: "Stage Manager Support", href: "/features/windows#stage-manager" },
      { label: "Hotkey Presets", href: "/features/windows#presets" },
    ],
  },
  {
    title: "Toolkit",
    items: [
      { label: "Clipboard History", href: "/features#tile-clipboard" },
      { label: "Snippets", href: "/features#tile-snippets" },
      { label: "Quicklinks", href: "/features#tile-quicklinks" },
      { label: "Scratch Notes", href: "/features#tile-notes" },
      { label: "Emoji & Symbols", href: "/features#tile-emoji" },
      { label: "Screenshots", href: "/features#tile-screenshots" },
      { label: "Calculator", href: "/features#tile-calculator" },
      { label: "Menu Commands", href: "/features#tile-menus" },
    ],
  },
  {
    title: "Make It Yours",
    items: [
      { label: "Hotkeys & Gestures", href: "/features/hotkeys" },
      { label: "Privacy Controls", href: "/features/privacy-controls" },
      { label: "On-Device Only", href: "/features/on-device" },
    ],
  },
];

/* ───────────────────────────── Search page ───────────────────────────── */

/**
 * What Hopper reads (STATUS.md: 28 sources in 9 families). `personal` sources are off until switched on (ADR-018),
 * named as onboarding names them.
 */
export type SourceGlyph = "bookmark" | "history" | "sessions" | "contacts" | "calendar" | "apps" | "windows" | "files" | "tv";
export const sourceGroups: { title: string; items: { name: string; icon?: AppId; glyph?: SourceGlyph; personal?: boolean }[] }[] = [
  {
    title: "Browsers",
    items: [{ name: "Chrome tabs", icon: "chrome" }, { name: "Safari tabs", icon: "safari" }, { name: "Bookmarks", glyph: "bookmark" }, { name: "Browser history", glyph: "history", personal: true }],
  },
  {
    title: "Coding agents",
    items: [{ name: "Claude Code", icon: "claude" }, { name: "Codex", icon: "codex" }, { name: "Cursor", icon: "cursor" }, { name: "Past agent sessions", glyph: "sessions", personal: true }],
  },
  {
    title: "Notes & docs",
    items: [{ name: "Notion", icon: "notion" }, { name: "Obsidian", icon: "obsidian" }, { name: "Apple Notes", icon: "notes", personal: true }, { name: "Editor recents", icon: "vscode" }],
  },
  {
    title: "People & plans",
    items: [{ name: "Slack", icon: "slack", personal: true }, { name: "Messages", icon: "messages", personal: true }, { name: "Contacts", glyph: "contacts" }, { name: "Calendar", glyph: "calendar", personal: true }, { name: "Reminders", icon: "reminders" }],
  },
  {
    title: "Your Mac",
    items: [{ name: "Apps", glyph: "apps" }, { name: "Windows", glyph: "windows" }, { name: "Files & folders", glyph: "files" }, { name: "Music", icon: "music" }, { name: "TV", glyph: "tv" }],
  },
];

/** The app tab (ADR-046, ADR-050): the front app's own things, then its menu commands. Shortcuts are the apps' own. */
export const appTabs: Record<"chrome" | "slack" | "notion", { places: Place[]; menus: [string, string, string][] }> = {
  chrome: {
    places: [
      { id: "t-chrome-1", app: "chrome", title: "Checkout funnel, Q4", subtitle: "analytics.internal", kind: "Tab", words: "dashboard" },
      { id: "t-chrome-2", app: "chrome", title: "Pricing experiments: results", subtitle: "docs.internal", kind: "Tab", words: "price" },
      { id: "t-chrome-3", app: "chrome", title: "Pull request #482", subtitle: "github.com", kind: "Tab", words: "pr review" },
      { id: "t-chrome-4", app: "chrome", title: "Stripe webhooks docs", subtitle: "stripe.com", kind: "Tab", words: "billing" },
    ],
    menus: [["Reopen Closed Tab", "File", "⇧⌘T"], ["New Incognito Window", "File", "⇧⌘N"], ["Bookmark This Tab…", "Bookmarks", "⌘D"], ["Developer Tools", "View", "⌥⌘I"]],
  },
  slack: {
    places: [
      { id: "t-slack-1", app: "slack", title: "#launch", subtitle: "Northwind", kind: "Channel", words: "release" },
      { id: "t-slack-2", app: "slack", title: "#design", subtitle: "Northwind", kind: "Channel" },
      { id: "t-slack-3", app: "slack", title: "Sam Ito", subtitle: "Direct message", kind: "Conversation", words: "dm" },
    ],
    menus: [["New Message", "File", "⌘N"], ["Back", "Go", "⌘["], ["Forward", "Go", "⌘]"]],
  },
  notion: {
    places: [
      { id: "t-notion-1", app: "notion", title: "Q4 Launch Plan", subtitle: "Product", kind: "Page", words: "roadmap" },
      { id: "t-notion-2", app: "notion", title: "Meeting notes", subtitle: "Product", kind: "Page" },
      { id: "t-notion-3", app: "notion", title: "Hiring", subtitle: "Team", kind: "Page", words: "design lead" },
    ],
    menus: [["New Page", "File", "⌘N"], ["Toggle Sidebar", "View", "⌘\\"], ["Search", "Edit", "⌘P"]],
  },
};

/** Files Spotlight finds per query (STATUS.md), for the demo. */
export const demoFiles = [
  { name: "September invoice.pdf", where: "~/Documents/Invoices", kind: "PDF" },
  { name: "Invoices", where: "~/Documents", kind: "Folder" },
  { name: "Invoice template.numbers", where: "~/Documents/Templates", kind: "Numbers" },
  { name: "Q4 launch deck.key", where: "~/Desktop", kind: "Keynote" },
  { name: "Launch checklist.md", where: "~/code/marketing-site", kind: "Markdown" },
  { name: "Onboarding interviews", where: "~/Documents/Research", kind: "Folder" },
  { name: "Lisbon itinerary.pdf", where: "~/Downloads", kind: "PDF" },
  { name: "Pricing experiments.csv", where: "~/Downloads", kind: "CSV" },
];

/** Settings search (ADR-049): every setting on every page, found by name; Return goes to it and highlights it. */
/** How each setting above is drawn (the native SettingItem kinds: toggle, choice, action), with option labels from the app. */
export const settingControls: Record<string, { toggle: boolean } | { choice: string } | { action: string }> = {
  Appearance: { choice: "Match macOS" },
  "Esc Key": { choice: "Starts Fresh" },
  "Switch Hotkeys": { action: "Switch to Raycast" },
  "Keep Clipboard History": { toggle: true },
  "Keep Entries For": { choice: "30 days" },
  "Clear Clipboard History": { action: "Clear All…" },
  "Window Gap": { choice: "8 pt" },
  "Repeat a Half": { choice: "½ → ⅔ → ⅓" },
  "Restore Goes Back To": { choice: "Before Hopper first moved it" },
  "Respect Stage Manager": { toggle: true },
  "Expand Keywords": { toggle: true },
  Expand: { choice: "After a space" },
  "Expand Within Words": { toggle: false },
  "Recognize Text": { toggle: true },
  "Column Count": { choice: "4" },
  "Primary Action": { choice: "Paste" },
  "Float Above Other Windows": { toggle: true },
  "Show Format Bar": { toggle: true },
  "Keep Deleted Notes For": { choice: "30 days" },
  "Skin Tone": { choice: "✋" },
  "Show in Search": { toggle: true },
  "Reset Frequently Used": { action: "Reset…" },
  "Excluded Apps": { action: "Edit…" },
};

export const settingsPages = [
  { page: "General", rows: ["Appearance", "Esc Key", "Switch Hotkeys"] },
  { page: "Clipboard History", rows: ["Keep Clipboard History", "Keep Entries For", "Clear Clipboard History"] },
  { page: "Window Management", rows: ["Window Gap", "Repeat a Half", "Restore Goes Back To", "Respect Stage Manager"] },
  { page: "Snippets", rows: ["Expand Keywords", "Expand", "Expand Within Words"] },
  { page: "Screenshots", rows: ["Recognize Text", "Column Count", "Primary Action"] },
  { page: "Scratch Notes", rows: ["Float Above Other Windows", "Show Format Bar", "Keep Deleted Notes For"] },
  { page: "Emoji & Symbols", rows: ["Skin Tone", "Show in Search", "Reset Frequently Used"] },
  { page: "Privacy", rows: ["Excluded Apps"] },
];

/* ───────────────────────────── Compare page ───────────────────────────── */

/**
 * /compare: Hopper next to Raycast and Alfred. Hopper's column from STATUS.md (2026-10-10; Colors ADR-067). Raycast's
 * from raycast.com/pricing (Free vs Pro) and its manual (Screenshots, Window Management); Color Picker and GIF Search are
 * free store extensions. Alfred's from alfredapp.com/help/powerpack (Clipboard, File Navigation, Contacts, Music,
 * Themes, Workflows are Powerpack) and /help/features/snippets (Powerpack); window management, colors, GIFs and AI
 * come only from third-party workflows, which need the Powerpack. Recheck both pricing pages before changing a cell.
 *
 * `yes` is built into Hopper (its pricing isn't set, so Hopper's cells never say Free). `free` / `paid` are the rival's
 * plans, `ext` a free add-on from the rival's store, `no` not available.
 */
export const compareChecked = "October 10, 2026";
export type CompareStatus = "yes" | "free" | "paid" | "ext" | "no";
export type CompareCell = { s: CompareStatus; note?: string };
export const rivals = [
  { id: "raycast", name: "Raycast", paid: "Pro", price: "Free; Pro is $8 a month, billed yearly ($10 monthly)" },
  { id: "alfred", name: "Alfred", paid: "Powerpack", price: "Free; the Powerpack is £34 once (£59 with lifetime upgrades)" },
] as const;
export type RivalId = (typeof rivals)[number]["id"];

const pw: CompareCell = { s: "paid", note: "Third-party workflow" };

export const compareGroups: {
  id: string;
  title: string;
  rows: { name: string; hopper: CompareCell; raycast: CompareCell; alfred: CompareCell }[];
}[] = [
  {
    id: "get-back",
    title: "Get back to where you were",
    rows: [
      { name: "Back and Forward across apps", hopper: { s: "yes", note: "To the tab or session, not just the app" }, raycast: { s: "no" }, alfred: { s: "no" } },
      { name: "Toggle between your last two apps or tabs", hopper: { s: "yes", note: "Double tap ⌘ or ⌥" }, raycast: { s: "no" }, alfred: { s: "no" } },
      { name: "Recently closed tabs and windows", hopper: { s: "yes" }, raycast: { s: "no" }, alfred: { s: "no" } },
      { name: "Coding agents, sorted by who needs you", hopper: { s: "yes", note: "Claude Code, Codex, Cursor" }, raycast: { s: "no" }, alfred: { s: "no" } },
      { name: "Jump to whatever’s making sound", hopper: { s: "yes", note: "Now Playing" }, raycast: { s: "no", note: "Music controls only" }, alfred: { s: "no", note: "Music controls, Powerpack" } },
    ],
  },
  {
    id: "search",
    title: "Search",
    rows: [
      { name: "Apps, files and a calculator", hopper: { s: "yes" }, raycast: { s: "free" }, alfred: { s: "free" } },
      { name: "Quicklinks and custom web searches", hopper: { s: "yes" }, raycast: { s: "free" }, alfred: { s: "free" } },
      { name: "Open browser tabs", hopper: { s: "yes", note: "Chrome and Safari" }, raycast: { s: "free", note: "With its browser extension" }, alfred: pw },
      { name: "Inside Slack, Notion, Notes and Messages", hopper: { s: "yes", note: "One search over all of them" }, raycast: { s: "ext", note: "One extension per app" }, alfred: pw },
      { name: "Past coding sessions", hopper: { s: "yes", note: "Claude Code and Codex" }, raycast: { s: "no" }, alfred: { s: "no" } },
      { name: "The app in front’s menu commands", hopper: { s: "yes" }, raycast: { s: "free" }, alfred: pw },
      { name: "Screenshots, by the words in them", hopper: { s: "yes" }, raycast: { s: "free" }, alfred: { s: "no" } },
      { name: "Search by meaning, on your Mac", hopper: { s: "yes", note: "Off until you turn it on" }, raycast: { s: "no" }, alfred: { s: "no" } },
    ],
  },
  {
    id: "toolkit",
    title: "Toolkit",
    rows: [
      { name: "Clipboard history", hopper: { s: "yes" }, raycast: { s: "free", note: "3 months; unlimited on Pro" }, alfred: { s: "paid" } },
      { name: "Snippets that expand as you type", hopper: { s: "yes" }, raycast: { s: "free" }, alfred: { s: "paid" } },
      { name: "Emoji and symbols", hopper: { s: "yes" }, raycast: { s: "free" }, alfred: { s: "paid", note: "As a snippet pack" } },
      { name: "Floating notes", hopper: { s: "yes", note: "Scratch Notes" }, raycast: { s: "free", note: "5 notes; unlimited on Pro" }, alfred: { s: "no" } },
      { name: "Color picker", hopper: { s: "yes", note: "Pick, organize and convert" }, raycast: { s: "ext" }, alfred: pw },
      { name: "GIF search", hopper: { s: "no", note: "Not yet" }, raycast: { s: "ext" }, alfred: pw },
    ],
  },
  {
    id: "windows",
    title: "Windows",
    rows: [
      { name: "Halves, thirds, quarters and more", hopper: { s: "yes", note: "42 commands" }, raycast: { s: "free" }, alfred: pw },
      { name: "Your own window sizes", hopper: { s: "yes" }, raycast: { s: "paid" }, alfred: pw },
      { name: "Layouts of several apps on one key", hopper: { s: "yes" }, raycast: { s: "paid" }, alfred: pw },
      { name: "Import Rectangle, Magnet or Spectacle keys", hopper: { s: "yes" }, raycast: { s: "no" }, alfred: { s: "no" } },
    ],
  },
  {
    id: "beyond",
    title: "Beyond the launcher",
    rows: [
      { name: "AI chat and AI commands", hopper: { s: "no" }, raycast: { s: "paid" }, alfred: { s: "paid", note: "With your own OpenAI key" } },
      { name: "Extension store", hopper: { s: "no", note: "Not yet" }, raycast: { s: "free", note: "Thousands of extensions" }, alfred: { s: "paid", note: "Workflows" } },
      { name: "Sync between Macs", hopper: { s: "no" }, raycast: { s: "paid" }, alfred: { s: "paid", note: "Through your own Dropbox or iCloud" } },
      { name: "Custom themes", hopper: { s: "no", note: "Light and dark" }, raycast: { s: "paid" }, alfred: { s: "paid" } },
      { name: "Translator and dictation", hopper: { s: "no" }, raycast: { s: "paid" }, alfred: { s: "no" } },
      { name: "Shared snippets and quicklinks for teams", hopper: { s: "no" }, raycast: { s: "free", note: "Up to 30 each; unlimited on Teams Pro" }, alfred: { s: "no" } },
      { name: "Windows and iPhone apps", hopper: { s: "no", note: "Mac only" }, raycast: { s: "free" }, alfred: { s: "no", note: "Mac only" } },
    ],
  },
];
