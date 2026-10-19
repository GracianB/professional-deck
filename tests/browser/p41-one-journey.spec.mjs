import {test,expect} from "@playwright/test";

const BASE="https://gracianb.github.io/GracianB/";
const DOCUMENTS={
  "cv-es":"Gracian_Baena_CV_2026_ES.pdf",
  "cv-en":"Gracian_Baena_CV_2026_EN.pdf",
  "letter-es":"Gracian_Baena_Carta_Presentacion_ES.pdf",
  "letter-en":"Gracian_Baena_Cover_Letter_EN.pdf"
};
test("P41 · eight useful sections, five-stop overview, no old SVG career art",async({page})=>{
 await page.goto("/?lang=es&theme=dark",{waitUntil:"domcontentloaded"});
 await expect(page.locator(".deck > .slide")).toHaveCount(8);
 await expect(page.locator(".deck > .slide:visible")).toHaveCount(5);
 for(const id of ["metodo","trayectoria","capacidades","experiencia-2"])await expect(page.locator("#"+id)).toHaveCount(0);
 await expect(page.locator(".os-rail")).toBeHidden();
 await expect(page.locator("#experiencia [data-career]")).toHaveCount(6);
 await expect(page.locator("#experiencia .pd18-brand-art")).toHaveCount(0);
 await expect(page.locator("#experiencia [data-career='bodytone']")).toHaveAttribute("open","");
 await expect(page.locator("#experiencia [data-career='bodytone'] [data-career-copy] p")).toHaveCount(5);
 await page.locator("#experiencia [data-career='minderest'] summary").click();
 await expect(page.locator("#experiencia [data-career='minderest']")).toHaveAttribute("open","");
 await expect(page.locator("#experiencia [data-career='minderest'] [data-career-copy] p")).toHaveCount(4);
 await page.locator("[data-set-lang='en']").click();
 await expect(page.locator("#experiencia [data-career='minderest'] [data-career-meta]")).toContainText("Remote");
 await expect(page.locator("#experiencia [data-career='minderest'] summary")).toContainText("MINDEREST");
 await page.locator("#experiencia [data-career='primark'] summary").scrollIntoViewIfNeeded();
 const isVisible=await page.locator("#experiencia [data-career='primark']").isVisible();
 expect(isVisible).toBe(true);

});
test("P41 · updated document links share one canonical source, language menu updates",async({page})=>{
 await page.goto("/?lang=es",{waitUntil:"domcontentloaded"});
 for(const [key,path] of Object.entries(DOCUMENTS)){
  await expect(page.locator("#inicio [data-doc='"+key+"']")).toHaveAttribute("href",BASE+path);
  await expect(page.locator("#contacto [data-doc='"+key+"']")).toHaveAttribute("href",BASE+path);
 }
 await page.locator("[data-set-lang='en']").click();
 await expect(page.locator("[data-cv-link]").first()).toHaveAttribute("href",BASE+DOCUMENTS["cv-en"]);
 await expect(page.locator("#contacto [data-doc='letter-en']")).toContainText("Cover letter");
});
test("P41 · real dark and light contact and brand on left",async({page})=>{
 for(const theme of ["dark","light"]){
  await page.goto("/?lang=es&theme="+theme,{waitUntil:"domcontentloaded"});
  await expect(page.locator("html")).toHaveAttribute("data-theme",theme);
  const colors=await page.evaluate(()=>{
   const color=selector=>getComputedStyle(document.querySelector(selector)).backgroundColor;
   const b=document.querySelector(".site-header .brand").getBoundingClientRect();
   const h=document.querySelector(".site-header").getBoundingClientRect();
   return {contact:color("#contacto"),visual:color(".pd41-contact-note"),brandLeft:b.left,headerLeft:h.left,visualVisible:!!document.querySelector(".pd41-contact-note").getClientRects().length};
  });
  expect(colors.headerLeft).toBeLessThanOrEqual(1);
  expect(colors.brandLeft).toBeLessThan(80);
  const parse=rgb=>(rgb.match(/[\d.]+/g)||[]).slice(0,3).map(Number);
  const avg=a=>a.reduce((x,y)=>x+y,0)/a.length;
  const c=parse(colors.contact),v=parse(colors.visual);
  if(theme==="dark"){expect(avg(c)).toBeLessThan(50);expect(avg(v)).toBeLessThan(90);}
  else{expect(avg(c)).toBeGreaterThan(180);expect(avg(v)).toBeGreaterThan(180);}
  const paint=await page.evaluate(()=>{
    const selectors=["#contacto .pd19-contact-link","#contacto .pd19-contact-languages",
      "#contacto .pd19-contact-primary","#contacto .pd19-contact-secondary"];
    return selectors.map(selector=>({selector,value:getComputedStyle(document.querySelector(selector)).backgroundColor}));
  });
  for(const {selector,value} of paint){
    const rgb=(value.match(/[0-9.]+/g)||[]).slice(0,3).map(Number);
    expect(rgb.length,selector+" opaque fill").toBe(3);
    expect(rgb[1]+1,selector+" cool green>=red in "+theme).toBeGreaterThanOrEqual(rgb[0]);
    expect(rgb[2]+1,selector+" cool blue>=green in "+theme).toBeGreaterThanOrEqual(rgb[1]);
  }
  expect(colors.visualVisible).toBe(true);
 }
});
test("P41 · previous chapter links resolve into current sections",async({page})=>{
 for(const [oldId,next] of [["trayectoria","experiencia"],["experiencia-2","experiencia"],["metodo","sistemas"],["capacidades","demos"]]){
  await page.goto("/?lang=es#"+oldId,{waitUntil:"domcontentloaded"});
  await expect(page).toHaveURL(new RegExp("#"+next+"$"));
  await expect(page.locator("#"+next)).toBeVisible();
 }
});

test("P41 · mobile document cards are not clipped in contact",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto("/?view=full&lang=es&theme=dark#contacto",{waitUntil:"domcontentloaded"});
 await expect(page.locator("#contacto [data-doc]")).toHaveCount(4);
 for(const key of Object.keys(DOCUMENTS)) {
  const item=page.locator('#contacto [data-doc="'+key+'"]');
  await item.scrollIntoViewIfNeeded();
  await expect(item).toBeInViewport();
 }
 const dims=await page.evaluate(()=>({document:document.documentElement.scrollWidth,window:innerWidth}));
 expect(dims.document).toBeLessThanOrEqual(dims.window+2);
});
