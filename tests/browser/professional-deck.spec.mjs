import { test, expect } from "@playwright/test";

test.describe("Professional Deck browser E2E", () => {

  test("carga el deck completo", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveTitle(/Gracián Baena/i);
    await expect(page.locator(".deck .slide")).toHaveCount(14);

    await expect(page.locator(".site-header")).toBeVisible();
    await expect(page.locator(".deck-controls")).toBeVisible();

    await expect(page.locator("[data-set-lang='es']")).toHaveCount(1);
    await expect(page.locator("[data-set-lang='en']")).toHaveCount(1);

    await expect(page.locator("[data-set-theme='dark']")).toHaveCount(1);
    await expect(page.locator("[data-set-theme='light']")).toHaveCount(1);

    await expect(page.locator("#command-dialog")).toHaveCount(1);
  });

  test("navegación entre slides funciona", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const slides = page.locator(".deck .slide");

    await expect(slides.nth(0)).toBeInViewport();

    await page.keyboard.press("ArrowDown");
    await expect(slides.nth(1)).toBeInViewport();

    await page.keyboard.press("End");
    await expect(slides.nth(13)).toBeInViewport();

    await page.keyboard.press("Home");
    await expect(slides.nth(0)).toBeInViewport();
  });

  test("selector ES/EN funciona", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const es = page.locator("[data-set-lang='es']");
    const en = page.locator("[data-set-lang='en']");

    await es.click();

    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    await expect(page.locator("body")).toHaveAttribute("data-lang", "es");
    await expect(es).toHaveAttribute("aria-pressed", "true");

    await en.click();

    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("body")).toHaveAttribute("data-lang", "en");
    await expect(en).toHaveAttribute("aria-pressed", "true");

    await es.click();

    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    await expect(page.locator("body")).toHaveAttribute("data-lang", "es");
  });

  test("tema oscuro/claro funciona", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const dark = page.locator("[data-set-theme='dark']");
    const light = page.locator("[data-set-theme='light']");

    await expect(dark).toHaveCount(1);
    await expect(light).toHaveCount(1);

    await light.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(light).toHaveAttribute("aria-pressed", "true");

    await dark.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(dark).toHaveAttribute("aria-pressed", "true");
  });

  test("navegación principal apunta a slides reales", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const targets = await page.locator(".main-nav [data-go]").evaluateAll(
      buttons => buttons.map(button => button.dataset.go)
    );

    expect(targets.length).toBeGreaterThan(0);

    for (const id of targets) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
  });

  test("command palette abre con Ctrl+K", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const dialog = page.locator("#command-dialog");
    const search = page.locator("[data-command-search]");

    await expect(dialog).toHaveCount(1);
    await expect(search).toHaveCount(1);

    await page.keyboard.press("Control+KeyK");

    await expect(dialog).toBeVisible();
    await expect(search).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(dialog).not.toBeVisible();
  });

  test("assets críticos responden", async ({ request }) => {
    const critical = [
      "/manifest.webmanifest",
      "/favicon.svg",
      "/og-cover.png",
      "/Gracian_Baena_CV_2026_ES.pdf",
      "/Gracian_Baena_CV_2026_EN.pdf"
    ];

    for (const asset of critical) {
      const response = await request.get(asset);
      expect(response.ok(), `${asset} debe responder 2xx`).toBeTruthy();
    }
  });

});
