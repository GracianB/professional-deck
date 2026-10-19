import {test,expect} from "@playwright/test";
import {mkdirSync} from "node:fs";

const scenarios=[
  ["mobile-es-dark",390,844,"es","dark"],
  ["mobile-en-light",390,844,"en","light"],
  ["tablet-es-light",768,1024,"es","light"],
  ["desktop-en-dark",1440,900,"en","dark"]
];
for (const [name,width,height,language,theme] of scenarios) {
  test("P40 visual and navigation contract · "+name,async({page,browserName})=>{
    await page.setViewportSize({width,height});
    const errors=[];
    page.on("pageerror",e=>errors.push(e.message));
    await page.goto("/?lang="+language+"&theme="+theme,{waitUntil:"domcontentloaded"});
    await expect(page.locator("body")).toHaveClass(/deck-focus/);
    await expect(page.locator("html")).toHaveAttribute("data-theme",theme);
    await expect(page.locator("html")).toHaveAttribute("lang",language);
    await expect(page.locator(".pd40-compass")).toBeVisible();
    await expect(page.locator("#pd20-cinema")).toBeHidden();
    await expect(page.locator("section.slide:visible")).toHaveCount(5);
    const layout=await page.evaluate(()=>({
      docWidth:document.documentElement.scrollWidth,
      viewport:innerWidth,
      compass:document.querySelector(".pd40-compass").getBoundingClientRect().width,
      main:document.querySelector(".deck").getBoundingClientRect().width
    }));
    expect(layout.docWidth,name+" no horizontal overflow").toBeLessThanOrEqual(layout.viewport+2);
    expect(layout.compass,name+" usable focus index").toBeGreaterThan(200);
    expect(layout.main,name+" main readable").toBeGreaterThan(300);
    mkdirSync("artifacts/p40",{recursive:true});
    if(browserName==="chromium"){
      await page.screenshot({path:"artifacts/p40/"+name+"-cover.png",animations:"disabled"});
    }
    const route=page.locator('.pd40-compass .pd40-route[data-go="demos"]');
    await route.click();
    await expect(page.locator("#demos")).toBeInViewport();
    await expect(page.locator('#demos a[href="https://gracianb.github.io/revops-studio/demo.html"]')).toHaveCount(1);
    await expect(page.locator("#demos .pd40-demo-disclaimer")).toContainText(language==="en"?"SAMPLE DATA":"DATOS DE EJEMPLO");
    if(browserName==="chromium"){
      await page.screenshot({path:"artifacts/p40/"+name+"-projects.png",animations:"disabled"});
    }
    await page.locator(width<=980?".pd40-mobile-detail":".site-header [data-deck-mode]").click();
    await expect(page.locator("body")).toHaveClass(/deck-full/);
    await expect(page.locator("#modelo")).toBeVisible();
    const atlas=page.locator(".main-nav [data-go='ruta']");
    if (!(await atlas.isVisible())) await page.locator(".menu-toggle").click();
    await atlas.click();
    await expect(page.locator("#ruta")).toBeInViewport();
    expect(errors).toEqual([]);
  });
}
