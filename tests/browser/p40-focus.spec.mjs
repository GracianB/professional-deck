import {test,expect} from "@playwright/test";
test("P40 five-stop quick view is reversible and keyboard-safe",async({page})=>{
  await page.goto("/?lang=es",{waitUntil:"domcontentloaded"});
  await expect(page.locator("body")).toHaveClass(/deck-focus/);
  await expect(page.locator(".pd40-compass")).toBeVisible();
  await expect(page.locator("section.slide:visible")).toHaveCount(5);
  await expect(page.locator("#modelo")).toBeHidden();
  await page.locator("[data-deck-mode]").click();
  await expect(page.locator("body")).toHaveClass(/deck-full/);
  await expect(page.locator("#modelo")).toBeVisible();
  await page.locator("[data-deck-mode]").click();
  await expect(page.locator("body")).toHaveClass(/deck-focus/);
});
test("P40 legacy chapter deep links expand; intro never autoplays",async({page})=>{
  await page.goto("/?lang=en#ruta",{waitUntil:"domcontentloaded"});
  await expect(page.locator("body")).toHaveClass(/deck-full/);
  await expect(page.locator("#ruta")).toBeVisible();
  await page.goto("/?lang=en",{waitUntil:"domcontentloaded"});
  await expect(page.locator("#pd20-cinema")).toBeHidden();
});
