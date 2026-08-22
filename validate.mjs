import { access, readFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = dirname(fileURLToPath(import.meta.url));
const required = [
  "index.html", "styles.css", "main.js", "i18n.js", "case.js", "favicon.svg", "og-cover.png",
  "Gracian_Baena_CV_2026_ES.pdf", "Gracian_Baena_CV_2026_EN.pdf", "Gracian_Baena_Carta_Presentacion_ES.pdf", "Gracian_Baena_Cover_Letter_EN.pdf",
  "CV_Gracian_Baena_2026_ES.pdf", "CV_Gracian_Baena_2026_EN.pdf", "Carta_Gracian_Baena_ES.pdf", "Cover_Letter_Gracian_Baena_EN.pdf",
  "proyecto-bodytone.html", "proyecto-calculadora.html",
  "proyecto-linkedin.html", "proyecto-outreach.html", "404.html", "robots.txt", "sitemap.xml"
];
const errors = [];

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
const slideCount = (index.match(/<section class="slide\b/g) || []).length;
if (slideCount < 8 || slideCount > 15) errors.push(`Expected 8-15 slides, found ${slideCount}`);
if (!index.includes("lang-gate") || !index.includes("data-set-lang")) errors.push("Language gate missing");
if (!i18n.includes("GB_I18N") || !i18n.includes("en:") || !i18n.includes("es:")) errors.push("i18n dictionary incomplete");
if (!/scroll-snap-type:\s*y mandatory/.test(css)) errors.push("Missing scroll snap");
if (!/addEventListener\("wheel"/.test(main)) errors.push("Missing wheel navigation");
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
console.log(`OK ${required.length} files · ${slideCount} slides · ES/EN gate · ready for GitHub Pages`);