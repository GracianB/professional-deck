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
      // Beige is a deliberately pale editorial surface even in DARK mode.
      const editorialDark=await page.locator("#case-challenge").evaluate(el=>({
        surface:getComputedStyle(el).backgroundImage,
        heading:getComputedStyle(el.querySelector("h2")).color
      }));
      expect(editorialDark.surface).toContain("rgb(243, 236, 223)");
      expect(Number(editorialDark.heading.match(/[0-9.]+/)[0])).toBeLessThan(100);
      const systemDark=await page.locator("#case-system h2").evaluate(el=>getComputedStyle(el).color);
      expect(Number(systemDark.match(/[0-9.]+/)[0])).toBeGreaterThan(170);
      const totalWidth=await page.evaluate(()=>document.documentElement.scrollWidth);
      expect(totalWidth).toBeLessThanOrEqual(width+1);
      if(width<500){
        for(const id of ["challenge","system","response","proof"]){
          const section=page.locator("#case-"+id);
          await section.scrollIntoViewIfNeeded();
          await expect(section).toBeInViewport();
          const state=await section.evaluate(el=>{
            const box=el.getBoundingClientRect();
            const style=getComputedStyle(el);
            return {height:box.height,width:box.width,display:style.display,visibility:style.visibility};
          });
          expect(state.height).toBeGreaterThan(100);
          expect(state.width).toBeLessThanOrEqual(width+1);
          expect(state.visibility).toBe("visible");
        }
        await page.evaluate(()=>window.scrollTo({top:0,behavior:"instant"}));
      }
      mkdirSync("artifacts/v16/cases",{recursive:true});
      await page.screenshot({path:`artifacts/v16/cases/${key}-dark-${label}.png`,fullPage:width>=500});
      await page.locator("[data-case-theme='light']").click();
      await expect(page.locator("html")).toHaveAttribute("data-theme","light");
      const cssLight=await page.locator("body.case-body").evaluate(el=>getComputedStyle(el).getPropertyValue("--bg").trim().toLowerCase());
      expect(cssLight).toBe("#f5f1e9");
      const editorialLight=await page.locator("#case-challenge").evaluate(el=>({
        surface:getComputedStyle(el).backgroundImage,
        heading:getComputedStyle(el.querySelector("h2")).color
      }));
      expect(editorialLight.surface).toContain("rgb(238, 228, 212)");
      expect(Number(editorialLight.heading.match(/[0-9.]+/)[0])).toBeLessThan(105);
      const systemLight=await page.locator("#case-system").evaluate(el=>({
        surface:getComputedStyle(el).backgroundImage,
        heading:getComputedStyle(el.querySelector("h2")).color
      }));
      expect(systemLight.surface).toContain("rgb(36, 51, 62)");
      expect(Number(systemLight.heading.match(/[0-9.]+/)[0])).toBeGreaterThan(170);
      const stepDescription=await page.locator("#case-system .case-flow article p").first().evaluate(el=>getComputedStyle(el).color);
      const stepRGB=stepDescription.match(/[0-9.]+/g).map(Number);
      expect(Math.min(...stepRGB.slice(0,3)), "step copy lost contrast on navy: "+stepDescription).toBeGreaterThan(175);
      await page.screenshot({path:`artifacts/v16/cases/${key}-light-${label}.png`,fullPage:width>=500});
      if(width<500 && key==="bodytone"){
        await page.locator("#case-system").scrollIntoViewIfNeeded();
        await page.screenshot({path:"artifacts/v16/cases/bodytone-light-mobile-scrolled.png",fullPage:false});
      }
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
