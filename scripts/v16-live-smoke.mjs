#!/usr/bin/env node
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const url = process.env.PD_LIVE_URL || "https://gracianb.github.io/professional-deck/";

const response = await fetch(url, {
  redirect: "follow",
  headers: { "user-agent": "professional-deck-v20-live-smoke" },
});

assert.equal(response.ok, true, `Live deck returned HTTP ${response.status}`);
const html = await response.text();

assert.match(html, /Professional Deck/);
assert.match(html, /pd16-cover/);
assert.match(html, /pd17-atlas-map/);
assert.match(html, /data-brief-chapters/);
assert.match(html, /v17-atlas.css/);
assert.match(html, /v18-story.css/);
assert.match(html, /v19-final.css/);
assert.match(html, /v20-theme.css/);
assert.match(html, /v20-light.css/);
assert.match(html, /v20-cinema.js/);
assert.match(html, /data-cinema-skip/);
assert.match(html, /data-atlas-tour/);
assert.match(html, /pd19-contact-wrap/);
assert.match(html, /id="modelo"/);
assert.match(html, /id="capacidades"/);
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
  assert.match(source,/case-pages\.css\?v=deck-v21/,file+" shared case stylesheet");
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

    assert.equal(await page.locator(".deck .slide").count(), 12);
    assert.equal(await page.locator("[data-atlas-stops] button").count(), 6);
    assert.equal(await page.locator("#contacto .pd19-contact-link").count(), 4);
    assert.equal(await page.locator("[data-atlas-tour]").count(), 1);
    assert.equal(await page.locator("[data-brief-chapter]").count(), 4);
    await page.locator("#inicio [data-open-recruiter]").click();
    assert.equal(await page.locator("[data-brief-clock]").innerText(), "00:00");
    await page.locator("[data-brief-chapter=\"2\"]").click();
    assert.equal(await page.locator("[data-brief-clock]").innerText(), "00:30");
    await page.locator("#recruiter-dialog .dialog-close").click();
    assert.match(await page.locator(".pd16-name").innerText(), /GRACIÁN[\s\S]*BAENA/);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    assert.equal(overflow, false, `${viewport.name}: horizontal overflow`);

    await page.locator("[data-set-lang='en']").click();
    assert.equal(await page.locator("html").getAttribute("lang"), "en");
    assert.match(await page.locator(".pd16-proof-strip").innerText(), /ES · EN · IT/);

    for(const file of ["proyecto-bodytone.html","proyecto-calculadora.html","proyecto-linkedin.html","proyecto-outreach.html"]) {
      await page.goto(new URL(file+"?lang=es",url).href,{waitUntil:"domcontentloaded"});
      assert.equal(await page.locator(".case-section").count(),4,file+" case chapters");
      assert.equal(await page.locator(".case-utility-group").count(),2,file+" theme/language controls");
      const warmDark=await page.locator(".case-section.light").first().evaluate(el=>getComputedStyle(el).backgroundImage);
      assert.match(warmDark,/rgb\\(243, 236, 223\\)/,file+" beige chapter");
      await page.locator("[data-case-theme='light']").click();
      const warmLight=await page.locator(".case-section.light").first().evaluate(el=>getComputedStyle(el).backgroundImage);
      assert.match(warmLight,/rgb\\(238, 228, 212\\)/,file+" warm light theme");
      assert.equal(await page.locator("html").getAttribute("data-theme"),"light",file+" theme toggle");
      const out=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
      assert.ok(out<=1,file+" responsive width");
      await page.locator("[data-case-theme='dark']").click();
    }
    assert.deepEqual(pageErrors, [], `${viewport.name}: page errors`);
    assert.deepEqual(consoleErrors, [], `${viewport.name}: console errors`);
    await context.close();
  }

  console.log("PROFESSIONAL DECK V22 LIVE PASS");
  console.log(`URL: ${response.url}`);
  console.log(`HTTP: ${response.status}`);
} finally {
  await browser.close();
}
