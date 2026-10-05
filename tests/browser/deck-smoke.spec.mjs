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

    await page.locator('[data-set-lang="en"]').click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator('[data-i18n="heroStatus"]')).toContainText("open to senior roles");

    await page.locator('[data-set-theme="light"]').click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.locator('[data-set-theme="dark"]').click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await page.locator('[data-open-recruiter]').click();
    const recruiter = page.locator("#recruiter-dialog");
    await expect(recruiter).toBeVisible();
    await expect(recruiter.locator("[data-recruiter-grid]")).toContainText(/Customer Success/i);
    await expect(recruiter.locator("[data-recruiter-grid]")).toContainText(/Projects/i);
    await expect(recruiter.locator("[data-recruiter-grid]")).toContainText(/Data/i);
    await expect(recruiter.locator("[data-recruiter-grid]")).toContainText(/Consult/i);
    await expect(recruiter.locator(".recruiter-metrics strong")).toHaveCount(4);
    await recruiter.locator(".dialog-close").click();
    await expect(recruiter).not.toBeVisible();

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

    expect(pageErrors, pageErrors.join("\n")).toEqual([]);
    expect(consoleErrors, consoleErrors.join("\n")).toEqual([]);
    expect(localFailures, localFailures.join("\n")).toEqual([]);
  });
});
