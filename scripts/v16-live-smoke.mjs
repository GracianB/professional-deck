#!/usr/bin/env node
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const url = process.env.PD_LIVE_URL || "https://gracianb.github.io/professional-deck/";

const response = await fetch(url, {
  redirect: "follow",
  headers: { "user-agent": "professional-deck-v18-live-smoke" },
});

assert.equal(response.ok, true, `Live deck returned HTTP ${response.status}`);
const html = await response.text();

assert.match(html, /Professional Deck/);
assert.match(html, /pd16-cover/);
assert.match(html, /pd17-atlas-map/);
assert.match(html, /data-brief-chapters/);
assert.match(html, /v17-atlas.css/);
assert.match(html, /v18-story.css/);
assert.match(html, /id="modelo"/);
assert.match(html, /id="capacidades"/);
assert.match(html, /RevOps Studio/);
assert.match(html, /project-ohana/);
assert.match(html, /vortex-gilt-xi\.vercel\.app/);
assert.match(html, /systems-lab/);
assert.doesNotMatch(html, /Mood Fitness/i);
assert.doesNotMatch(html, /open to senior roles|roles senior/i);

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

    assert.deepEqual(pageErrors, [], `${viewport.name}: page errors`);
    assert.deepEqual(consoleErrors, [], `${viewport.name}: console errors`);
    await context.close();
  }

  console.log("PROFESSIONAL DECK V18 LIVE PASS");
  console.log(`URL: ${response.url}`);
  console.log(`HTTP: ${response.status}`);
} finally {
  await browser.close();
}
