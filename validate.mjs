import { access, readFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = dirname(fileURLToPath(import.meta.url));
const required = [
  "index.html", "styles.css", "v16-final.css", "v17-atlas.css", "v18-story.css", "v19-final.css", "v20-theme.css", "v20-light.css", "v23-brief.css", "v24-universe.css", "v20-cinema.js", "main.js", "i18n.js", "case.js", "case-pages.css", "case-ui.js",
  "README.md", "favicon.svg", "og-cover.png", "manifest.webmanifest",
  "Gracian_Baena_CV_2026_ES.pdf", "Gracian_Baena_CV_2026_EN.pdf",
  "Gracian_Baena_Carta_Presentacion_ES.pdf", "Gracian_Baena_Cover_Letter_EN.pdf",
  "CV_Gracian_Baena_2026_ES.pdf", "CV_Gracian_Baena_2026_EN.pdf",
  "proyecto-bodytone.html", "proyecto-calculadora.html",
  "proyecto-linkedin.html", "proyecto-outreach.html",
  "404.html", "robots.txt", "sitemap.xml"
];

const errors = [];
// An unfinished project must never acquire a public live link through a future edit.


async function fileExists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

function requireText(haystack, needle, label = needle) {
  if (!haystack.includes(needle)) errors.push(`Missing V16 contract: ${label}`);
}

function forbid(haystack, pattern, label) {
  if (pattern.test(haystack)) errors.push(`Forbidden legacy claim: ${label}`);
}

for (const file of required) {
  try {
    await access(join(root, file));
    if ((await stat(join(root, file))).size === 0) errors.push(`${file} is empty`);
  } catch {
    errors.push(`Missing ${file}`);
  }
}

for(const pageName of ["proyecto-bodytone.html","proyecto-calculadora.html","proyecto-linkedin.html","proyecto-outreach.html"]){
  const page=await readFile(join(root,pageName),"utf8");
  for(const fragment of ["case-pages.css?v=deck-v24","case-ui.js?v=deck-v21","case.js?v=deck-v21","data-case="]){
    if(!page.includes(fragment)) errors.push(pageName+" missing shared case contract "+fragment);
  }
  if(page.includes("nude-beige")) errors.push(pageName+" still uses deprecated beige stylesheet");
}
const caseStyles=await readFile(join(root,"case-pages.css"),"utf8");
for(const token of ["V22 EDITORIAL PALETTE","--case-ivory:#eee5d7","#f5f1e9",".case-section.light .case-section-heading h2"]) {
  if(!caseStyles.includes(token)) errors.push("V22 case editorial palette missing "+token);
}
const caseUI=await readFile(join(root,"case-ui.js"),"utf8");
if(!caseUI.includes("gb-portfolio-theme") || !caseUI.includes("gb-portfolio-lang")) errors.push("Case UI must share deck storage keys");
const caseData=await readFile(join(root,"case.js"),"utf8");
for(const id of ["challenge","system","response","proof"]) if(!caseData.includes('id="case-'+id+'"')) errors.push("Missing case section anchor: "+id);
const index = await readFile(join(root, "index.html"), "utf8");
const css = await readFile(join(root, "styles.css"), "utf8");
const v16 = await readFile(join(root, "v16-final.css"), "utf8");
const v17 = await readFile(join(root, "v17-atlas.css"), "utf8");
const v18 = await readFile(join(root, "v18-story.css"), "utf8");
const v19 = await readFile(join(root, "v19-final.css"), "utf8");
const v20 = await readFile(join(root, "v20-theme.css"), "utf8");
const v20Light = await readFile(join(root, "v20-light.css"), "utf8");
const v24 = await readFile(join(root,"v24-universe.css"),"utf8");
for(const token of ["#inicio.pd16-cover","#modelo.pd20-model","#sistemas.pd19-case","#demos .gb-demo-card","#metodo .pd18-method-flow","#ruta.pd18-atlas","#trayectoria .pd18-evo-rail","#experiencia","#experiencia-2","#capacidades .pd18-cap-grid","#formacion .gb-edu-panel","#contacto.pd19-contact",'html[data-theme="light"]',".pd20-cinema","#recruiter-dialog.pd17-brief"]) {
 if(!v24.includes(token)) errors.push("V24 universal design missing selector "+token);
}
if(!index.includes('v24-universe.css?v=deck-v24')) errors.push("V24 stylesheet not loaded");

const v23Brief = await readFile(join(root, "v23-brief.css"), "utf8");
if (!index.includes("v23-brief.css?v=deck-v23") ||
    !v23Brief.includes("#recruiter-dialog.pd17-brief") ||
    !v23Brief.includes('html[data-theme="light"] #recruiter-dialog.pd17-brief'))
  errors.push("V23 60-second brief dark/light contract missing");
const v20Cinema = await readFile(join(root, "v20-cinema.js"), "utf8");
const main = await readFile(join(root, "main.js"), "utf8");
const i18n = await readFile(join(root, "i18n.js"), "utf8");
const readme = await readFile(join(root, "README.md"), "utf8");
const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
const publicText = [index, i18n, readme].join("\n");

const slideCount = (index.match(/<section class="slide\b/g) || []).length;
if (slideCount !== 12) errors.push(`V18 requires exactly 12 curated slides, found ${slideCount}`);

const ids = [...index.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1]);
const duplicates = [...new Set(ids.filter((id, pos) => ids.indexOf(id) !== pos))];
if (duplicates.length) errors.push(`Duplicate HTML ids: ${duplicates.join(", ")}`);

const languageControls = (index.match(/data-set-lang=/g) || []).length;
if (!index.includes("data-language-gate") || languageControls < 2) errors.push("Language control missing");
if (!i18n.includes("GB_I18N") || !i18n.includes("en:") || !i18n.includes("es:")) errors.push("i18n dictionary incomplete");
if (!/scroll-snap-type:\s*y mandatory/.test(css)) errors.push("Missing scroll snap");
if (!/addEventListener\("wheel"/.test(main)) errors.push("Missing wheel navigation");

for (const token of [
  'class="slide dark fit pd16-cover"',
  'class="pd16-universe-signature"',
  'class="pd16-os"',
  'id="modelo"',
  'id="sistemas"',
  'id="demos"',
  'id="ruta"',
  'class="pd17-atlas-layout"',
  'data-atlas-stops',
  'data-atlas-routes',
  'data-atlas-tour',
  'data-atlas-mode',
  'class="pd19-contact-wrap"',
  'class="pd19-os-flow"',
  'data-brief-progress',
  'data-brief-chapters',
  'data-brief-play',
  'id="trayectoria"',
  'class="pd18-evo-rail"',
  'class="pd18-method-flow"',
  'class="pd18-cap-grid"',
  'id="experiencia"',
  'id="experiencia-2"',
  'id="capacidades"',
  'id="formacion"',
  'id="contacto"',
]) {
  requireText(index, token);
}

for (const link of [
  "https://bodytonehelp.zendesk.com/hc/es",
  "https://gracianb.github.io/project-ohana/",
  "https://github.com/GracianB/project-ohana",
  "https://vortex-gilt-xi.vercel.app/",
  "https://github.com/GracianB/vortex",
  "https://gracianb.github.io/systems-lab/",
]) {
  requireText(index, link, `public evidence link ${link}`);
}

for (const milestone of ["BODYTONE", "MINDEREST", "MAJOREL", "SOLARIS", "EL CORTE INGL", "PRIMARK"]) {
  if (!publicText.toUpperCase().includes(milestone)) errors.push(`Missing career milestone: ${milestone}`);
}

for (const roleFit of ["Customer Success", "Account Management", "Projects / Operations", "Data / AI"]) {
  if (!index.includes(roleFit) && !i18n.includes(roleFit)) errors.push(`Missing role fit: ${roleFit}`);
}

for (const language of ["Español", "Inglés", "Italiano", "Spanish", "English", "Italian"]) {
  if (!i18n.includes(language) && !index.includes(language)) errors.push(`Missing working language: ${language}`);
}

forbid(publicText, /Mood Fitness/i, "Mood Fitness");
forbid(publicText, /\bPortuguese\b|\bPortuguês\b|\bPortugués\b/i, "Portuguese claim");
forbid(publicText, /\bFrench\b|\bFrancés\b|\bFrançais\b/i, "French claim");
forbid(publicText, /\b4 countries\b|\b4 países\b/i, "four-country cover claim");
forbid(publicText, /\b6 languages\b|\bseis idiomas\b|\bsix languages\b/i, "six-language claim");
forbid(publicText, /open to senior roles|roles senior/i, "senior-role availability claim");
forbid(index, /deck-intro|intro-on/, "blocking intro");

if (!/\.pd16-cover\s*\{/.test(v16)) errors.push("V16 cover CSS missing");
if (!/\.pd16-model-flow\s*\{/.test(v16)) errors.push("V16 operating model CSS missing");
if (!/\.pd16-career-steps\s*\{/.test(v16)) errors.push("V16 career CSS missing");
if (!/\.pd17-atlas-map\s*\{/.test(v17)) errors.push("V17 atlas CSS missing");
if (!/function tickBrief\(/.test(main)) errors.push("V17 briefing timer missing");
if (!/function updateAtlasLines\(/.test(main)) errors.push("V19 SVG atlas engine missing");
if (!/\.pd19-contact-wrap\s*\{/.test(v19)) errors.push("V19 contact design missing");
if (!/\.pd20-model-track/.test(v20)) errors.push("V20 Model layout missing");
if (!/html\[data-theme="light"\]/.test(v20Light)) errors.push("V20 light theme missing");
if (!/function start\(/.test(v20Cinema) || !/function end\(/.test(v20Cinema)) errors.push("V20 cinematic lifecycle missing");
for (const key of ["data-cinema-skip", "data-cinema-replay", "pd20-model-journey"]) if (!index.includes(key)) errors.push(`V20 missing ${key}`);
if (!/\.pd18-model-track\s*\{/.test(v18)) errors.push("V18 model CSS missing");
if ((index.match(/data-lat=/g)||[]).length !== 6) errors.push("V18 requires six city markers");
for (const city of ["MURCIA", "GRAN CANARIA", "MADRID", "LISBOA", "BÉRGAMO", "VARSOVIA"]) requireText(index, city, `city marker ${city}`);
for (const retired of ["valor", "linea", "idiomas"]) {
 if (new RegExp(`<section[^>]+id="${retired}"`).test(index)) errors.push(`Retired filler slide still present: ${retired}`);
}

const requiredScripts = [
  "validate", "verify", "test:browser",
  "audit:production", "audit:performance", "audit:css", "audit:css:v16", "quality"
];
for (const script of requiredScripts) {
  if (!packageJson.scripts?.[script]) errors.push(`Missing npm script: ${script}`);
}

for (const rel of [
  "playwright.config.mjs",
  "tools/production-audit.mjs",
  "tools/performance-budget.mjs",
  "tools/css-cascade-guard.mjs",
  "tools/v16-css-guard.mjs"
]) {
  if (!await fileExists(join(root, rel))) errors.push(`Missing ${rel}`);
}

for (const script of ["main.js", "i18n.js", "case.js", "validate.mjs"]) {
  const check = spawnSync(process.execPath, ["--check", join(root, script)], { encoding: "utf8" });
  if (check.status !== 0) errors.push(`${script}: ${check.stderr.trim()}`);
}

forbid(index, /href="https:\/\/(?:gracianb\.github\.io\/revops-studio\/|github\.com\/GracianB\/revops-studio)"/i, "unfinished RevOps access");
if (!index.includes("pd36-roadmap-link")) errors.push("RevOps construction label missing");
if (errors.length) {
  console.error(`\nValidation failed (${errors.length})\n- ${errors.join("\n- ")}\n`);
  process.exit(1);
}

console.log(`OK · V20 EDITORIAL · ${required.length} files · ${slideCount} slides · ES/EN · evidence-first · ready for browser gates`);
