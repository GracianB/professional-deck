import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const PASS = [];
const FAIL = [];

const LIMITS = {
  htmlBytes: 180 * 1024,
  cssTotalBytes: 500 * 1024,
  cssLargestBytes: 180 * 1024,
  jsTotalBytes: 160 * 1024,
  imageTotalBytes: 12 * 1024 * 1024,
  imageLargestBytes: 2 * 1024 * 1024,
};

function ok(condition, message) {
  (condition ? PASS : FAIL).push(`${condition ? "PASS" : "FAIL"} ${message}`);
}

function statIfFile(rel) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) return null;
  const stat = fs.statSync(file);
  return stat.isFile() ? stat.size : null;
}

function kb(bytes) {
  return (bytes / 1024).toFixed(1) + " KB";
}

function collectHtmlReferences(html) {
  const refs = new Set();
  for (const match of html.matchAll(/(?:src|href)=["']\.\/([^"'?#]+)(?:[?#][^"']*)?["']/gi)) refs.add(match[1]);
  return [...refs];
}

function collectCssUrlReferences(cssText) {
  const refs = new Set();
  for (const match of cssText.matchAll(/url\(\s*["']?\.\/([^"')?#]+)["']?\s*\)/gi)) refs.add(match[1]);
  return [...refs];
}

const htmlPath = path.join(root, "index.html");
ok(fs.existsSync(htmlPath), "index.html exists");
if (!fs.existsSync(htmlPath)) {
  console.log(`Performance Budget · ${PASS.length} checks passed · ${FAIL.length} failed`);
  for (const line of [...PASS, ...FAIL]) console.log(line);
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, "utf8");
const htmlBytes = Buffer.byteLength(html);
ok(htmlBytes <= LIMITS.htmlBytes, `HTML budget <= ${kb(LIMITS.htmlBytes)} (actual ${kb(htmlBytes)})`);

const refs = collectHtmlReferences(html);
const cssRefs = refs.filter((ref) => /\.css$/i.test(ref));
const jsRefs = refs.filter((ref) => /\.m?js$/i.test(ref));
const imageRefs = refs.filter((ref) => /\.(?:png|jpe?g|webp|gif|avif)$/i.test(ref));

let cssTotal = 0;
let jsTotal = 0;
let imageTotal = 0;
let largestCss = { ref: "", bytes: 0 };
let largestImage = { ref: "", bytes: 0 };

for (const ref of cssRefs) {
  const bytes = statIfFile(ref);
  ok(bytes !== null, `CSS asset exists: ${ref}`);
  if (bytes === null) continue;
  cssTotal += bytes;
  if (bytes > largestCss.bytes) largestCss = { ref, bytes };
}

for (const ref of jsRefs) {
  const bytes = statIfFile(ref);
  ok(bytes !== null, `JS asset exists: ${ref}`);
  if (bytes === null) continue;
  jsTotal += bytes;
}

for (const ref of imageRefs) {
  const bytes = statIfFile(ref);
  ok(bytes !== null, `image asset exists: ${ref}`);
  if (bytes === null) continue;
  imageTotal += bytes;
  if (bytes > largestImage.bytes) largestImage = { ref, bytes };
}

ok(cssTotal <= LIMITS.cssTotalBytes, `CSS budget <= ${kb(LIMITS.cssTotalBytes)} (actual ${kb(cssTotal)})`);
ok(largestCss.bytes <= LIMITS.cssLargestBytes, `largest CSS <= ${kb(LIMITS.cssLargestBytes)} (${largestCss.ref} = ${kb(largestCss.bytes)})`);
ok(jsTotal <= LIMITS.jsTotalBytes, `JS budget <= ${kb(LIMITS.jsTotalBytes)} (actual ${kb(jsTotal)})`);
ok(imageTotal <= LIMITS.imageTotalBytes, `image budget <= ${(LIMITS.imageTotalBytes / 1024 / 1024).toFixed(1)} MB (actual ${(imageTotal / 1024 / 1024).toFixed(2)} MB)`);
if (largestImage.ref) {
  ok(largestImage.bytes <= LIMITS.imageLargestBytes, `largest raster image <= ${(LIMITS.imageLargestBytes / 1024 / 1024).toFixed(1)} MB (${largestImage.ref} = ${kb(largestImage.bytes)})`);
}

const stylesheetRefs = cssRefs.map((ref) => ref.toLowerCase());
ok(stylesheetRefs.length > 0, "at least one local stylesheet is loaded");

const allCssUrlRefs = new Set();
for (const ref of cssRefs) {
  const file = path.join(root, ref);
  if (!fs.existsSync(file)) continue;
  const css = fs.readFileSync(file, "utf8");
  for (const asset of collectCssUrlReferences(css)) allCssUrlRefs.add(asset);
}
for (const asset of allCssUrlRefs) {
  ok(statIfFile(asset) !== null, `CSS local asset exists: ${asset}`);
}

const lazyImages = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
const belowFoldImageCount = lazyImages.filter((tag) => !/class=["'][^"']*(?:hero|cover|logo)[^"']*/i.test(tag)).length;
const lazyBelowFoldCount = lazyImages.filter((tag) =>
  !/class=["'][^"']*(?:hero|cover|logo)[^"']*/i.test(tag) && /\bloading=["']lazy["']/i.test(tag)
).length;

if (belowFoldImageCount > 0) {
  ok(lazyBelowFoldCount >= Math.ceil(belowFoldImageCount * 0.5), `below-fold image lazy-loading coverage >= 50% (${lazyBelowFoldCount}/${belowFoldImageCount})`);
}

console.log(`Performance Budget · ${PASS.length} checks passed · ${FAIL.length} failed`);
console.log(`  HTML ${kb(htmlBytes)} · CSS ${kb(cssTotal)} · JS ${kb(jsTotal)} · raster ${(imageTotal / 1024 / 1024).toFixed(2)} MB`);
if (largestCss.ref) console.log(`  Largest CSS: ${largestCss.ref} · ${kb(largestCss.bytes)}`);
if (largestImage.ref) console.log(`  Largest raster: ${largestImage.ref} · ${kb(largestImage.bytes)}`);
for (const line of PASS) console.log(line);
for (const line of FAIL) console.error(line);

if (FAIL.length) process.exit(1);
