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

  test("with reduced motion it doesn't autoplay and shows a complete frame", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.waitForTimeout(3000);
    await expect(page.locator("#hero-lx [data-text]")).toHaveText("q4 plan");
    await expect(page.locator('[data-stage]')).toHaveAttribute("data-open", "true");
  });
});

test.describe("back moment", () => {
  test("Back and Forward step through the trail", async ({ page }) => {
    await page.goto("/");
    const back = page.getByRole("button", { name: "Back", exact: true });
    const forward = page.getByRole("button", { name: "Forward", exact: true });
    await expect(forward).toBeDisabled();
    await back.click();
    await expect(page.locator("[data-back-live]")).toHaveText("Back to billing/webhooks.ts, Cursor.");
    await back.click();
    await expect(page.locator("[data-back-live]")).toHaveText("Back to Checkout funnel, Q4, Google Chrome.");
    await expect(forward).toBeEnabled();
    await forward.focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("[data-back-live]")).toHaveText("Forward to billing/webhooks.ts, Cursor.");
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
