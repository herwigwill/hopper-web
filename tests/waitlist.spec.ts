import { test, expect } from "@playwright/test";

test.describe("waitlist", () => {
  test("rejects a bad address with a clear message", async ({ page }) => {
    await page.goto("/");
    const form = page.locator("#join");
    await form.getByLabel("Email address").fill("not-an-email");
    await form.getByRole("button", { name: "Join the waitlist" }).click();
    await expect(form.getByRole("alert")).toHaveText("Enter an email address like name@example.com.");
    await expect(form.getByLabel("Email address")).toHaveAttribute("aria-invalid", "true");
    await expect(form.getByLabel("Email address")).toBeFocused();
  });

  test("joins, updates both forms, and saves the optional answers", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1600); // people take longer than 1.5 s; so must the test
    const form = page.locator("#join");
    await form.getByLabel("Email address").fill("Test.Person@Example.com");
    await form.getByLabel("Email address").press("Enter");
    await expect(form.getByText("You’re on the list.")).toBeVisible();
    await expect(page.locator(".hero").getByText("You’re on the list.")).toBeAttached();
    await form.getByRole("radio", { name: "Raycast" }).check();
    await form.getByRole("radio", { name: "Every day" }).check();
    await form.getByRole("button", { name: "Save answers" }).click();
    await expect(form.getByText("Saved. Thanks, that helps.")).toBeVisible();
  });

  test("works without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    const form = page.locator("#join");
    await form.getByLabel("Email address").fill("nojs@example.com");
    await form.getByRole("button", { name: "Join the waitlist" }).click();
    await expect(page).toHaveURL(/\/waitlist\/joined$/);
    await expect(page.getByRole("heading", { name: "You’re on the list." })).toBeVisible();
    await context.close();
  });

  test("the API validates, ignores bots and refuses cross-site posts", async ({ request }) => {
    const json = { Accept: "application/json" };
    const bad = await request.post("/api/waitlist", { headers: json, form: { email: "nope" } });
    expect(bad.status()).toBe(400);
    expect((await bad.json()).code).toBe("invalid_email");
    const fast = await request.post("/api/waitlist", { headers: json, form: { email: "a@b.co", t: "200" } });
    expect((await fast.json()).code).toBe("too_fast");
    const bot = await request.post("/api/waitlist", { headers: json, form: { email: "bot@b.co", company: "Acme" } });
    expect((await bot.json()).ok).toBe(true);
    const cross = await request.post("/api/waitlist", { headers: { ...json, Origin: "https://evil.example" }, form: { email: "a@b.co" } });
    expect(cross.status()).toBe(400);
    const get = await request.get("/api/waitlist");
    expect(get.status()).toBe(405);
    const forged = await request.post("/api/waitlist", { headers: json, form: { intent: "details", email: "a@b.co", token: "x", uses: "raycast" } });
    expect(forged.status()).toBe(400);
  });
});
