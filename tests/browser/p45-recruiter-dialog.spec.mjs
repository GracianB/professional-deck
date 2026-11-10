import {test,expect} from "@playwright/test";

for(const [label,width,height,language,theme] of [
  ["desktop-es",1440,900,"es","dark"],
  ["desktop-en-light",1280,800,"en","light"],
  ["mobile-es",390,844,"es","dark"],
  ["mobile-en",320,700,"en","light"]
]){
  test("P45 recruiter briefing stays readable · "+label,async({page})=>{
    await page.setViewportSize({width,height});
    const errors=[];
    page.on("pageerror",error=>errors.push(error.message));
    await page.goto("/?view=full&lang="+language+"&theme="+theme+"#inicio",{waitUntil:"domcontentloaded"});
    await page.locator("#inicio [data-open-recruiter]").click();
    const dialog=page.locator("#recruiter-dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("[data-brief-chapter]")).toHaveCount(4);
    await expect(dialog.locator("[data-brief-title]")).toBeVisible();
    const geometry=await dialog.evaluate(el=>{
      const bounds=el.getBoundingClientRect();
      const title=el.querySelector("h2").getBoundingClientRect();
      const stage=el.querySelector(".pd17-brief-scene").getBoundingClientRect();
      const css=getComputedStyle(el);
      return {
        left:bounds.left,right:bounds.right,top:bounds.top,bottom:bounds.bottom,
        viewportWidth:innerWidth,viewportHeight:innerHeight,
        maxHeight:parseFloat(css.maxHeight),scrollHeight:el.scrollHeight,clientHeight:el.clientHeight,
        titleWidth:title.width,sceneWidth:stage.width,overflow:css.overflowY
      };
    });
    expect(geometry.left).toBeGreaterThanOrEqual(-2);
    expect(geometry.right).toBeLessThanOrEqual(width+2);
    expect(geometry.top).toBeGreaterThanOrEqual(-2);
    expect(geometry.bottom).toBeLessThanOrEqual(height+2);
    expect(geometry.titleWidth).toBeGreaterThan(185);
    expect(geometry.sceneWidth).toBeGreaterThan(250);
    expect(["auto","scroll"]).toContain(geometry.overflow);
    for(let chapter=0;chapter<4;chapter++){
      await dialog.locator('[data-brief-chapter="'+chapter+'"]').click();
      await expect(dialog.locator('[data-brief-chapter="'+chapter+'"]')).toHaveAttribute("aria-pressed","true");
      await expect(dialog.locator("[data-brief-title]")).not.toBeEmpty();
    }
    await dialog.locator(".dialog-close").click();
    await expect(dialog).toBeHidden();
    expect(errors).toEqual([]);
  });
}
