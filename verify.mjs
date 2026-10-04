import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const manifestPath = path.join(root, "manifest.webmanifest");
const errors = [];

function fail(message) {
  errors.push(message);
  console.error(`FAIL  ${message}`);
}

function pass(message) {
  console.log(`PASS  ${message}`);
}

const checks = [
  ["index.html exists", fs.existsSync(path.join(root, "index.html"))],
  ["manifest exists", fs.existsSync(manifestPath)],
  ["noscript exists", /<noscript\b/i.test(html)],
  ["JSON-LD exists", /<script[^>]+type=["']application\/ld\+json["']/i.test(html)],
  ["language control exists", /data-language-gate=/i.test(html) && (html.match(/data-set-lang=/gi) || []).length >= 2],
  ["data-set-lang exists", /data-set-lang/i.test(html)],
  ["manifest linked", /<link[^>]+rel=["']manifest["']/i.test(html)],
  ["canonical exists", /<link[^>]+rel=["']canonical["']/i.test(html)],
  ["Open Graph image exists", /property=["']og:image["']/i.test(html)]
];

for (const [name, ok] of checks) {
  if (ok) pass(name);
  else fail(name);
}

if (fs.existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    for (const key of ["name", "short_name", "start_url", "display", "icons"]) {
      if (!(key in manifest)) fail(`manifest field: ${key}`);
    }
    if (!Array.isArray(manifest.icons) || manifest.icons.length === 0) {
      fail("manifest icons non-empty");
    } else {
      pass("manifest JSON + required fields");
    }
  } catch (error) {
    fail(`manifest JSON valid: ${error.message}`);
  }
}

const idMatches = [...html.matchAll(/\bid=["']([^"']+)["']/gi)].map(match => match[1]);
const idCounts = new Map();
for (const id of idMatches) idCounts.set(id, (idCounts.get(id) || 0) + 1);
const duplicateIds = [...idCounts.entries()].filter(([, count]) => count > 1);
if (duplicateIds.length) fail(`duplicate HTML ids: ${duplicateIds.map(([id, n]) => `${id} ×${n}`).join(", ")}`);
else pass("HTML ids unique");

const localRefs = [...html.matchAll(/(?:href|src)=["']\.\/([^"'?#]+)(?:[?#][^"']*)?["']/gi)]
  .map(match => match[1])
  .filter(ref => !ref.startsWith("#"));

const missingRefs = [];
for (const ref of new Set(localRefs)) {
  if (!fs.existsSync(path.join(root, ref))) missingRefs.push(ref);
}
if (missingRefs.length) fail(`broken local references: ${missingRefs.join(", ")}`);
else pass(`local asset references resolve (${new Set(localRefs).size})`);

const stylesheetRefs = [...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']\.\/([^"'?#]+)(?:[?#][^"']*)?["'][^>]*>/gi)]
  .map(match => match[1]);

const cssFiles = [...new Set(stylesheetRefs)];
const expectedCssOrder = [
  "styles.css",
  "extra-pass.css",
  "final-v3.css",
  "final-v4.css",
  "portada-extreme.css",
  "deck-fix.css"
];

if (cssFiles.join("\n") === expectedCssOrder.join("\n")) {
  pass("CSS load order canonical");
} else {
  fail(`CSS load order drift: ${cssFiles.join(" → ")}`);
}

const cssContents = [];
for (const cssFile of cssFiles) {
  const full = path.join(root, cssFile);
  if (!fs.existsSync(full)) {
    fail(`stylesheet missing: ${cssFile}`);
    continue;
  }
  cssContents.push([cssFile, fs.readFileSync(full, "utf8")]);
}

const finalCss = cssContents.find(([name]) => name === "deck-fix.css")?.[1] || "";
for (const selector of [
  ".site-header",
  ".deck",
  ".slide",
  ".deck-controls",
  ".seg",
  ".seg-btn",
  ".header-cta"
]) {
  if (finalCss.includes(selector)) pass(`final CSS contract: ${selector}`);
  else fail(`final CSS contract missing: ${selector}`);
}

for (const legacyToken of ["lang-switch", "lang-btn", "lang-gate-card"]) {
  const found = cssContents
    .filter(([, content]) => content.includes(legacyToken))
    .map(([name]) => name);
  if (found.length) fail(`legacy CSS token ${legacyToken}: ${found.join(", ")}`);
  else pass(`legacy CSS token removed: ${legacyToken}`);
}

const scriptRefs = [...html.matchAll(/<script[^>]+src=["']\.\/([^"'?#]+)(?:[?#][^"']*)?["'][^>]*>/gi)]
  .map(match => match[1]);
for (const script of new Set(scriptRefs)) {
  const full = path.join(root, script);
  if (!fs.existsSync(full)) {
    fail(`script missing: ${script}`);
    continue;
  }
  if (/\.m?js$/i.test(script)) {
    const check = execFileSync(process.execPath, ["--check", full], { encoding: "utf8", stdio: "pipe" });
    void check;
  }
}
pass(`JavaScript syntax checked (${new Set(scriptRefs).size} browser scripts)`);

try {
  execFileSync(process.execPath, ["validate.mjs"], { stdio: "inherit" });
} catch {
  errors.push("validate.mjs failed");
}

if (errors.length) {
  console.error(`\nVerification failed (${errors.length})\n`);
  process.exit(1);
}

console.log("PASS  professional-deck MAX verification");
