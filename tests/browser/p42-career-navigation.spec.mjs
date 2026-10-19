import {test,expect} from "@playwright/test";

test("P42 · all six roles expand and collapse without a secondary modal",async({page})=>{
  await page.goto("/?lang=es&theme=dark",{waitUntil:"domcontentloaded"});
  const item=page.locator("#experiencia details[data-career]");
  const toggle=page.locator("[data-career-toggle]");
  await expect(item).toHaveCount(6);
  await expect(toggle).toHaveAttribute("aria-controls","pd42-career-list");
  await expect(toggle).toHaveAttribute("aria-pressed","false");
  await expect(page.locator("#experiencia details[open]")).toHaveCount(1);
  await toggle.click();
  await expect(page.locator("#experiencia details[open]")).toHaveCount(6);
  await expect(toggle).toHaveAttribute("aria-pressed","true");
  await expect(toggle).toContainText("RECOGER");
  await toggle.click();
  await expect(page.locator("#experiencia details[open]")).toHaveCount(0);
  await expect(toggle).toHaveAttribute("aria-pressed","false");
  await item.nth(2).locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(item.nth(2)).toHaveAttribute("open","");
  await expect(page.locator("#experience-dialog")).not.toBeVisible();
  await page.locator("[data-set-lang='en']").click();
  await expect(toggle).toContainText("EXPAND ALL SIX");
  await expect(page.locator("#experiencia [data-career='majorel'] [data-career-copy]")).toContainText("international");
});

test("P42 · command palette reveals full chapters hidden in the initial view",async({page})=>{
  await page.goto("/?lang=es",{waitUntil:"domcontentloaded"});
  await expect(page.locator("body")).toHaveClass(/deck-focus/);
  await expect(page.locator("#ruta")).toBeHidden();
  await page.keyboard.press("Control+KeyK");
  await expect(page.locator("#command-dialog")).toBeVisible();
  await page.locator('[data-command-target="ruta"]').click();
  await expect(page.locator("#command-dialog")).not.toBeVisible();
  await expect(page.locator("body")).toHaveClass(/deck-full/);
  await expect(page.locator("#ruta")).toBeVisible();
  await expect(page).toHaveURL(/#ruta$/);
});

test("P42 · first 60-second story chapter links to the unified career instead of a deleted slide",async({page})=>{
  await page.goto("/?view=full&lang=es#inicio",{waitUntil:"domcontentloaded"});
  await page.locator("#inicio [data-open-recruiter]").click();
  await expect(page.locator("#recruiter-dialog")).toBeVisible();
  await expect(page.locator("[data-brief-explore]")).toHaveAttribute("data-brief-target","experiencia");
  await page.locator("[data-brief-explore]").click();
  await expect(page.locator("#recruiter-dialog")).not.toBeVisible();
  await expect(page).toHaveURL(/#experiencia$/);
  await expect(page.locator("#experiencia")).toBeInViewport();
});

test("P42 · PageDown within full-career view naturally scrolls, rather than skipping to education",async({page})=>{
  await page.setViewportSize({width:1440,height:760});
  await page.goto("/?view=full&lang=es#experiencia",{waitUntil:"domcontentloaded"});
  await page.locator("#deck").focus();
  const before=await page.locator("#deck").evaluate(el=>el.scrollTop);
  await page.keyboard.press("PageDown");
  await expect.poll(async()=>page.locator("#deck").evaluate(el=>el.scrollTop)).toBeGreaterThan(before+80);
  const section=await page.locator("#deck").evaluate(el=>{
    const c=document.querySelector("#experiencia").getBoundingClientRect();
    const rect=el.getBoundingClientRect();
    return c.bottom>rect.top && c.top<rect.bottom;
  });
  expect(section).toBe(true);
});

test("P42 · keyboard + expand controls stay readable on mobile, light and dark",async({page})=>{
  await page.setViewportSize({width:390,height:844});
  for(const theme of ["light","dark"]){
    await page.goto("/?lang=en&theme="+theme+"#experiencia",{waitUntil:"domcontentloaded"});
    const toggle=page.locator("[data-career-toggle]");
    await expect(toggle).toBeVisible();
    const data=await toggle.evaluate(el=>({w:el.getBoundingClientRect().width,viewport:window.innerWidth,sw:document.documentElement.scrollWidth}));
    expect(data.w).toBeGreaterThan(240);
    expect(data.sw).toBeLessThanOrEqual(data.viewport+2);
    await toggle.click();
    await expect(page.locator("#experiencia details[open]")).toHaveCount(6);
    await page.locator("#experiencia details").last().locator("summary").scrollIntoViewIfNeeded();
    await expect(page.locator("#experiencia details").last()).toBeVisible();
  }
});
