#!/usr/bin/env node
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const url = process.env.PD_LIVE_URL || "https://gracianb.github.io/professional-deck/";
function assertNeutralPaint(paint,label) {
  const channels=[...String(paint).matchAll(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/g)].map(match=>match.slice(1).map(Number));
  assert.ok(channels.length>0,label+" exposes CSS colors");
  for(const [r,g,b] of channels) {
    assert.ok(r<=g+1 && g<=b+1 && Math.max(r,g,b)-Math.min(r,g,b)<=18,
      label+" must use cool grayscale, got "+paint);
  }
}

const response = await fetch(url, {
  redirect: "follow",
  headers: { "user-agent": "professional-deck-v20-live-smoke" },
});

assert.equal(response.ok, true, `Live deck returned HTTP ${response.status}`);
const html = await response.text();

assert.match(html, /Professional Deck/);
assert.match(html, /pd41-cover/);
assert.match(html, /pd17-atlas-map/);
assert.match(html, /data-brief-chapters/);
assert.match(html, /v17-atlas.css/);
assert.match(html, /v18-story.css/);
assert.match(html, /v19-final.css/);
assert.match(html, /v20-theme.css/);
assert.match(html, /v20-light.css/);
assert.match(html, /v23-brief.css\?v=deck-v23/);
assert.match(html, /v24-universe.css\?v=deck-v24/);
assert.match(html, /platinum-focus.css\?v=deck-p40/);
assert.match(html, /focus-mode.js\?v=deck-p40/);
assert.match(html, /v20-cinema.js/);
assert.match(html, /data-cinema-skip/);
assert.match(html, /data-atlas-tour/);
assert.match(html, /pd19-contact-wrap/);
assert.match(html, /id="modelo"/);
assert.doesNotMatch(html, /<section[^>]+id="(?:capacidades|trayectoria|metodo|experiencia-2)"/);
assert.match(html, /id="experiencia"/);
assert.equal((html.match(/<section class="slide /g)||[]).length,8);
assert.match(html, /RevOps Studio/);
assert.match(html, /project-ohana/);
assert.match(html, /vortex-gilt-xi\.vercel\.app/);
assert.match(html, /systems-lab/);
assert.doesNotMatch(html, /Mood Fitness/i);
assert.doesNotMatch(html, /open to senior roles|roles senior/i);

for(const file of ["proyecto-bodytone.html","proyecto-calculadora.html","proyecto-linkedin.html","proyecto-outreach.html"]) {
  const response=await fetch(new URL(file,url),{headers:{"user-agent":"professional-deck-v21-case-smoke"}});
  assert.equal(response.ok,true,file+" HTTP "+response.status);
  const source=await response.text();
  assert.match(source,/case-pages\.css\?v=deck-v24/,file+" shared case stylesheet");
  assert.match(source,/case-ui\.js\?v=deck-v21/,file+" case shell");
  assert.doesNotMatch(source,/nude-beige/,file+" obsolete sepia styles");
}
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
try {
  for (const viewport of [
    { width: 1440, height: 900, name: "desktop" },
    { width: 390, height: 844, name: "mobile" },
  ]) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      isMobile: viewport.width < 500,
      hasTouch: viewport.width < 500,
    });
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => pageErrors.push(String(error?.message || error)));

    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.locator("#inicio").waitFor();
    assert.equal(await page.locator("body").evaluate(el=>el.classList.contains("deck-focus")),
      true, viewport.name+": compact experience is the default");
    assert.equal(await page.locator(".pd40-compass").isVisible(),true,
      viewport.name+": direct proof explorer visible");
    assert.equal(await page.locator("section.slide:visible").count(),5,
      viewport.name+": only five chapters visible initially");
    assert.equal(await page.locator("#pd20-cinema").isVisible(),false,
      viewport.name+": opening never blocks visitor");
    await page.goto(new URL("?view=full&lang=es",url).href, {waitUntil:"domcontentloaded"});
    await page.locator("#inicio").waitFor();

    assert.equal(await page.locator(".deck .slide").count(), 8);
    assert.equal(await page.locator("[data-atlas-stops] button").count(), 6);
    assert.equal(await page.locator("#contacto .pd19-contact-link").count(), 7);
    assert.equal(await page.locator("[data-atlas-tour]").count(), 1);
    assert.equal(await page.locator("[data-brief-chapter]").count(), 4);
    await page.locator("#inicio .pd41-brief-btn").click();
    const modal = page.locator("#recruiter-dialog");
    const darkSurface = await modal.evaluate(el => getComputedStyle(el).backgroundColor);
    assert.equal(darkSurface, "rgb(16, 28, 38)", viewport.name+" dark brief surface");
    const activeDark = await modal.locator('[data-brief-chapter="0"]').evaluate(el => getComputedStyle(el).backgroundColor);
    assert.equal(activeDark, "rgb(53, 73, 84)", viewport.name+" dark selected chapter");
    assert.equal(await page.locator("[data-brief-clock]").innerText(), "00:00");
    await page.locator("[data-brief-chapter=\"2\"]").click();
    assert.equal(await page.locator("[data-brief-clock]").innerText(), "00:30");
    await page.locator("#recruiter-dialog .dialog-close").click();
    await page.locator("[data-set-theme='light']").click();
    await page.locator("#inicio .pd41-brief-btn").click();
    const lightCanvas = await modal.evaluate(el => getComputedStyle(el).backgroundImage);
    assert.ok(lightCanvas.includes("rgb(250, 247, 241)"),viewport.name+" ivory brief light mode: "+lightCanvas);
    const slateStage = await modal.locator(".pd17-brief-scene").evaluate(el => getComputedStyle(el).backgroundImage);
    assert.ok(slateStage.includes("rgb(38, 61, 75)"),viewport.name+" slate stage in light mode: "+slateStage);
    const lightActive = await modal.locator('[data-brief-chapter="0"]').evaluate(el => getComputedStyle(el).backgroundColor);
    assert.equal(lightActive,"rgb(41, 69, 82)",viewport.name+" selected chapter in light mode");
    await modal.locator(".dialog-close").click();
    await page.locator("[data-set-theme='dark']").click();
    // The V36 cover uses the real customer → system thesis. The old
    // `.pd16-name` identity node was removed intentionally in V36.
    assert.match(
      await page.locator("#inicio .pd16-thesis").innerText(),
      /Operaciones que se entienden/i,
      viewport.name + ": live cover thesis",
    );
    assert.equal(
      await page.locator("#inicio .pd16-thesis").isVisible(),
      true,
      viewport.name + ": cover heading visible",
    );

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    assert.equal(overflow, false, `${viewport.name}: horizontal overflow`);

    await page.locator("[data-set-lang='en']").click();
    assert.equal(await page.locator("html").getAttribute("lang"), "en");
    assert.equal(await page.locator("#inicio [data-doc]").count(),4);

    for(const file of ["proyecto-bodytone.html","proyecto-calculadora.html","proyecto-linkedin.html","proyecto-outreach.html"]) {
      await page.goto(new URL(file+"?lang=es",url).href,{waitUntil:"domcontentloaded"});
      assert.equal(await page.locator(".case-section").count(),4,file+" case chapters");
      assert.equal(await page.locator(".case-utility-group").count(),2,file+" theme/language controls");
      const coolDark=await page.locator(".case-section.light").first().evaluate(el=>getComputedStyle(el).backgroundImage);
      assertNeutralPaint(coolDark,file+" case chapter, dark theme");
      await page.locator("[data-case-theme='light']").click();
      const coolLight=await page.locator(".case-section.light").first().evaluate(el=>getComputedStyle(el).backgroundImage);
      assertNeutralPaint(coolLight,file+" case chapter, light theme");
      assert.equal(await page.locator("html").getAttribute("data-theme"),"light",file+" theme toggle");
      const out=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
      assert.ok(out<=1,file+" responsive width");
      await page.locator("[data-case-theme='dark']").click();
    }
    assert.deepEqual(pageErrors, [], `${viewport.name}: page errors`);
    assert.deepEqual(consoleErrors, [], `${viewport.name}: console errors`);
    await context.close();
  }

  console.log("PROFESSIONAL DECK P41 LIVE PASS · eight real chapters / canonical documents / cool-neutral cases");
  console.log(`URL: ${response.url}`);
  console.log(`HTTP: ${response.status}`);
} finally {
  await browser.close();
}
