import { test, expect } from "@playwright/test";

test.describe("waitlist", () => {
  test("both buttons open a ready email to us", async ({ page }) => {
    await page.goto("/");
    for (const where of [".hero", "#join"]) {
      const link = page.locator(where).getByRole("link", { name: "Join the waitlist" });
      await expect(link).toBeVisible();
      const href = new URL((await link.getAttribute("href"))!);
      expect(href.protocol).toBe("mailto:");
      expect(href.pathname).toBe("hello@addhopper.com");
      expect(href.searchParams.get("subject")).toBe("Join the Hopper waitlist");
      expect(href.searchParams.get("body")).toContain("Please add me to the waitlist.");
    }
  });
});
