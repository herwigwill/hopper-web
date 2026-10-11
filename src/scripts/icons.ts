/** Line icons for the features launcher and hub (24×24, currentColor). */
const i = (d: string) => `<svg class="fi" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;

export const featureIcons: Record<string, string> = {
  search: i('<circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/>'),
  navigation: i('<path d="M10 6 4 12l6 6"/><path d="M4 12h11a5 5 0 0 1 0 10h-2"/>'),
  back: i('<path d="M10 6 4 12l6 6"/><path d="M4 12h11a5 5 0 0 1 0 10h-2"/>'),
  agents: i('<path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><circle cx="12" cy="12" r="4.5"/>'),
  windows: i('<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M12 4v16M12 12h9"/>'),
  toolkit: i('<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>'),
  snippets: i('<path d="M8 7 3 12l5 5M16 7l5 5-5 5"/>'),
  clipboard: i('<rect x="5" y="4" width="14" height="17" rx="2.5"/><path d="M9 4V3h6v1M9 10h6M9 14h4"/>'),
  calculator: i('<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M8.5 7.5h7M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01"/>'),
  emoji: i('<circle cx="12" cy="12" r="8.5"/><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0M9 9.5h.01M15 9.5h.01"/>'),
  menus: i('<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 8.5h18M7 12.5h6M7 16h9"/>'),
  screenshots: i('<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"/><path d="M8 10.5h8M8 13.5h5"/>'),
  quicklinks: i('<path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/>'),
  notes: i('<path d="M5 4h10l4 4v12H5z"/><path d="M15 4v4h4M8.5 12h7M8.5 15.5h5"/>'),
};
