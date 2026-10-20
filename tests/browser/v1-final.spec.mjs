import {test,expect} from "@playwright/test";

test("P43 · the cover is a live operational instrument, not an orbit",async({page})=>{
 await page.goto("/?lang=es&theme=dark",{waitUntil:"domcontentloaded"});
 const panel=page.locator("#inicio [data-deck-engine]");
 const steps=panel.locator(".pd43-system-step");
 await expect(panel).toBeVisible();
 await expect(steps).toHaveCount(3);
 for(const [id,label] of [["sistemas","Ver Sistemas"],["experiencia","Ver Experiencia"],["demos","Ver Proyectos"]]){
   await expect(panel.locator('.pd43-system-step[data-go="'+id+'"]')).toHaveAttribute("aria-label",label);
 }
 await expect(page.locator("#inicio .pd41-orbit")).toHaveCount(0);
 await expect(page.locator(".pd20-cinema-orbit")).toHaveCount(0);
 await expect(page.locator(".pd17-brief-orbit")).toHaveCount(0);
 const beam=panel.locator(".pd43-signal-beam");
 await expect(beam).toHaveCSS("animation-name","pd43-signal-run");
 await expect.poll(async()=>beam.evaluate(el=>getComputedStyle(el).transform),{intervals:[180,300],timeout:3000}).not.toBe("none");
 await panel.hover();
 await expect(beam).toHaveCSS("animation-play-state","paused");
 await panel.locator('.pd43-system-step[data-go="experiencia"]').click();
 await expect(page).toHaveURL(/#experiencia$/);
 await expect(page.locator("#experiencia")).toBeInViewport();
 await page.locator('[data-set-lang="en"]').click();
 await expect(panel).toHaveAttribute("aria-label","Interactive operating panel: open systems, experience or projects");
 await expect(panel.locator('.pd43-system-step[data-go="sistemas"]')).toHaveAttribute("aria-label","Open Systems");
});

test("P43 · reduced motion freezes signal data, not keyboard navigation",async({page})=>{
 await page.emulateMedia({reducedMotion:"reduce"});
 await page.goto("/?lang=en&theme=dark",{waitUntil:"domcontentloaded"});
 const panel=page.locator("[data-deck-engine]");
 const steps=panel.locator(".pd43-system-step");
 await expect(steps).toHaveCount(3);
 await expect(panel.locator(".pd43-signal-beam")).toHaveCSS("animation-name","none");
 await expect(panel.locator(".pd43-step-pulse i").first()).toHaveCSS("animation-name","none");
 await steps.first().focus();
 await expect(steps.first()).toBeFocused();
 await page.keyboard.press("Enter");
 await expect(page).toHaveURL(/#sistemas$/);
});

test("P43 · mobile uses a compact rectilinear instrument in light and dark",async({page})=>{
 await page.setViewportSize({width:375,height:780});
 for(const theme of ["light","dark"]){
   await page.goto("/?theme="+theme+"&lang=es",{waitUntil:"domcontentloaded"});
   await expect(page.locator("#inicio .pd43-system")).toBeVisible();
   await expect(page.locator("#inicio .pd43-system-display")).toBeHidden();
   await expect(page.locator("#inicio .pd43-system-step")).toHaveCount(3);
   await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
 }
});

test("V1 · switching brief/full preserves the reading anchor in the unified timeline",async({page})=>{
 await page.setViewportSize({width:1440,height:850});
 await page.goto("/?view=full&lang=es&theme=dark#experiencia",{waitUntil:"domcontentloaded"});
 const last=page.locator('#experiencia [data-career="primark"]');
 await last.locator("summary").scrollIntoViewIfNeeded();
 const before=await last.locator("summary").boundingBox();
 await expect(page.locator("body")).toHaveClass(/deck-full/);
 await page.locator(".site-header [data-deck-mode]").click();
 await expect(page.locator("body")).toHaveClass(/deck-focus/);
 await expect(page).toHaveURL(/#experiencia$/);
 await expect(last.locator("summary")).toBeInViewport();
 await page.locator(".site-header [data-deck-mode]").click();
 await expect(page.locator("body")).toHaveClass(/deck-full/);
 await expect(last.locator("summary")).toBeInViewport();
 const after=await last.locator("summary").boundingBox();
 expect(Math.abs(after.y-before.y)).toBeLessThan(100);
});

test("V1 · hiding a full-only chapter lands in closest meaningful quick-view section",async({page})=>{
 await page.goto("/?view=full&lang=es&theme=dark#ruta",{waitUntil:"domcontentloaded"});
 await expect(page.locator("#ruta")).toBeInViewport();
 await page.locator(".site-header [data-deck-mode]").click();
 await expect(page.locator("body")).toHaveClass(/deck-focus/);
 await expect(page.locator("#ruta")).toBeHidden();
 await expect(page).toHaveURL(/#experiencia$/);
 await expect(page.locator("#experiencia")).toBeInViewport();
 await page.locator(".site-header [data-deck-mode]").click();
 await expect(page.locator("body")).toHaveClass(/deck-full/);
 await expect(page.locator("#experiencia")).toBeInViewport();
});

test("V1 · custom scroll track and cool platinum surface across themes",async({page})=>{
 await page.setViewportSize({width:1280,height:820});
 for(const theme of ["dark","light"]){
  await page.goto("/?view=full&lang=es&theme="+theme+"#demos",{waitUntil:"domcontentloaded"});
  const results=await page.evaluate(()=>{
   const deck=document.querySelector(".deck");
   const surface=document.querySelector("#demos .gb-demo-card:nth-child(2)");
   const bg=getComputedStyle(surface).backgroundImage;
   const scroll=getComputedStyle(deck);
   return {scrollbar:scroll.scrollbarColor,snap:scroll.scrollSnapType,overflow:scroll.overflowY,
     background:bg,thumb:getComputedStyle(deck,"::-webkit-scrollbar-thumb").backgroundImage};
  });
  expect(results.snap).toBe("none");
  expect(results.overflow).toBe("auto");
  expect(results.background).not.toContain("196, 192, 187");
  expect(results.background).not.toContain("244, 243, 238");
  if(theme==="dark")expect(results.background).toContain("24, 39, 53");
  else expect(results.background).toBe("none");
  await expect(page.locator("#demos .gb-demo-card").first()).toBeVisible();
 }
});
