import { test, expect } from "@playwright/test";

test.describe("Professional Deck browser E2E", () => {
  // Existing feature tests begin with the opening marked as seen; the cinematic
  // lifecycle is exercised explicitly in a separate isolated context below.
  test.beforeEach(async ({page}) => {
    await page.addInitScript(() => {
      try { sessionStorage.setItem("gb-professional-deck-v20-opening-seen", "1"); } catch (_) {}
    });
  });


  test("V20 cinematic opening is skippable, session-once and replayable", async ({browser}) => {
    const ctx=await browser.newContext({viewport:{width:1440,height:900}});
    const page=await ctx.newPage();
    await page.goto("/",{waitUntil:"domcontentloaded"});
    const cinema=page.locator("#pd20-cinema");
    await expect(cinema).toBeVisible();
    await expect(cinema.locator("[data-cinema-skip]")).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(cinema).toBeHidden();
    await page.reload({waitUntil:"domcontentloaded"});
    await expect(cinema).toBeHidden();
    await page.locator("[data-cinema-replay]").click();
    await expect(cinema).toBeVisible();
    await cinema.locator("[data-cinema-skip]").click();
    await expect(cinema).toBeHidden();
    await ctx.close();

    const deep=await browser.newContext({viewport:{width:1440,height:900}});
    const dp=await deep.newPage();
    await dp.goto("/?lang=es#ruta",{waitUntil:"domcontentloaded"});
    await expect(dp.locator("#pd20-cinema")).toBeHidden();
    await deep.close();

    const reduce=await browser.newContext({reducedMotion:"reduce"});
    const rp=await reduce.newPage();
    await rp.goto("/",{waitUntil:"domcontentloaded"});
    await expect(rp.locator("#pd20-cinema")).toBeHidden();
    await reduce.close();
  });

  test("V20 model has 4+3 balanced cards on desktop and no mobile overflow", async ({page}) => {
    await page.setViewportSize({width:1440,height:900});
    await page.goto("/?lang=es#modelo",{waitUntil:"domcontentloaded"});
    const steps=page.locator("#modelo .pd20-model-track>li");
    await expect(steps).toHaveCount(7);
    const pos=await steps.evaluateAll(nodes=>nodes.map(el=>{
      const r=el.getBoundingClientRect();return {top:r.top,left:r.left,right:r.right};
    }));
    expect(Math.abs(pos[0].top-pos[3].top)).toBeLessThan(5);
    expect(pos[4].top).toBeGreaterThan(pos[0].top+50);
    expect(Math.abs(pos[4].top-pos[6].top)).toBeLessThan(5);
    expect(pos[0].left).toBeLessThan(pos[1].left);
    await expect(page.locator("#modelo .pd20-model-proof>a")).toHaveCount(4);
    await page.setViewportSize({width:390,height:844});
    const dimensions=await page.evaluate(() => ({
      scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.viewport+1);
    await expect(steps).toHaveCount(7);
  });

  test("V20 light theme is coherent across all twelve chapters", async ({page}) => {
    await page.setViewportSize({width:1440,height:900});
    await page.goto("/",{waitUntil:"domcontentloaded"});
    await page.locator("[data-set-theme='light']").click();
    await expect(page.locator("html")).toHaveAttribute("data-theme","light");
    const surface=await page.evaluate(()=>{
      const ids=["inicio","modelo","sistemas","demos","metodo","ruta","trayectoria","experiencia","experiencia-2","capacidades","formacion","contacto"];
      return ids.map(id=>{
        const el=document.getElementById(id);
        const color=getComputedStyle(el).backgroundColor;
        return {id,color};
      });
    });
    for(const {id,color} of surface) {
      const values=color.match(/[\\d.]+/g)?.map(Number)||[];
      expect(values.length, id+" background "+color).toBeGreaterThanOrEqual(3);
      expect(Math.min(...values.slice(0,3)),id+" should be pale").toBeGreaterThan(210);
    }
    const samples=[
      "#modelo .pd20-model-track>li>strong",
      "#demos .gb-demo-card h3",
      "#metodo .pd18-method-flow .gb-step h3",
      "#trayectoria .pd18-evo-rail strong",
      "#capacidades .pd18-cap-grid h3",
      "#formacion .gb-edu-head h2",
      "#contacto .pd19-contact-copy h2"
    ];
    for(const selector of samples){
      const color=await page.locator(selector).first().evaluate(el=>getComputedStyle(el).color);
      const rgb=color.match(/[\\d.]+/g)?.map(Number)||[];
      expect(rgb[0],selector+" text not dark: "+color).toBeLessThan(130);
    }
    await page.locator("[data-set-theme='dark']").click();
    await expect(page.locator("html")).toHaveAttribute("data-theme","dark");
  });


  test("carga el deck completo", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveTitle(/Gracián Baena/i);
    await expect(page.locator(".deck .slide")).toHaveCount(12);

    await expect(page.locator(".site-header")).toBeVisible();
    await expect(page.locator(".deck-controls")).toBeVisible();

    await expect(page.locator("[data-set-lang='es']")).toHaveCount(1);
    await expect(page.locator("[data-set-lang='en']")).toHaveCount(1);

    await expect(page.locator("[data-set-theme='dark']")).toHaveCount(1);
    await expect(page.locator("[data-set-theme='light']")).toHaveCount(1);

    await expect(page.locator("#command-dialog")).toHaveCount(1);
  });


  test("atlas interactivo y resumen de 60 segundos sin scroll interminable", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.locator('.main-nav [data-go="ruta"]').click();
    await expect(page.locator('#ruta')).toBeInViewport();
    const stops=page.locator("[data-atlas-stops] button");
    await expect(stops).toHaveCount(6);
    await stops.nth(2).click();
    await expect(stops.nth(2)).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-atlas-title]")).toContainText("Madrid");
    await page.locator("[data-atlas-go]").click();
    await expect(page).toHaveURL(/#trayectoria$/);

    await page.locator("[data-open-recruiter]").first().click();
    const dialog=page.locator("#recruiter-dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("[data-brief-chapter]")).toHaveCount(4);
    await expect(dialog.locator("[data-brief-clock]")).toHaveText("00:00");
    await dialog.locator("[data-brief-play]").click();
    await expect(dialog.locator("[data-brief-play]")).toHaveAttribute("aria-pressed", "true");
    await page.waitForTimeout(1100);
    await expect(dialog.locator("[data-brief-clock]")).not.toHaveText("00:00");
    await dialog.locator("[data-brief-play]").click();
    await expect(dialog.locator("[data-brief-play]")).toHaveAttribute("aria-pressed", "false");
    await dialog.locator('[data-brief-chapter="2"]').click();
    await expect(dialog.locator("[data-brief-clock]")).toHaveText("00:30");
    await expect(dialog.locator("[data-brief-title]")).toContainText("construir");
    await dialog.locator("[data-brief-explore]").click();
    await expect(dialog).not.toBeVisible();
    await expect(page).toHaveURL(/#sistemas$/);
  });

  test("V18 tiene seis ciudades reales y evidencia visual en experiencia", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#modelo .pd18-model-track li")).toHaveCount(7);
    await expect(page.locator("#metodo [data-method-steps] .gb-step")).toHaveCount(5);
    await expect(page.locator("#trayectoria .pd18-evo-rail li")).toHaveCount(5);
    await expect(page.locator("#capacidades .pd18-cap-grid article")).toHaveCount(5);
    await expect(page.locator("#experiencia .pd18-brand-art")).toHaveCount(3);
    await expect(page.locator("#experiencia-2 .pd18-brand-art")).toHaveCount(3);
    const cities = await page.locator("#ruta .pd18-city-nodes button").evaluateAll(nodes =>
      nodes.map(node => ({lat:Number(node.dataset.lat),lon:Number(node.dataset.lon)}))
    );
    expect(cities.length).toBe(6);
    expect(cities.every(city => Number.isFinite(city.lat) && Number.isFinite(city.lon))).toBe(true);
    await page.locator("#ruta [data-atlas-stops] [data-atlas-step='5']").click();
    await expect(page.locator("[data-atlas-title]")).toContainText("Varsovia");
    await page.locator("[data-set-lang='en']").click();
    await expect(page.locator("[data-atlas-title]")).toContainText("Warsaw");
  });

  test("V19 atlas draws changing routes, full network and pauses guided tour", async ({ page }) => {
    await page.goto("/?lang=es#ruta", { waitUntil: "domcontentloaded" });
    const paths = page.locator("#ruta [data-atlas-routes] path");
    await expect(page.locator("#ruta .pd19-real-land path")).toHaveCount(36);
    await expect(paths).toHaveCount(5);
    await expect(page.locator("[data-atlas-title]")).toContainText("Murcia");
    await page.locator("#ruta [data-atlas-next]").click();
    await expect(page.locator("[data-atlas-title]")).toContainText("Gran Canaria");
    await expect(paths).toHaveCount(5);
    await page.locator("#ruta [data-atlas-mode]").click();
    await expect(page.locator("#ruta [data-atlas-mode]")).toHaveAttribute("aria-pressed", "true");
    await expect(paths).toHaveCount(15);
    await page.locator("#ruta [data-atlas-mode]").click();
    await expect(paths).toHaveCount(5);
    await page.locator("#ruta [data-atlas-tour]").click();
    await expect(page.locator("#ruta [data-atlas-tour]")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-atlas-title]")).toContainText("Madrid");
    await page.locator("#ruta [data-atlas-tour]").click();
    await expect(page.locator("#ruta [data-atlas-tour]")).toHaveAttribute("aria-pressed", "false");
    await page.locator("#ruta [data-atlas-prev]").click();
    await expect(page.locator("[data-atlas-title]")).toContainText("Gran Canaria");
    await page.locator("[data-set-lang='en']").click();
    await expect(page.locator("#ruta [data-atlas-tour]")).toContainText("EXPLORE");
  });

  test("V19 Bodytone stays navy and final contact offers real working links", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#sistemas .pd19-os-flow>span")).toHaveCount(4);
    await expect(page.locator("#contacto .pd19-contact-link")).toHaveCount(4);
    await expect(page.locator('#contacto a[href^="mailto:"]')).toHaveCount(1);
    await expect(page.locator("#contacto .pd19-contact-languages")).toContainText("ES");
    await expect(page.locator("#contacto .pd19-contact-languages")).toContainText("EN");
    await expect(page.locator("#contacto .pd19-contact-languages")).toContainText("IT");
    const background=await page.locator("#sistemas .gb-star-main").evaluate(el=>getComputedStyle(el).backgroundImage);
    expect(background).toContain("gradient");
    await page.locator("[data-set-lang='en']").click();
    await expect(page.locator("#contacto h2")).toContainText("Let's talk");
    await expect(page.locator("#contacto [data-i18n='contactManifestoNote']")).toContainText(/systems/i);
    await page.locator("[data-set-theme='light']").click();
    const bg=await page.locator("#contacto").evaluate(el=>getComputedStyle(el).backgroundColor);
    expect(bg).not.toBe("rgba(0, 0, 0, 0)");
  });

  test("V20 header is one centered row alongside right utilities", async ({ page }) => {
    await page.setViewportSize({width:1440,height:900});
    await page.goto("/", {waitUntil:"domcontentloaded"});
    const rects=await page.evaluate(() => {
      const b=document.querySelector(".site-header .brand").getBoundingClientRect();
      const n=document.querySelector(".site-header .main-nav").getBoundingClientRect();
      const t=document.querySelector(".site-header .header-actions").getBoundingClientRect();
      return {brand:b.toJSON(),nav:n.toJSON(),tools:t.toJSON()};
    });
    const cy = rect => (rect.top+rect.bottom)/2;
    expect(Math.abs(cy(rects.nav)-cy(rects.tools))).toBeLessThan(12);
    expect(rects.brand.right).toBeLessThanOrEqual(rects.nav.left+2);
    expect(rects.nav.right).toBeLessThanOrEqual(rects.tools.left+2);
    expect(Math.abs((rects.nav.left+rects.nav.right)/2-720)).toBeLessThan(120);
    await page.setViewportSize({width:1080,height:800});
    await expect(page.locator(".menu-toggle")).toBeVisible();
    await expect(page.locator(".main-nav")).toBeHidden();
    await page.locator(".menu-toggle").click();
    await expect(page.locator(".main-nav")).toBeVisible();
  });

  test("navegación entre slides funciona", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const slides = page.locator(".deck .slide");

    await expect(slides.nth(0)).toBeInViewport();

    await page.keyboard.press("ArrowDown");
    await expect(slides.nth(1)).toBeInViewport();

    await page.keyboard.press("End");
    await expect(slides.nth(11)).toBeInViewport();

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
    await expect(railItems).toHaveCount(12);
    await expect(railItems.nth(0)).toHaveAttribute("aria-current", "true");

    await page.keyboard.press("End");
    await expect(railItems.nth(11)).toHaveAttribute("aria-current", "true");
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

  test("los grupos de idioma y tema y sus títulos se localizan", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const languageGroup = page.locator("[data-language-gate='header']");
    const themeGroup = page.locator(".header-actions .seg").nth(1);

    await expect(languageGroup).toHaveAttribute("aria-label", "Idioma");
    await expect(themeGroup).toHaveAttribute("aria-label", "Tema");
    await expect(page.locator("[data-set-theme='dark']")).toHaveAttribute("title", "Oscuro");
    await expect(page.locator("[data-set-theme='light']")).toHaveAttribute("title", "Claro");

    await page.locator("[data-set-lang='en']").click();
    await expect(languageGroup).toHaveAttribute("aria-label", "Language");
    await expect(themeGroup).toHaveAttribute("aria-label", "Theme");
    await expect(page.locator("[data-set-theme='dark']")).toHaveAttribute("title", "Dark");
    await expect(page.locator("[data-set-theme='light']")).toHaveAttribute("title", "Light");
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
