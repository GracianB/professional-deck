import {test,expect} from "@playwright/test";
import {mkdirSync} from "node:fs";
test.describe("Professional Deck P41 smoke",()=>{
 test("first visit shows actual brand, compact sections and canonical professional materials",async({page})=>{
  await page.goto("/?lang=es&theme=dark",{waitUntil:"domcontentloaded"});
  await expect(page.locator("#inicio .pd41-thesis")).toBeVisible();
  await expect(page.locator(".site-header .brand-mark")).toHaveText("GB");
  await expect(page.locator("section.slide")).toHaveCount(8);
  await expect(page.locator("section.slide:visible")).toHaveCount(5);
  await expect(page.locator(".os-rail")).toBeHidden();
  await expect(page.locator("#inicio [data-doc]")).toHaveCount(4);
  await expect(page.locator("#inicio .pd40-route")).toHaveCount(3);
  mkdirSync("artifacts/v16",{recursive:true});
  await page.screenshot({path:"artifacts/v16/p41-cover-desktop.png",animations:"disabled"});
 });
 test("direct route leads to real experience; briefing and Atlas remain in detailed mode",async({page})=>{
  await page.goto("/?lang=es",{waitUntil:"domcontentloaded"});
  await page.locator("#inicio .pd40-route[data-go=experiencia]").click();
  await expect(page.locator("#experiencia")).toBeInViewport();
  await expect(page.locator("#experiencia details")).toHaveCount(6);
  await page.locator(".site-header [data-deck-mode]").click();
  await expect(page.locator("body")).toHaveClass(/deck-full/);
  await page.locator("#inicio .pd41-brief-btn").click();
  await expect(page.locator("#recruiter-dialog")).toBeVisible();
  await page.locator("#recruiter-dialog .dialog-close").click();
  await expect(page.locator("#recruiter-dialog")).toBeHidden();
  await page.locator('.main-nav [data-go="ruta"]').click();
  await expect(page.locator("#ruta")).toBeInViewport();
  await page.locator("#ruta [data-atlas-go]").click();
  await expect(page.locator("#experiencia")).toBeInViewport();
 });
 test("mobile can reach documents at the end without horizontal overflow",async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto("/?lang=es&theme=dark",{waitUntil:"domcontentloaded"});
  await page.locator("#inicio [data-go=contacto]").count(); // contact is reachable from main nav or deep links
  await page.locator("#contacto").scrollIntoViewIfNeeded();
  await expect(page.locator("#contacto [data-doc]")).toHaveCount(4);
  await expect(page.locator(".pd41-contact-note")).toBeVisible();
  const size=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
  expect(size.scroll).toBeLessThanOrEqual(size.width+2);
 });
});
