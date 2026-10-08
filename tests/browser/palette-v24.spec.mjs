import {test,expect} from "@playwright/test";
import {mkdirSync} from "node:fs";

const chapters=[
 ["inicio",".pd16-os"],["modelo",".pd20-model-track>li"],
 ["sistemas",".gb-star-main"],["demos",".gb-demo-card"],
 ["metodo",".pd18-method-flow .gb-step"],["ruta",".pd17-atlas-stage"],
 ["trayectoria",".pd18-evo-rail li"],["experiencia",".gb-role"],
 ["experiencia-2",".gb-role"],["capacidades",".pd18-cap-grid article"],
 ["formacion",".gb-edu-panel"],["contacto",".pd19-contact-link"]
];

for(const [screen,width,height] of [["desktop",1440,900],["mobile",390,844]]) {
 test(`V24 complete twelve-slide audit, two themes, ${screen}`,async({page})=>{
   test.setTimeout(180000);
   await page.setViewportSize({width,height});
   await page.addInitScript(()=>{
     try { sessionStorage.setItem("gb-professional-deck-v20-opening-seen","1"); } catch (_) {}
   });
   mkdirSync("artifacts/v16/v24-palette",{recursive:true});
   const seen=new Set();
   for(const theme of ["dark","light"]){
     for(const [id,selector] of chapters){
       await page.goto(`/?lang=es&theme=${theme}#${id}`,{waitUntil:"domcontentloaded"});
       await expect(page.locator("html")).toHaveAttribute("data-theme",theme);
       const chapter=page.locator("#"+id);
       await expect(chapter).toHaveCount(1);
       const card=chapter.locator(selector).first();
       await expect(card).toHaveCount(1);
       const styles=await chapter.evaluate((el,sel)=>{
         const card=el.querySelector(sel);
         const chapterStyle=getComputedStyle(el);
         const cardStyle=getComputedStyle(card);
         return {
           background:chapterStyle.backgroundColor,
           cardBackground:cardStyle.backgroundImage,
           cardColor:cardStyle.color,
           pageWidth:document.documentElement.scrollWidth,
           viewport:innerWidth,
           cardWidth:card.getBoundingClientRect().width,
           cardHeight:card.getBoundingClientRect().height
         };
       },selector);
       const rgb=styles.background.match(/[0-9.]+/g)?.map(Number)??[];
       expect(rgb.length,id+" "+theme).toBeGreaterThanOrEqual(3);
       if(theme==="dark"){
         expect(Math.max(...rgb.slice(0,3)),id+" dark palette "+styles.background).toBeLessThan(90);
       }else{
         expect(Math.min(...rgb.slice(0,3)),id+" ivory light palette "+styles.background).toBeGreaterThan(210);
       }
       expect(styles.cardWidth,id+" card fits").toBeGreaterThan(40);
       expect(styles.cardHeight,id+" card renders").toBeGreaterThan(20);
       expect(styles.pageWidth,id+" horizontal overflow").toBeLessThanOrEqual(styles.viewport+2);
       seen.add(id+theme);
       await chapter.scrollIntoViewIfNeeded();
       await page.screenshot({path:`artifacts/v16/v24-palette/${screen}-${theme}-${id}.png`,fullPage:false,animations:"disabled"});
     }
   }
   expect(seen.size).toBe(24);
 });
}

test("V24 chrome, progress, cinema and briefing share neutral silver family",async({page})=>{
  await page.goto("/?lang=es&theme=dark#inicio",{waitUntil:"domcontentloaded"});
  const chrome=await page.evaluate(()=>({
    header:getComputedStyle(document.querySelector(".site-header")).backgroundColor,
    rail:getComputedStyle(document.querySelector(".os-rail")).backgroundColor,
    progress:getComputedStyle(document.querySelector(".top-progress i")).backgroundColor
  }));
  expect(chrome.progress).toBe("rgb(217, 201, 180)");
  await page.locator("#inicio [data-open-recruiter]").click();
  const brief=page.locator("#recruiter-dialog");
  await expect(brief).toBeVisible();
  await expect(brief.locator("[data-brief-chapter]")).toHaveCount(4);
  await brief.locator(".dialog-close").click();
  await page.locator("[data-set-theme='light']").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme","light");
  await page.locator("#inicio [data-open-recruiter]").click();
  await expect(brief).toBeVisible();
  await expect(brief.locator(".pd17-brief-chapters button[aria-pressed='true']")).toHaveCount(1);
  await brief.locator(".dialog-close").click();
});
