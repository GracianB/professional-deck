import {test,expect} from "@playwright/test";

test("P43 · optional intro is a typographic scan, not a cosmic orbit",async({page})=>{
 await page.goto("/?intro=1&view=full&theme=dark&lang=es",{waitUntil:"domcontentloaded"});
 const intro=page.locator("#pd20-cinema");
 await expect(intro).toBeVisible();
 await expect(intro.locator(".pd43-cinema-ledger span")).toHaveCount(5);
 await expect(intro.locator(".pd43-cinema-wordmark")).toContainText("GB");
 await expect(page.locator(".pd20-cinema-orbit")).toHaveCount(0);
 await intro.locator("[data-cinema-skip]").click();
 await expect(intro).toBeHidden();
 await expect(page.locator("#inicio .pd43-system")).toBeVisible();
});

test("P43 · briefing replaces the orbital badge with a compact diagnostic plate",async({page})=>{
 await page.goto("/?view=full&theme=dark&lang=es",{waitUntil:"domcontentloaded"});
 await page.locator("#inicio .pd41-brief-btn").click();
 const dialog=page.locator("#recruiter-dialog");
 await expect(dialog).toBeVisible();
 await expect(dialog.locator(".pd43-brief-readout")).toBeVisible();
 await expect(dialog.locator(".pd43-brief-bars i")).toHaveCount(5);
 await expect(dialog.locator(".pd17-brief-orbit")).toHaveCount(0);
 await page.keyboard.press("Escape");
 await expect(dialog).toBeHidden();
});

test("P43 · a visitor requesting reduced motion never sees a forced opening",async({page})=>{
 await page.emulateMedia({reducedMotion:"reduce"});
 await page.goto("/?intro=1&theme=light&lang=en",{waitUntil:"domcontentloaded"});
 await expect(page.locator("#pd20-cinema")).toBeHidden();
 await expect(page.locator("#inicio [data-deck-engine]")).toBeVisible();
 await expect(page.locator("#inicio .pd43-system-live i")).toHaveCSS("animation-name","none");
});
