import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

const tips = JSON.parse(readFileSync(new URL("../src/content/tips.json", import.meta.url), "utf8")) as { tips: unknown[] };

test.describe("tips page", () => {
  test("lists every tip by section and plays one on click", async ({ page }) => {
    await page.goto("/tips");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Hopper\sTips/);
    await expect(page.locator(".tp-card")).toHaveCount(tips.tips.length);
    await expect(page.getByRole("heading", { level: 2, name: "Basics" })).toBeVisible();
    const card = page.locator(".tp-card").first();
    const play = card.getByRole("button", { name: /^Play / });
    await play.click();
    await expect(play).toBeHidden();
    await expect(card.locator("video")).toHaveJSProperty("controls", true);
  });
});
