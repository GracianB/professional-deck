import { test, expect } from "@playwright/test";

test.describe("Professional Deck smoke", () => {
  test("loads cleanly and exposes the recruiter-critical flow", async ({ page }) => {
    const pageErrors = [];
    const consoleErrors = [];
    const localFailures = [];

    page.on("pageerror", error => pageErrors.push(error.message));
    page.on("console", message => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("response", response => {
      if (
        response.url().startsWith("http://127.0.0.1:4173/") &&
        response.status() >= 400
      ) {
        localFailures.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(250);

    await expect(page.locator("section.slide")).toHaveCount(14);
    await expect(page.locator(".site-header")).toBeVisible();
    await expect(page.locator('.main-nav [data-go="sistemas"]')).toBeVisible();
    await expect(page.locator('[data-open-recruiter]')).toBeVisible();
    await expect(page.locator('.nav-recruiter')).toBeVisible();
    await expect(page.locator('[data-present]')).toBeVisible();
    await expect(page.locator('[data-slide-live]')).toBeAttached();

    await page.locator('[data-set-lang="en"]').click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator('[data-i18n="heroStatus"]')).toContainText("open to senior roles");

    await page.locator('[data-set-theme="light"]').click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.locator('[data-set-theme="dark"]').click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.locator('#inicio [data-go="sistemas"]').click();
    await expect(page).toHaveURL(/theme=dark/);
    await expect(page).toHaveURL(/#sistemas$/);
    await expect(page.locator('[data-slide-live]')).toContainText(/Slide 03.*Bodytone/i);

    const coverAccent = await page.locator("#inicio").evaluate(el =>
      getComputedStyle(el).getPropertyValue("--cover-accent").trim()
    );
    expect(coverAccent).toBe("#c4a574");

    const coverTitleFont = await page.locator(".gb-cover-title").evaluate(el =>
      getComputedStyle(el).fontFamily
    );
    expect(coverTitleFont).toMatch(/Fraunces/i);

    await page.locator('[data-open-recruiter]').click();
    const recruiter = page.locator("#recruiter-dialog");
    await expect(recruiter).toBeVisible();
    await expect(recruiter.locator("[data-recruiter-route] .recruiter-route-item")).toHaveCount(7);
    await expect(recruiter.locator("[data-recruiter-route]")).toContainText(/Bodytone|Proof/i);
    await expect(recruiter.locator("[data-recruiter-grid]")).toContainText(/Customer Success/i);
    await expect(recruiter.locator("[data-recruiter-grid]")).toContainText(/Projects/i);
    await expect(recruiter.locator("[data-recruiter-grid]")).toContainText(/Data/i);
    await expect(recruiter.locator("[data-recruiter-grid]")).toContainText(/Consult/i);
    await expect(recruiter.locator(".recruiter-metrics strong")).toHaveCount(4);
    await recruiter.locator("[data-recruiter-start]").click();
    await expect(page.locator("#recruiter-dialog")).not.toBeVisible();
    await expect(page.locator("body")).toHaveClass(/presentation-mode/);
    await expect(page).toHaveURL(/#valor$/);
    await page.keyboard.press("Escape");
    await expect(page.locator("body")).not.toHaveClass(/presentation-mode/);

    await page.locator('[data-open-command]').click();
    const command = page.locator("#command-dialog");
    await expect(command).toBeVisible();
    await expect(command.locator("[data-command-search]")).toBeVisible();
    await command.locator("[data-command-search]").fill("bodytone");
    await expect(command.locator("[data-command-list]")).toContainText(/Bodytone/i);
    await command.locator(".dialog-close").click();
    await expect(command).not.toBeVisible();

    await page.locator('#inicio [data-go="sistemas"]').click();
    await expect(page.locator('[data-rail-status]')).toContainText(/Bodytone/i);

    await page.keyboard.press("p");
    await expect(page.locator("body")).toHaveClass(/presentation-mode/);
    await expect(page.locator("[data-present]")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".presentation-exit")).toBeVisible();
    await expect(page.locator(".site-header")).toBeHidden();
    await page.keyboard.press("Escape");
    await expect(page.locator("body")).not.toHaveClass(/presentation-mode/);
    await expect(page.locator("[data-present]")).toHaveAttribute("aria-pressed", "false");

    expect(pageErrors, pageErrors.join("\n")).toEqual([]);
    expect(consoleErrors, consoleErrors.join("\n")).toEqual([]);
    expect(localFailures, localFailures.join("\n")).toEqual([]);
    await page.goto("/?recruiter=1", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(180);
    await expect(page.locator("#recruiter-dialog")).toBeVisible();
    await expect(page.locator("[data-recruiter-route] .recruiter-route-item")).toHaveCount(7);
    await page.locator("#recruiter-dialog .dialog-close").click();
    await expect(page.locator("#recruiter-dialog")).not.toBeVisible();
  });

  test("exposes the recruiter route in English", async ({ page }) => {
    await page.goto("/?lang=en&recruiter=1", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(180);
    const recruiter = page.locator("#recruiter-dialog");
    await expect(recruiter).toBeVisible();
    await expect(recruiter.locator("[data-recruiter-route]")).toContainText(/IN 60 SECONDS/i);
    await expect(recruiter.locator("[data-recruiter-start]")).toContainText(/START 60 SEC ROUTE/i);
    await recruiter.locator(".dialog-close").click();
  });
});
