import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { watchConsole } from "./helpers";

const pages = ["/features", "/features/search", "/features/navigation", "/features/agents", "/features/windows", "/features/hotkeys", "/features/privacy-controls", "/features/on-device", "/compare"];

test.describe("features pages", () => {
  for (const path of pages) {
    test(`${path} loads with no console errors`, async ({ page }) => {
      const problems = watchConsole(page);
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      for (let y = 0; y < 14; y++) {
        await page.mouse.wheel(0, 900);
        await page.waitForTimeout(120);
      }
      expect(problems).toEqual([]);
    });

    test(`${path} has no serious accessibility violations`, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page } as never).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
      const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
    });

    test(`${path} has no serious accessibility violations with reduced motion`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      const results = await new AxeBuilder({ page } as never).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      expect(results.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => v.id)).toEqual([]);
    });

    test(`${path} never scrolls sideways`, async ({ page }) => {
      for (const width of [375, 768, 1280, 1728]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(0);
      }
    });

    test(`${path} doesn't shift on load`, async ({ page }) => {
      await page.goto(path);
      const cls = await page.evaluate(
        () =>
          new Promise<number>((resolve) => {
            let total = 0;
            new PerformanceObserver((list) => {
              for (const e of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) if (!e.hadRecentInput) total += e.value;
            }).observe({ type: "layout-shift", buffered: true });
            setTimeout(() => resolve(total), 2500);
          }),
      );
      expect(cls).toBeLessThanOrEqual(0.1);
    });
  }

  test("the header links to Features and marks it current there", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Features" }).click();
    await expect(page).toHaveURL(/\/features$/);
    await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Features" })).toHaveAttribute("aria-current", "page");
  });

  test("the header's icon goes home from every page, current on the landing page", async ({ page }) => {
    await page.goto("/");
    const home = page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Hopper home" });
    await expect(home).toHaveAttribute("aria-current", "page");
    await page.goto("/features/navigation");
    await expect(home).not.toHaveAttribute("aria-current", "page");
    await home.click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("pages opt into the page hop", async ({ page, request }) => {
    expect((await request.get("/hop.js")).status()).toBe(200);
    await page.goto("/features");
    const hasHop = await page.evaluate(() =>
      [...document.styleSheets].some((s) => [...s.cssRules].some((r) => r.cssText.includes("view-transition") && r.cssText.includes("navigation"))),
    );
    expect(hasHop).toBe(true);
  });
});

test.describe("features hub", () => {
  test("the features launcher hops to a section", async ({ page }) => {
    await page.goto("/features");
    const field = page.getByRole("combobox", { name: "Search Hopper’s features" });
    await field.click();
    await field.fill("emoji");
    await expect(page.locator("#hh-lx .lx-row").first()).toContainText("Emoji & Symbols");
    await field.press("Enter");
    await expect(page).toHaveURL(/#tile-emoji$/);
    await expect(page.locator("#tile-emoji")).toBeFocused();
  });

  test("the features launcher opens a feature's page", async ({ page }) => {
    await page.goto("/features");
    const field = page.getByRole("combobox", { name: "Search Hopper’s features" });
    await field.click();
    await field.fill("windows");
    await field.press("Enter");
    await expect(page).toHaveURL(/\/features\/windows$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Every window");
  });

  test("search lights up the apps behind the results", async ({ page }) => {
    await page.goto("/features");
    const field = page.locator("#ps-lx-q");
    await page.locator("#ps-lx").click();
    await field.fill("maya");
    await expect(page.locator("#ps-lx .lx-row").first()).toContainText("Maya Okafor");
    await expect(page.locator('.wall li[data-app="messages"]')).toHaveClass(/hit/);
    await field.press("Enter");
    await expect(page.locator("[data-ps-live]")).toHaveText("Opened Maya Okafor in Messages.");
  });

  // The Back & Now Playing section is hidden for now (pages/features/index.astro).
  test.skip("Now Playing jumps to the sound, and asks when two things play", async ({ page }) => {
    await page.goto("/features");
    await page.getByRole("button", { name: "Now Playing" }).click();
    await expect(page.locator("[data-np-screen]")).toHaveAttribute("data-front", "chrome");
    await page.getByRole("button", { name: /Deep Focus/ }).click();
    await page.getByRole("button", { name: "Now Playing" }).click();
    await expect(page.locator("[data-np-pick]")).toBeVisible();
    await page.getByRole("button", { name: /Recording/ }).click();
    await page.getByRole("button", { name: /Deep Focus/ }).click();
    await page.getByRole("button", { name: "Now Playing" }).click();
    await expect(page.locator("[data-np-say]")).toContainText("(Paused)");
  });

  test("Next Agent steps through the agents", async ({ page }) => {
    await page.goto("/features");
    await page.getByRole("button", { name: "Next Agent" }).click();
    await expect(page.locator("[data-pa-live]")).not.toBeEmpty();
    await expect(page.locator('#pa-lx .lx-row[aria-selected="true"]')).toHaveCount(1);
  });

  test("the toolkit tiles work", async ({ page }) => {
    await page.goto("/features");
    await page.locator("#calc-in").fill("72 f in c");
    await expect(page.locator("[data-calc-out]")).toHaveText("22.2222 °C");
    await page.locator("#calc-in").fill("(1200 + 340) * 12");
    await expect(page.locator("[data-calc-out]")).toHaveText("18,480");

    await page.locator("#sn-in").pressSequentially("well ;shrug");
    await expect(page.locator("#sn-in")).toHaveValue("well ¯\\_(ツ)_/¯");

    await page.locator("#em-in").fill("salute");
    await expect(page.locator("[data-em-grid] button")).toHaveCount(2);

    await page.locator("#mn-in").fill("hide sidebar");
    await expect(page.locator("[data-mn-list] button").first()).toContainText("Hide Sidebar");
    await page.locator("#mn-in").press("Enter");
    await expect(page.locator("[data-mn-out]")).toHaveText("Chose View ▸ Hide Sidebar in Safari.");

    await page.locator("#ss-in").fill("gate");
    await expect(page.locator(".shot.hit")).toHaveCount(1);

    await page.getByRole("button", { name: /Copy Pull request/ }).click();
    await expect(page.locator("[data-hist] li")).toHaveCount(1);

    await page.locator("#nt-in").fill("[] Book flights");
    await page.locator("#nt-in").press("Enter");
    await expect(page.locator("[data-note] .task")).toHaveCount(3);
  });
});

test.describe("windows page", () => {
  test("a typed command moves the window in front, and repeats step", async ({ page }) => {
    await page.goto("/features/windows");
    const field = page.getByRole("combobox", { name: "Try a window command in the demo" });
    await page.locator("#wh-lx .lx-field").click();
    await expect(field).toBeFocused();
    await page.getByRole("radio", { name: /Notion/ }).click();
    await field.fill("left half");
    await field.press("Enter");
    await expect(page.locator("[data-wh-live]")).toHaveText("Left Half: Notion.");
    const notion = page.locator('[data-wh] [data-win="notion"]');
    await expect(notion).toHaveCSS("--w", "0.5000");
    await field.press("Enter");
    await expect(page.locator("[data-wh-live]")).toHaveText("Left Half, ⅔: Notion.");
    await expect(page.getByRole("button", { name: "Play demo" })).toHaveAttribute("aria-pressed", "true");
  });

  test("the window gap applies to windows in a layout", async ({ page }) => {
    await page.goto("/features/windows");
    const field = page.locator("#wh-q");
    await page.locator("#wh-lx .lx-field").click();
    await field.fill("maximize");
    await field.press("Enter");
    await page.getByRole("radio", { name: "16 points" }).click();
    await expect(page.locator('[data-wh] [data-win="chrome"]')).toHaveCSS("--gl", "16");
  });

  test("a command the demo can't show says why", async ({ page }) => {
    await page.goto("/features/windows");
    const field = page.locator("#wh-q");
    await page.locator("#wh-lx .lx-field").click();
    await field.fill("next display");
    await field.press("Enter");
    await expect(page.locator("[data-hud]")).toHaveText("There’s one display in this demo");
  });

  test("halves step ½ → ⅔ → ⅓, or carry on to the next display", async ({ page }) => {
    await page.goto("/features/windows");
    const right = page.locator("[data-rp]").getByRole("button", { name: "Right Half" });
    await right.click();
    await right.click();
    await expect(page.locator("[data-frac]")).toHaveText("⅔");
    await right.click();
    await expect(page.locator("[data-frac]")).toHaveText("⅓");
    await page.getByLabel("Move on to the next display").check();
    await right.click();
    await expect(page.locator("[data-rp-live]")).toHaveText("Left half, one half, on the Studio Display.");
  });

  test("a custom command is checked and summed up as Hopper does", async ({ page }) => {
    await page.goto("/features/windows");
    await page.getByLabel("Width").fill("120%");
    await expect(page.locator("[data-problem]")).toHaveText("Width can be at most 100%");
    await page.getByLabel("Width").fill("60%");
    await page.getByRole("radio", { name: "Left Center" }).check();
    await expect(page.locator("[data-cu-summary]")).toHaveText("60% × 100%, left center");
    await page.getByRole("button", { name: "Video corner" }).click();
    await expect(page.locator("[data-cu-summary]")).toHaveText("480 pt × 300 pt, bottom right, offset -24 pt, -24 pt");
  });

  test("a layout starts the apps it needs and leaves the rest alone", async ({ page }) => {
    await page.goto("/features/windows");
    await page.getByRole("button", { name: /Deep Work/ }).click();
    await expect(page.locator('[data-ly] .slotwin[data-app="cursor"]')).not.toHaveClass(/off/);
    await expect(page.locator("[data-ly-hud]")).toHaveText("Placed 2 of 2 windows");
    await expect(page.locator("[data-ly-live]")).toContainText("4 other windows left alone");
    await page.getByRole("button", { name: "Save Current Layout" }).click();
    await expect(page.getByRole("button", { name: /My Layout/ })).toBeVisible();
  });

  test("importing a preset says what it takes, then its keys work", async ({ page }) => {
    await page.goto("/features/windows");
    const section = page.locator("[data-pr]");
    await section.getByRole("button", { name: "Import…" }).click();
    await expect(section.getByRole("alertdialog")).toContainText("Sets 19 hotkeys for window commands, replacing theirs. Takes ⌃⌥← from Back, ⌃⌥→ from Forward.");
    await section.getByRole("button", { name: "Import", exact: true }).click();
    await expect(section.locator("[data-done]")).toContainText("Imported");
    await section.scrollIntoViewIfNeeded();
    await page.keyboard.press("Control+Alt+KeyD");
    await expect(section.locator("[data-pr-live]")).toHaveText("First Third.");
    await section.getByRole("radio", { name: "Spectacle" }).click();
    await section.getByRole("button", { name: "Import…" }).click();
    await expect(section.getByRole("alertdialog")).not.toContainText("Takes");
  });

  test("the breadcrumb goes back to all features", async ({ page }) => {
    await page.goto("/features/windows");
    await page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: "Features" }).click();
    await expect(page).toHaveURL(/\/features$/);
  });
});

test.describe("windows page extras", () => {
  test("Move Window takes typed values", async ({ page }) => {
    await page.goto("/features/windows");
    const card = page.locator("#exact");
    await card.locator("[data-a]").fill("0");
    await card.locator("[data-b]").fill("0");
    await expect(card.locator("[data-exact-out]")).toHaveText("Moved to 0, 0.");
    await card.getByRole("radio", { name: "Resize Window" }).click();
    await card.locator("[data-a]").fill("50%");
    await expect(card.locator("[data-exact-out]")).toContainText("Resized to 720 ×");
  });

  test("Focus Next App Window steps through the app's windows", async ({ page }) => {
    await page.goto("/features/windows");
    await page.getByRole("button", { name: "Focus Next App Window" }).click();
    await expect(page.locator("[data-focus-out]")).toHaveText("Window 1 of 3 is in front: Checkout funnel, Q4.");
  });

  test("windows move between displays and minimize per display", async ({ page }) => {
    await page.goto("/features/windows");
    await page.locator("#displays").getByRole("button", { name: "Move to Next Display" }).click();
    await expect(page.locator("[data-disp-out]")).toHaveText("Notion moved to the Studio Display, same size, same spot.");
    await page.locator("#displays").getByRole("button", { name: "Minimize on This Display" }).click();
    await expect(page.locator("[data-disp-out]")).toContainText("Minimized 2 windows on the Studio Display. The other display wasn’t touched.");
  });
});

test.describe("search page", () => {
  test("the hero search works", async ({ page }) => {
    await page.goto("/features/search");
    await page.locator("#sh-lx").click();
    await page.locator("#sh-lx-q").fill("maya");
    await page.locator("#sh-lx-q").press("Enter");
    await expect(page.locator("[data-sh-live]")).toHaveText("Opened Maya Okafor in Messages.");
  });

  test("Tab moves between filters, and the app tab shows that app and its menus", async ({ page }) => {
    await page.goto("/features/search");
    const field = page.locator("#st-q");
    await field.click();
    await field.press("Tab");
    await expect(page.getByRole("tab", { name: "Chrome" })).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#st-list")).toContainText("Reopen Closed Tab");
    await page.getByRole("radio", { name: "Slack" }).click();
    await expect(page.locator("#st-list")).toContainText("#design");
    await field.fill("new");
    await expect(page.locator("#st-list .lx-row")).toHaveCount(1);
    await field.press("Tab");
    await expect(page.getByRole("tab", { name: "Agents" })).toHaveAttribute("aria-selected", "true");
    await field.press("Tab");
    await expect(field).not.toBeFocused();
  });

  test("files and settings are found by name", async ({ page }) => {
    await page.goto("/features/search");
    await page.locator("[data-fq]").fill("launch");
    await expect(page.locator("[data-flist] .lx-row")).toHaveCount(2);
    await page.locator("[data-sq]").fill("stage");
    await page.locator("[data-sq]").press("Enter");
    await expect(page.locator("[data-sf-out]")).toHaveText("Opened Window Management and highlighted Respect Stage Manager.");
  });

  test("personal sources start off and switch on", async ({ page }) => {
    await page.goto("/features/search");
    const sw = page.getByRole("switch", { name: "Messages" });
    await expect(sw).toHaveAttribute("aria-checked", "false");
    await sw.click();
    await expect(sw).toHaveAttribute("aria-checked", "true");
  });

  test("every search link in the footer lands on a section", async ({ page }) => {
    await page.goto("/features/search");
    const hrefs = await page.getByRole("navigation", { name: "All features" }).locator('a[href^="/features/search"]').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).hash));
    expect(hrefs.length).toBeGreaterThanOrEqual(6);
    for (const h of hrefs.filter(Boolean)) expect(await page.locator(h).count(), h).toBe(1);
  });
});

test.describe("navigation page", () => {
  test("Back walks places, Forward undoes it, Toggle flips apps and Toggle Tab flips sessions", async ({ page }) => {
    await page.goto("/features/navigation");
    const say = page.locator("[data-nh-say]");
    const here = page.locator("[data-trail] li.here");
    await page.locator('[data-move="back"]').click();
    await expect(say).toHaveText(/^Back: Fix auth token refresh/);
    await page.locator('[data-move="back"]').click();
    await expect(here).toContainText("Pull request #482");
    await expect(page.locator(".win.is-front")).toHaveAttribute("data-app", "chrome");
    await page.locator('[data-move="forward"]').click();
    await expect(here).toContainText("Fix auth token refresh");
    await page.locator('[data-move="toggle"]').click();
    await expect(say).toHaveText(/^Toggle: Pull request #482/);
    await page.locator('[data-move="toggle-tab"]').click();
    await expect(say).toHaveText(/^Toggle Tab: Fix auth token refresh/);
  });

  test("the real keys move too", async ({ page }) => {
    await page.goto("/features/navigation");
    await page.locator(".stage").scrollIntoViewIfNeeded();
    await page.keyboard.press("Control+Alt+ArrowLeft");
    await expect(page.locator("[data-nh-say]")).toHaveText(/^Back: Fix auth token refresh/);
    await page.keyboard.press("Alt");
    await page.keyboard.press("Alt");
    await expect(page.locator("[data-nh-say]")).toHaveText(/^Toggle Tab: Write onboarding copy/);
  });

  test("places vs apps, recently closed and now playing", async ({ page }) => {
    await page.goto("/features/navigation");
    await page.locator("[data-pl-go]").click();
    await expect(page.locator('[data-lands="apps"]')).toHaveText("Lands in Chrome, on Pull request #482.");
    await expect(page.locator('[data-lands="places"]')).toContainText("Fix auth token refresh");

    await page.getByRole("button", { name: "Close Flights" }).click();
    await expect(page.locator("[data-closed] li")).toHaveCount(2);
    await page.locator('[data-reopen="Flights"]').click();
    await expect(page.getByRole("button", { name: "Close Flights" })).toBeVisible();

    await page.locator("[data-np-go]").click();
    await expect(page.locator("[data-np-out]")).toHaveText("Jumped to Design review recording in its Chrome tab.");
    await page.getByRole("button", { name: "Play Deep Focus" }).click();
    await page.locator("[data-np-go]").click();
    await expect(page.locator("[data-np-pick] li")).toHaveCount(2);
    await page.getByRole("button", { name: "Pause Design review recording" }).click();
    await page.getByRole("button", { name: "Pause Deep Focus" }).click();
    await page.locator("[data-np-go]").click();
    await expect(page.locator("[data-np-out]")).toContainText("Deep Focus in Music, paused");
  });

  test("every navigation link in the footer lands on a section", async ({ page }) => {
    await page.goto("/features/navigation");
    const hrefs = await page.getByRole("navigation", { name: "All features" }).locator('a[href^="/features/navigation"]').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).hash));
    expect(hrefs.length).toBeGreaterThanOrEqual(7);
    for (const h of hrefs.filter(Boolean)) expect(await page.locator(h).count(), h).toBe(1);
  });
});

test.describe("agents page", () => {
  test("clicking an agent goes to it: Needs You goes back to work, Done turns Idle", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/features/agents");
    await expect(page.locator("[data-badge]")).toHaveText("1");
    await page.locator('[data-agent="auth"]').click();
    await expect(page.locator('[data-agent="auth"] .lx-status')).toHaveText("Working");
    await expect(page.locator("[data-badge]")).toBeHidden();
    await page.locator('[data-agent="rate"]').click();
    await expect(page.locator('[data-agent="rate"] .lx-status')).toHaveText("Idle");
  });

  test("Next Agent steps through who's waiting, then past sessions are searchable", async ({ page }) => {
    await page.goto("/features/agents");
    const go = page.locator("[data-na-go]");
    await go.click();
    await expect(page.locator("[data-win-title]")).toHaveText("Terminal · api — claude");
    await go.click();
    await go.click();
    await expect(page.locator("[data-win-title]")).toHaveText("Codex");
    await page.locator("[data-ps-q]").fill("checkout");
    await expect(page.locator("[data-ps-list] .lx-row")).toHaveCount(1);
  });

  test("every agents link in the footer lands on a section", async ({ page }) => {
    await page.goto("/features/agents");
    const hrefs = await page.getByRole("navigation", { name: "All features" }).locator('a[href^="/features/agents"]').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).hash));
    expect(hrefs.length).toBeGreaterThanOrEqual(7);
    for (const h of hrefs.filter(Boolean)) expect(await page.locator(h).count(), h).toBe(1);
  });
});

test.describe("compare page", () => {
  test("compare: the footer's rival link picks the column, and Only where they differ hides matching rows", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Compare" }).click();
    await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Compare" })).toHaveAttribute("aria-current", "page");
    await page.goto("/compare#alfred");
    await expect(page.getByRole("radio", { name: "Alfred" })).toHaveAttribute("aria-checked", "true");
    await expect(page.getByRole("columnheader", { name: "Raycast" })).toBeHidden();
    await expect(page.getByRole("columnheader", { name: "Alfred" })).toBeVisible();
    await page.getByRole("radio", { name: "Raycast" }).click();
    await expect(page).toHaveURL(/#raycast$/);
    const same = page.getByRole("row", { name: /Apps, files and a calculator/ });
    await expect(same).toBeVisible();
    await page.getByRole("switch", { name: "Only where they differ" }).click();
    await expect(same).toBeHidden();
    await expect(page.getByRole("row", { name: /Back and Forward across apps/ })).toBeVisible();
  });
});
