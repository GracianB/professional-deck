import {test,expect} from "@playwright/test";

test("V1 · orbiting GB has three genuinely interactive destinations", async({page})=>{
 await page.goto("/?lang=es&theme=dark",{waitUntil:"domcontentloaded"});
 const orbit=page.locator("#inicio [data-orbit]");
 const nodes=orbit.locator(".v1-orbit-node");
 await expect(nodes).toHaveCount(3);
 for(const [id,route] of [["sistemas","Ver Sistemas"],["experiencia","Ver Experiencia"],["demos","Ver Proyectos"]]){
  const node=nodes.locator('[data-go="'+id+'"]');
  await expect(node).toHaveAttribute("aria-label",route);
  await expect(node).toHaveCSS("animation-name","v1-orbit-travel");
 }
 const first=await nodes.first().evaluate(el=>getComputedStyle(el).transform);
 await page.waitForTimeout(400);
 const second=await nodes.first().evaluate(el=>getComputedStyle(el).transform);
 expect(second).not.toBe(first);
 await orbit.hover();
 await expect(nodes.first()).toHaveCSS("animation-play-state","paused");
 await nodes.locator('[data-go="experiencia"]').click();
 await expect(page).toHaveURL(/#experiencia$/);
 await expect(page.locator("#experiencia")).toBeInViewport();
 await page.locator('[data-set-lang="en"]').click();
 await expect(nodes.locator('[data-go="sistemas"]')).toHaveAttribute("aria-label","Open Systems");
});

test("V1 · motion reduction preserves orbit as three static, keyboard-accessible controls",async({page})=>{
 await page.emulateMedia({reducedMotion:"reduce"});
 await page.goto("/?lang=en&theme=dark",{waitUntil:"domcontentloaded"});
 const orbit=page.locator("[data-orbit]");
 const nodes=orbit.locator(".v1-orbit-node");
 await expect(nodes).toHaveCount(3);
 for(const node of await nodes.all()){
  await expect(node).toHaveCSS("animation-name","none");
 }
 await nodes.first().focus();
 await expect(nodes.first()).toBeFocused();
 await page.keyboard.press("Enter");
 await expect(page).toHaveURL(/#sistemas$/);
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
