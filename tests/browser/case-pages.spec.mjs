import {test,expect} from "@playwright/test";
import {mkdirSync} from "node:fs";

const pages=[
  ["bodytone","proyecto-bodytone.html","Bodytone"],
  ["calculadora","proyecto-calculadora.html","Calculadora"],
  ["linkedin","proyecto-linkedin.html","LinkedIn"],
  ["outreach","proyecto-outreach.html","Outreach"],
];

for(const [key,path,title] of pages) {
  for(const [label,width,height] of [["desktop",1440,900],["mobile",390,844]]) {
    test(`V21 ${key}: unified case design, themes and navigation on ${label}`,async ({browser})=>{
      const context=await browser.newContext({viewport:{width,height},isMobile:width<500,hasTouch:width<500});
      const page=await context.newPage();
      const errors=[];
      page.on("pageerror",error=>errors.push(error.message));
      await page.goto("/"+path+"?lang=es",{waitUntil:"domcontentloaded"});
      await expect(page.locator("body.case-body")).toBeVisible();
      await expect(page.locator(".case-hero h1")).toContainText(new RegExp(title,"i"));
      await expect(page.locator(".case-hero-aside dl>div")).toHaveCount(4);
      await expect(page.locator(".case-section")).toHaveCount(4);
      await expect(page.locator(".case-section article")).toHaveCount(12);
      await expect(page.locator(".case-local-nav a")).toHaveCount(4);
      await expect(page.locator(".case-utility-group")).toHaveCount(2);
      await expect(page.locator("[data-case-theme='dark']")).toHaveAttribute("aria-pressed","true");
      await expect(page.locator("[data-case-lang='es']")).toHaveAttribute("aria-pressed","true");
      const css=await page.locator("body.case-body").evaluate(el=>getComputedStyle(el).getPropertyValue("--bg").trim().toLowerCase());
      expect(css).toBe("#091620");
      const textDark=await page.locator(".case-section.light .case-section-heading h2").first().evaluate(el=>getComputedStyle(el).color);
      const rgbDark=textDark.match(/[0-9.]+/g).map(Number);
      expect(rgbDark[0]).toBeGreaterThan(170);
      const totalWidth=await page.evaluate(()=>document.documentElement.scrollWidth);
      expect(totalWidth).toBeLessThanOrEqual(width+1);
      mkdirSync("artifacts/v16/cases",{recursive:true});
      await page.screenshot({path:`artifacts/v16/cases/${key}-dark-${label}.png`,fullPage:true});
      await page.locator("[data-case-theme='light']").click();
      await expect(page.locator("html")).toHaveAttribute("data-theme","light");
      const cssLight=await page.locator("body.case-body").evaluate(el=>getComputedStyle(el).getPropertyValue("--bg").trim().toLowerCase());
      expect(cssLight).toBe("#eef6f8");
      const textLight=await page.locator(".case-section.light .case-section-heading h2").first().evaluate(el=>getComputedStyle(el).color);
      const rgbLight=textLight.match(/[0-9.]+/g).map(Number);
      expect(rgbLight[0]).toBeLessThan(105);
      await page.screenshot({path:`artifacts/v16/cases/${key}-light-${label}.png`,fullPage:true});
      await page.locator(".case-local-nav a").nth(1).click();
      await expect(page).toHaveURL(/#case-system$/);
      await page.locator("[data-case-lang='en']").click();
      await expect(page.locator("html")).toHaveAttribute("lang","en");
      await expect(page.locator("[data-case-lang='en']")).toHaveAttribute("aria-pressed","true");
      await expect(page.locator("[data-case-theme='light']")).toHaveAttribute("aria-pressed","true");
      await expect(page.locator(".case-local-nav")).toContainText("CHALLENGE");
      await expect(page.locator(".case-header nav")).toContainText("Portfolio");
      const after=await page.evaluate(()=>document.documentElement.scrollWidth);
      expect(after).toBeLessThanOrEqual(width+1);
      expect(errors).toEqual([]);
      await context.close();
    });
  }
}

test("V21 shared theme persists when navigating between independent pages and deck",async({page})=>{
  await page.goto("/proyecto-bodytone.html?lang=es");
  await page.locator("[data-case-theme='light']").click();
  await page.goto("/proyecto-calculadora.html");
  await expect(page.locator("html")).toHaveAttribute("data-theme","light");
  await page.goto("/index.html?lang=es#inicio");
  await expect(page.locator("html")).toHaveAttribute("data-theme","light");
});
