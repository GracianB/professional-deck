import {test,expect} from "@playwright/test";
import {mkdirSync} from "node:fs";

const selectors=[
  "#sistemas.pd19-case .pd19-os-flow",
  "#sistemas.pd19-case .gb-star-metrics>div:first-child",
  "#sistemas.pd19-case .gb-star-metrics>div:nth-child(2)",
  "#sistemas.pd19-case .gb-star-badge",
  "#sistemas.pd19-case .gb-star-main .tag-row>span",
  "#modelo.pd20-model .pd20-model-track>li:last-child",
  "#formacion .education-list",
  "#contacto .pd19-contact-link"
];
test("V1 petroleum · visible flow, metrics, badges and other chapters belong to one theme",async({page})=>{
  mkdirSync("artifacts/v1-petroleum",{recursive:true});
  for(const theme of ["dark","light"]){
    await page.setViewportSize({width:1440,height:900});
    await page.goto("/?view=full&theme="+theme+"&lang=es#sistemas",{waitUntil:"domcontentloaded"});
    const data=await page.evaluate((selectors)=>({
      theme:getComputedStyle(document.documentElement).getPropertyValue("--v1-panel-hover").trim(),
      base:getComputedStyle(document.documentElement).getPropertyValue("--v1-bg").trim(),
      results:selectors.map(selector=>{
        const el=document.querySelector(selector);
        if(!el) return {selector,missing:true};
        const style=getComputedStyle(el);
        const values=(style.backgroundColor.match(/[0-9.]+/g)||[]).slice(0,3).map(Number);
        return {selector,rgb:values,color:style.backgroundColor,image:style.backgroundImage};
      }),
      header:getComputedStyle(document.querySelector(".site-header")).backgroundColor,
      action:getComputedStyle(document.querySelector("#sistemas .project-actions .primary")).backgroundColor
    }),selectors);
    for(const item of data.results){
      expect(item.missing,item.selector+" exists").not.toBe(true);
      expect(item.rgb.length,item.selector+" has opaque themed surface").toBe(3);
      const [r,g,b]=item.rgb;
      const iceWhite=theme==="light"&&r>=249&&g>=249&&b>=249;
      if(!iceWhite){
        expect(g-r,item.selector+" must be blue, not neutral gray or beige").toBeGreaterThanOrEqual(5);
        expect(b-g,item.selector+" must lean blue").toBeGreaterThanOrEqual(4);
      }
      if(theme==="dark")expect(Math.max(r,g,b),item.selector+" must stay ultra-dark").toBeLessThan(100);
      else expect(Math.min(r,g,b),item.selector+" must use pale blue").toBeGreaterThan(215);
    }
    // The flow, badges and metrics share one actual source token, not approximations.
    expect(data.results[0].color).toBe(data.results[1].color);
    expect(data.results[0].color).toBe(data.results[3].color);
    expect(data.results[0].color).toBe(data.results[4].color);
    const hc=(data.header.match(/[0-9.]+/g)||[]).slice(0,3).map(Number);
    expect(hc.length).toBe(3);
    if(theme==="dark"){expect(Math.max(...hc)).toBeLessThan(38);}
    else expect(Math.min(...hc)).toBeGreaterThan(225);
    await page.locator("#sistemas").scrollIntoViewIfNeeded();
    await page.screenshot({path:"artifacts/v1-petroleum/bodytone-"+theme+".png",animations:"disabled"});
  }
});
test("V1 petroleum · no ivory accents in displayed showcase gradient surfaces",async({page})=>{
  await page.goto("/?view=full&theme=dark&lang=es#sistemas",{waitUntil:"domcontentloaded"});
  const surfaces=await page.evaluate(()=>{
    const list=[
      "#sistemas.pd19-case .gb-star-main",
      "#demos .gb-demo-card:nth-child(2)",
      "#modelo.pd20-model .pd20-model-proof>a:last-child"
    ];
    return list.map(selector=>{
      const element=document.querySelector(selector);
      return {selector,background:getComputedStyle(element).backgroundImage};
    });
  });
  for(const x of surfaces){
    expect(x.background,x.selector).not.toMatch(/rgb\(2(?:2[0-9]|3[0-9]|4[0-9]),\s*2(?:0[0-9]|1[0-9]|2[0-9]),\s*1(?:6[0-9]|7[0-9]|8[0-9])\)/);
    expect(x.background,x.selector).not.toContain("rgb(250, 246, 236)");
    expect(x.background,x.selector).toMatch(/rgb\(/);
  }
});
