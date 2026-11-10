import { test, expect } from "@playwright/test";

for (const [language,theme,width,height] of [
  ["en","dark",1440,900],["es","light",390,844],["en","dark",320,720]
]) {
  test(`P44 professional signal · ${language} · ${theme} · ${width}px`, async ({page})=>{
    await page.setViewportSize({width,height});
    const errors=[];
    page.on("pageerror",e=>errors.push(e.message));
    await page.goto(`/?lang=${language}&theme=${theme}`,{waitUntil:"domcontentloaded"});
    const signal=page.locator("#inicio .pd26-evidence-route");
    await expect(signal).toBeVisible();
    await expect(signal.locator(".pd26-evidence-label")).toContainText(language==="en"?"EVIDENCE":"COMPROBAR");
    await expect(signal.locator(".pd26-evidence-links a")).toHaveCount(2);
    await expect(signal.locator('a[href="./proyecto-bodytone.html"]')).toHaveCount(1);
    const application=signal.locator('a[href*="apply.html?track=professional"]');
    await expect(application).toHaveCount(1);
    await expect(application).toHaveAttribute("rel","noopener noreferrer");
    const box=await signal.boundingBox();
    expect(box).not.toBeNull();
    expect(box.x).toBeGreaterThanOrEqual(-1);
    expect(box.x+box.width).toBeLessThanOrEqual(width+2);
    const docWidth=await page.evaluate(()=>document.documentElement.scrollWidth);
    expect(docWidth).toBeLessThanOrEqual(width+2);
    expect(errors).toEqual([]);
  });
}
