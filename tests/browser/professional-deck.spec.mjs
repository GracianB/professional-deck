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

  test("skip link lleva el foco al contenido principal", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const skip = page.locator(".skip-link");
    await skip.focus();
    await expect(skip).toBeFocused();
    await skip.press("Enter");

    await expect(page.locator("#deck")).toBeFocused();
  });

  test("el rail refleja la slide activa", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const railItems = page.locator(".os-rail-item");
    await expect(railItems).toHaveCount(14);
    await expect(railItems.nth(0)).toHaveAttribute("aria-current", "true");

    await page.keyboard.press("End");
    await expect(railItems.nth(13)).toHaveAttribute("aria-current", "true");
    await expect(railItems.nth(0)).toHaveAttribute("aria-current", "false");
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

  test("no emite errores de consola ni page errors en carga", async ({ page }) => {
    const consoleErrors = [];
    const pageErrors = [];

    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => pageErrors.push(error.message));

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(250);

    expect(consoleErrors, "Errores de consola: " + consoleErrors.join(" | ")).toEqual([]);
    expect(pageErrors, "Page errors: " + pageErrors.join(" | ")).toEqual([]);
  });

  test("responsive móvil mantiene el viewport y el menú funciona", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true
    });
    const page = await context.newPage();

    await page.goto("/", { waitUntil: "domcontentloaded" });

    const viewport = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth
    }));

    expect(viewport.scrollWidth, "No debe existir overflow horiontal").toBeLessThanOrEqual(viewport.innerWidth + 1);
    expect(viewport.bodyScrollWidth, "El body no debe desbordar horizontalmente").toBeLessThanOrEqual(viewport.innerWidth + 1);

    const menuToggle = page.locator(".menu-toggle");
    await expect(menuToggle).toBeVisible();
    await expect(menuToggle).toHaveAttribute("aria-expanded", "false");

    await menuToggle.click();
    await expect(menuToggle).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator(".main-nav")).toHaveClass(/open/);

    await page.keyboard.press("Escape");
    await expect(menuToggle).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator(".main-nav")).not.toHaveClass(/open/);

    await context.close();
  });

  test("controles táctiles y keyboard mantienen tamaño mínimo", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true
    });
    const page = await context.newPage();

    await page.goto("/", { waitUntil: "domcontentloaded" });

    const selectors = [
      ".menu-toggle",
      "[data-set-lang='es']",
      "[data-set-lang='en']",
      "[data-set-theme='dark']",
      "[data-set-theme='light']",
      ".deck-controls button"
    ];

    for (const selector of selectors) {
      const sizes = await page.locator(selector).evaluateAll((elements) =>
        elements.map((el) => {
          const rect = el.getBoundingClientRect();
          return { width: rect.width, height: rect.height };
        })
      );

      for (const size of sizes) {
        expect(size.width, selector + " debe medir al menos 40px de ancho").toBeGreaterThanOrEqual(40);
        expect(size.height, selector + " debe medir al menos 40px de alto").toBeGreaterThanOrEqual(40);
      }
    }

    await context.close();
  });

  test("diálogos tienen nombre accesible y gestión de foco", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const recruiter = page.locator("#recruiter-dialog");
    await expect(recruiter).toHaveAttribute("aria-labelledby", "recruiter-title");
    await expect(recruiter).toHaveAttribute("aria-describedby", "recruiter-lead");
    await expect(page.locator("#recruiter-title")).toHaveCount(1);
    await expect(page.locator("#recruiter-lead")).toHaveCount(1);

    await page.locator("[data-open-recruiter]").first().click();
    await expect(recruiter).toBeVisible();
    await expect(recruiter.locator(".dialog-close")).toBeVisible();
    await recruiter.locator(".dialog-close").press("Enter");
    await expect(recruiter).not.toBeVisible();

    const command = page.locator("#command-dialog");
    await expect(command).toHaveAttribute("aria-labelledby", "command-title");

    await page.keyboard.press("Control+KeyK");
    await expect(command).toBeVisible();
    await expect(page.locator("#command-search")).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(command).not.toBeVisible();
  });

  test("los diálogos restauran el foco al control que los abrió", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const recruiterTrigger = page.locator("[data-open-recruiter]").first();
    await recruiterTrigger.focus();
    await recruiterTrigger.click();
    await expect(page.locator("#recruiter-dialog")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.locator("#recruiter-dialog")).not.toBeVisible();
    await expect(recruiterTrigger).toBeFocused();

    const roleTrigger = page.locator("[data-role]").first();
    await roleTrigger.focus();
    await roleTrigger.press("Enter");
    await expect(page.locator("#experience-dialog")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.locator("#experience-dialog")).not.toBeVisible();
    await expect(roleTrigger).toBeFocused();
  });

  test("navegación móvil puede alcanzar portada y contacto", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true
    });
    const page = await context.newPage();

    await page.goto("/", { waitUntil: "domcontentloaded" });

    await page.keyboard.press("End");
    await expect(page.locator("#contacto")).toBeInViewport();

    await page.keyboard.press("Home");
    await expect(page.locator("#inicio")).toBeInViewport();

    await context.close();
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


test.describe("Professional Deck production hardening", () => {
  test("SEO and document contract are present", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveTitle(/Gracián Baena/i);
    await expect(page.locator('meta[name="description"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://gracianb.github.io/professional-deck/"
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:description"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image"
    );
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
    await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);

    const blankLinks = page.locator('a[target="_blank"]');
    const count = await blankLinks.count();
    for (let i = 0; i < count; i++) {
      await expect(blankLinks.nth(i)).toHaveAttribute("rel", /noopener/);
    }
  });

  test("deep link por hash aterriza en la slide correcta", async ({ page }) => {
    await page.goto("/#contacto", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#contacto")).toBeInViewport();
  });

  test("el tema persiste tras recargar la página", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await page.locator("[data-set-theme='light']").click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.locator("[data-set-theme='light']")).toHaveAttribute("aria-pressed", "true");

    await page.locator("[data-set-theme='dark']").click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("el idioma persiste tras recargar la página", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await page.locator("[data-set-lang='en']").click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("[data-set-lang='en']")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-cv-link]").first()).toHaveAttribute(
      "href",
      "./Gracian_Baena_CV_2026_EN.pdf"
    );

    await page.locator("[data-set-lang='es']").click();
  });

  test("reduced motion disables the intro animation path", async ({ browser }) => {
    const context = await browser.newContext({
      reducedMotion: "reduce",
      viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();

    await page.goto("/", { waitUntil: "domcontentloaded" });

    const state = await page.evaluate(() => ({
      introOn: document.documentElement.classList.contains("intro-on"),
      reduce: window.matchMedia("(prefers-reduced-motion: reduce)").matches
    }));

    expect(state.reduce).toBe(true);
    expect(state.introOn).toBe(false);

    await context.close();
  });

  test("language switch updates document language and CV target", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await page.locator("[data-set-lang='en']").click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("[data-cv-link]").first()).toHaveAttribute(
      "href",
      "./Gracian_Baena_CV_2026_EN.pdf"
    );

    await page.locator("[data-set-lang='es']").click();
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    await expect(page.locator("[data-cv-link]").first()).toHaveAttribute(
      "href",
      "./Gracian_Baena_CV_2026_ES.pdf"
    );
  });

  test("main nav closes after selection on mobile", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true
    });
    const page = await context.newPage();

    await page.goto("/", { waitUntil: "domcontentloaded" });

    await page.locator(".menu-toggle").click();
    await expect(page.locator(".main-nav")).toHaveClass(/open/);

    await page.locator(".main-nav [data-go='contacto']").click();
    await expect(page.locator(".main-nav")).not.toHaveClass(/open/);
    await expect(page.locator("#contacto")).toBeInViewport();

    await context.close();
  });

  test("ARIA labels follow the selected language", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true
    });
    const page = await context.newPage();

    await page.goto("/", { waitUntil: "domcontentloaded" });

    const menuToggle = page.locator(".menu-toggle");
    const closeButtons = page.locator(".dialog-close");

    await expect(menuToggle).toBeVisible();
    await expect(menuToggle).toHaveAttribute("aria-label", "Abrir menú");
    await expect(closeButtons.first()).toHaveAttribute("aria-label", "Cerrar diálogo");

    await page.locator("[data-set-lang='en']").click();
    await expect(menuToggle).toHaveAttribute("aria-label", "Open menu");
    await expect(closeButtons.first()).toHaveAttribute("aria-label", "Close dialog");

    await menuToggle.click();
    await expect(menuToggle).toHaveAttribute("aria-label", "Close menu");

    await page.keyboard.press("Escape");
    await expect(menuToggle).toHaveAttribute("aria-label", "Open menu");

    await context.close();
  });

});
