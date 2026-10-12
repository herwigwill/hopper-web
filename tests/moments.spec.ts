import { test, expect } from "@playwright/test";

test.describe("hero demo", () => {
  test("a visitor can search and hop to a result", async ({ page }) => {
    await page.goto("/");
    const field = page.getByRole("combobox", { name: "Try a search in the demo" });
    await page.locator("#hero-lx").click();
    await expect(field).toBeFocused();
    await field.fill("maya");
    await expect(page.locator("#hero-lx .lx-row").first()).toContainText("Maya Okafor");
    await field.press("Enter");
    await expect(page.locator('[data-win="other"]')).toHaveClass(/is-front/);
    await expect(page.locator("[data-other-name]")).toHaveText("Maya Okafor");
    await expect(page.getByRole("button", { name: /Search again/ })).toBeVisible();
    await expect(page.locator("[data-hero-live]")).toHaveText("Opened Maya Okafor in Messages.");
  });

  test("arrow keys move the selection and Enter opens the right window", async ({ page }) => {
    await page.goto("/");
    await page.locator("#hero-lx").click();
    const field = page.getByRole("combobox", { name: "Try a search in the demo" });
    await field.fill("launch");
    await field.press("ArrowDown");
    const selected = page.locator('#hero-lx .lx-row[aria-selected="true"]');
    await expect(selected).toHaveCount(1);
    await expect(field).toHaveAttribute("aria-activedescendant", (await selected.getAttribute("id"))!);
  });

  test("the demo can be paused", async ({ page }) => {
    await page.goto("/");
    const pause = page.getByRole("button", { name: "Pause demo" });
    await expect(pause).toHaveAttribute("aria-pressed", "false");
    await pause.click();
    await expect(page.getByRole("button", { name: "Play demo" })).toHaveAttribute("aria-pressed", "true");
  });

  test("the moving wallpaper loads in view and holds when the demo is paused", async ({ page }) => {
    await page.goto("/");
    const wallpaper = page.locator("[data-stage] [data-banner-video]");
    await expect.poll(() => wallpaper.evaluate((v: HTMLVideoElement) => v.src)).toContain("/banners/subtle.mp4");
    await page.getByRole("button", { name: "Pause demo" }).click();
    await expect(wallpaper).toHaveAttribute("data-hold");
    expect(await wallpaper.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  });

  test("with reduced motion it doesn't autoplay and shows a complete frame", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.waitForTimeout(3000);
    await expect(page.locator("#hero-lx [data-text]")).toHaveText("q4 plan");
    await expect(page.locator('[data-stage]')).toHaveAttribute("data-open", "true");
    // The wallpaper stays a still: the loop isn't even downloaded.
    expect(await page.locator("[data-stage] [data-banner-video]").evaluate((v: HTMLVideoElement) => v.src)).toBe("");
  });
});

test.describe("back moment", () => {
  test("the detour plays, then Back retraces it place by place", async ({ page }) => {
    await page.goto("/");
    await page.locator("[data-back-stage]").scrollIntoViewIfNeeded();
    const live = page.locator("[data-back-live]");
    await expect(live).toHaveText(/^Four places later\./, { timeout: 12000 });
    const back = page.getByRole("button", { name: "Back", exact: true });
    const forward = page.getByRole("button", { name: "Forward", exact: true });
    await expect(forward).toBeDisabled();
    await back.click();
    await expect(live).toHaveText("Back to Pull request #482, in Chrome.");
    await back.click();
    // Same app, other tab: Back goes to places, not apps.
    await expect(live).toHaveText("Back to Checkout funnel, Q4. Same Chrome window, the tab before.");
    await expect(page.locator('[data-back] [data-app="chrome"]')).toHaveClass(/is-front/);
    await expect(forward).toBeEnabled();
    await forward.focus();
    await page.keyboard.press("ArrowRight");
    await expect(live).toHaveText("Forward to Pull request #482.");
    await page.keyboard.press("Control+Alt+ArrowLeft");
    await page.keyboard.press("Control+Alt+ArrowLeft");
    await page.keyboard.press("Control+Alt+ArrowLeft");
    await expect(live).toHaveText("Back in your Claude Code session, right where you left it.");
    await expect(page.getByRole("button", { name: "Play it again" })).toBeVisible();
  });

  test("with reduced motion it starts at the end of the detour", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.locator("[data-back-stage]").scrollIntoViewIfNeeded();
    await expect(page.locator("[data-back-live]")).toHaveText(/^Four places later\./);
    await expect(page.locator('[data-back] [data-app="notion"]')).toHaveClass(/is-front/);
  });
});

test.describe("agents moment", () => {
  test("the waiting session rises and opens", async ({ page }) => {
    await page.goto("/");
    await page.locator("[data-agents] .scene").scrollIntoViewIfNeeded();
    await expect(page.locator("[data-agents]")).toHaveClass(/is-landed/, { timeout: 8000 });
    await expect(page.locator('#agents-lx .lx-row').first()).toContainText("Needs You");
    await expect(page.getByRole("button", { name: "Play it again" })).toBeVisible();
  });
});
