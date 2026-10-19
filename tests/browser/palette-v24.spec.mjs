import {test,expect} from "@playwright/test";
import {mkdirSync} from "node:fs";
const chapters=[
 ["inicio",".pd41-route-grid .pd40-route"],["modelo",".pd20-model-track>li"],
 ["sistemas",".gb-star-main"],["demos",".gb-demo-card"],
 ["ruta",".pd17-atlas-stage"],["experiencia",".pd41-career-item"],
 ["formacion",".gb-edu-panel"],["contacto",".pd41-contact-note"]
];
for(const [device,width,height] of [["desktop",1440,900],["mobile",390,844]]){
 test("P41 platinum palette, eight purposeful chapters, two themes · "+device,async({page})=>{
  test.setTimeout(180000);await page.setViewportSize({width,height});
  mkdirSync("artifacts/v16/v24-palette",{recursive:true});
  for(const theme of ["dark","light"]){
   await page.goto("/?view=full&lang=es&theme="+theme,{waitUntil:"domcontentloaded"});
   await expect(page.locator(".deck .slide")).toHaveCount(8);
   for(const [id,sel] of chapters){
    const chapter=page.locator("#"+id),item=chapter.locator(sel).first();
    await expect(item,id+" real content").toHaveCount(1);
    const values=await chapter.evaluate(el=>{
      const c=getComputedStyle(el).backgroundColor;
      return (c.match(/[0-9.]+/g)||[]).slice(0,3).map(Number);
    });
    expect(values.length).toBe(3);
    if(theme==="dark")expect(Math.max(...values),id+" remains dark").toBeLessThan(105);
    else expect(Math.min(...values),id+" becomes pale").toBeGreaterThan(175);
    await item.scrollIntoViewIfNeeded();
    await expect(item,id+" visible").toBeVisible();
   }
   await page.screenshot({path:"artifacts/v16/v24-palette/p41-"+device+"-"+theme+".png",animations:"disabled"});
   const x=await page.evaluate(()=>({w:innerWidth,sw:document.documentElement.scrollWidth}));
   expect(x.sw).toBeLessThanOrEqual(x.w+2);
  }
 });
}
test("P41 briefing remains keyboard accessible and dark-mode coherent",async({page})=>{
 await page.goto("/?view=full&theme=dark#inicio",{waitUntil:"domcontentloaded"});
 await page.locator("#inicio .pd41-brief-btn").click();
 await expect(page.locator("#recruiter-dialog")).toBeVisible();
 await expect(page.locator("#recruiter-dialog [data-brief-chapter]")).toHaveCount(4);
 await page.locator("#recruiter-dialog .dialog-close").click();
 await page.locator("[data-set-theme=light]").click();
 await expect(page.locator("html")).toHaveAttribute("data-theme","light");
 await page.locator("#inicio .pd41-brief-btn").click();
 await expect(page.locator("#recruiter-dialog")).toBeVisible();
});
