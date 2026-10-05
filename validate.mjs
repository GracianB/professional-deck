import { access, readFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = dirname(fileURLToPath(import.meta.url));
const required = [
  "index.html", "styles.css", "main.js", "i18n.js", "case.js", "favicon.svg", "og-cover.png",
  "Gracian_Baena_CV_2026_ES.pdf", "Gracian_Baena_CV_2026_EN.pdf", "Gracian_Baena_Carta_Presentacion_ES.pdf", "Gracian_Baena_Cover_Letter_EN.pdf",
  "CV_Gracian_Baena_2026_ES.pdf", "CV_Gracian_Baena_2026_EN.pdf",
  "proyecto-bodytone.html", "proyecto-calculadora.html",
  "proyecto-linkedin.html", "proyecto-outreach.html", "404.html", "robots.txt", "sitemap.xml"
];
const errors = [];

async function fileExists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

for (const file of required) {
  try {
    await access(join(root, file));
    if ((await stat(join(root, file))).size === 0) errors.push(`${file} is empty`);
  } catch {
    errors.push(`Missing ${file}`);
  }
}

const index = await readFile(join(root, "index.html"), "utf8");
const css = await readFile(join(root, "styles.css"), "utf8");
const main = await readFile(join(root, "main.js"), "utf8");
const i18n = await readFile(join(root, "i18n.js"), "utf8");
const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
const slideCount = (index.match(/<section class="slide\b/g) || []).length;
if (slideCount < 8 || slideCount > 15) errors.push(`Expected 8-15 slides, found ${slideCount}`);
const languageControls = (index.match(/data-set-lang=/g) || []).length;
if (!index.includes("data-language-gate") || languageControls < 2) errors.push("Language control missing");
if (!i18n.includes("GB_I18N") || !i18n.includes("en:") || !i18n.includes("es:")) errors.push("i18n dictionary incomplete");
if (!/scroll-snap-type:\s*y mandatory/.test(css)) errors.push("Missing scroll snap");
if (!/addEventListener\("wheel"/.test(main)) errors.push("Missing wheel navigation");

const requiredScripts = [
  "validate",
  "verify",
  "test:browser",
  "audit:production",
  "audit:performance",
  "audit:css",
  "quality"
];
for (const script of requiredScripts) {
  if (!packageJson.scripts?.[script]) errors.push(`Missing npm script: ${script}`);
}
if (!await fileExists(join(root, "playwright.config.mjs"))) errors.push("Missing Playwright config");
if (!await fileExists(join(root, "tools", "production-audit.mjs"))) errors.push("Missing production audit tool");
if (!await fileExists(join(root, "tools", "performance-budget.mjs"))) errors.push("Missing performance budget tool");
if (!await fileExists(join(root, "tools", "css-cascade-guard.mjs"))) errors.push("Missing CSS cascade guard");
for (const phrase of ["Customer Success", "Account Management", "Proyectos / Operaciones", "Data / IA", "Consultoría"]) {
  if (!index.includes(phrase) && !i18n.includes(phrase)) errors.push(`Missing recruiter fit: ${phrase}`);
}
for (const phrase of ["BODYTONE", "MINDEREST", "MOOD FITNESS", "EL CORTE INGL"]) {
  if (!index.toUpperCase().includes(phrase.toUpperCase()) && !i18n.toUpperCase().includes(phrase.toUpperCase())) {
    errors.push(`Missing career milestone: ${phrase}`);
  }
}
for (const script of ["main.js", "i18n.js", "case.js", "validate.mjs"]) {
  const check = spawnSync(process.execPath, ["--check", join(root, script)], { encoding: "utf8" });
  if (check.status !== 0) errors.push(`${script}: ${check.stderr.trim()}`);
}

if (errors.length) {
  console.error(`\nValidation failed (${errors.length})\n- ${errors.join("\n- ")}\n`);
  process.exit(1);
}
console.log(`OK ${required.length} files · ${slideCount} slides · ES/EN controls · ready for GitHub Pages`);