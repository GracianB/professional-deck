import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

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

    mkdirSync("artifacts/v16", { recursive: true });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(250);

    await expect(page.locator("section.slide")).toHaveCount(10);
    await expect(page.locator(".site-header")).toBeVisible();
    await expect(page.locator('.main-nav [data-go="sistemas"]')).toBeVisible();
    await expect(page.locator('.nav-recruiter')).toBeVisible();
    await expect(page.locator('.nav-recruiter')).toBeVisible();
    await expect(page.locator('[data-present]')).toBeVisible();
    await expect(page.locator('[data-slide-live]')).toBeAttached();

    await page.locator('[data-set-lang="en"]').click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator(".pd16-name")).toContainText("GRACIÁN");
    await expect(page.locator(".pd16-name")).toContainText("BAENA");
    await expect(page.locator(".pd16-role")).toContainText(/Customer Success Systems/i);
    await expect(page.locator(".pd16-proof-strip")).toContainText(/ES · EN · IT/);

    await page.locator('[data-set-theme="light"]').click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.locator('[data-set-theme="dark"]').click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.locator('#inicio [data-go="sistemas"]').click();
    await expect(page).toHaveURL(/theme=dark/);
    await expect(page).toHaveURL(/#sistemas$/);
    await expect(page.locator('[data-slide-live]')).toContainText(/Slide 02.*Bodytone/i);

    const coverTitleFont = await page.locator(".pd16-name span").evaluate(el =>
      getComputedStyle(el).fontFamily
    );
    expect(coverTitleFont).toMatch(/Fraunces/i);

    await page.keyboard.press("Home");
    await expect(page.locator("#inicio")).toBeInViewport();
    await page.waitForTimeout(160);
    await page.screenshot({ path: "artifacts/v16/cover-desktop.png", fullPage: false });

    await expect(page.locator("#demos .pd16-proof-card")).toHaveCount(3);
    await expect(page.locator("#demos")).toContainText(/RevOps Studio/i);
    await expect(page.locator("#demos")).toContainText(/OHANA/i);
    await expect(page.locator("#demos")).toContainText(/VØRTICE/i);
    await expect(page.locator("#ruta .pd17-atlas-map svg")).toHaveCount(1);
    await page.locator('.main-nav [data-go="ruta"]').click();
    await expect(page.locator("#ruta")).toBeInViewport();
    await expect(page.locator("[data-atlas-stops] button")).toHaveCount(5);
    await page.locator('[data-atlas-step="3"]').click();
    await expect(page.locator("[data-atlas-title]")).toContainText(/Convertir|product/i);
    await page.waitForTimeout(220);
    await page.screenshot({ path: "artifacts/v16/operating-model.png", fullPage: false });

    await page.locator('.nav-recruiter').click();
    const recruiter = page.locator("#recruiter-dialog");
    await expect(recruiter).toBeVisible();
    await expect(recruiter.locator("[data-brief-chapter]")).toHaveCount(4);
    await expect(recruiter.locator("[data-brief-clock]")).toHaveText("00:00");
    await recruiter.locator("[data-brief-play]").click();
    await expect(recruiter.locator("[data-brief-play]")).toHaveAttribute("aria-pressed", "true");
    await recruiter.locator('[data-brief-chapter="3"]').click();
    await expect(recruiter.locator("[data-brief-clock]")).toContainText("00:45");
    await recruiter.locator("[data-brief-play]").click();
    await recruiter.locator("[data-brief-explore]").click();
    await expect(recruiter).not.toBeVisible();
    await expect(page).toHaveURL(/#demos$/);

    await page.locator('[data-open-command]').click();
    const command = page.locator("#command-dialog");
    await expect(command).toBeVisible();
    await expect(command.locator("[data-command-search]")).toBeVisible();
    await command.locator("[data-command-search]").fill("bodytone");
    await expect(command.locator("[data-command-list]")).toContainText(/Bodytone/i);
    await command.locator("[data-command-search]").fill("systems lab");
    await expect(command.locator("[data-command-list]")).toContainText(/Systems Lab/i);
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
    await expect(recruiter.locator('[data-i18n="briefEyebrow"]')).toContainText(/60 SECONDS/i);
    await expect(recruiter.locator("[data-brief-play]")).toContainText(/PLAY/i);
    await recruiter.locator(".dialog-close").click();
  });
});
