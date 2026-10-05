import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const fail = [];
const pass = [];

function read(name) {
  const file = path.join(root, name);
  if (!fs.existsSync(file)) {
    fail.push(`MISSING ${name}`);
    return "";
  }
  return fs.readFileSync(file, "utf8");
}

function ok(condition, message) {
  (condition ? pass : fail).push(`${condition ? "PASS" : "FAIL"} ${message}`);
}

const html = read("index.html");
const js = read("main.js");
const i18n = read("i18n.js");
const manifest = read("manifest.webmanifest");
const robots = read("robots.txt");
const sitemap = read("sitemap.xml");

ok(/^<!doctype html>/i.test(html.trim()), "doctype");
ok(/<meta[^>]+name=["']viewport["'][^>]+content=/i.test(html), "viewport meta");
ok(/<meta[^>]+name=["']description["'][^>]+content="[^"]{50,}/i.test(html), "description meta");
ok(/<link[^>]+rel=["']canonical["'][^>]+href=/i.test(html), "canonical");
ok(/property=["']og:title["']/i.test(html) && /property=["']og:description["']/i.test(html) && /property=["']og:image["']/i.test(html), "Open Graph");
ok(/name=["']twitter:card["'][^>]+content=["']summary_large_image["']/i.test(html), "Twitter card");
ok(/application\/ld\+json/i.test(html), "JSON-LD");
ok(/rel=["']manifest["']/i.test(html), "manifest link");
ok(/rel=["']icon["']/i.test(html), "favicon");
ok(/<main\b[^>]*id=["']deck["']/i.test(html), "main landmark");
ok(/<nav\b[^>]+aria-label=/i.test(html), "navigation landmark labels");
ok(/<dialog\b[^>]*aria-labelledby=/i.test(html), "dialog accessible naming");
ok(!/<script(?![^>]+type=["']application\/ld\+json["'])[^>]+src=["']http:/i.test(html), "no insecure script source");
ok(!/javascript:/i.test(html), "no javascript: URLs");
ok(!/<form\b(?![^>]*method=["']dialog["'])/i.test(html), "no unexpected forms");

const localTargets=[...html.matchAll(/(?:href|src)=["']\.\/([^"'?#]+)(?:[?#][^"']*)?/gi)].map(m=>m[1]);
for (const rel of [...new Set(localTargets)]) {
  ok(fs.existsSync(path.join(root, rel)), `local asset exists: ${rel}`);
}

const externalBlank=[...html.matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/gi)].map(m=>m[0]);
for (const tag of externalBlank) {
  ok(/rel=["'][^"']*\bnoopener\b/i.test(tag), `_blank link has noopener: ${tag.slice(0,100)}`);
}

const ids=[...html.matchAll(/\bid=["']([^"']+)["']/gi)].map(m=>m[1]);
const duplicateIds=ids.filter((id,i)=>ids.indexOf(id)!==i);
ok(duplicateIds.length===0, `unique HTML ids${duplicateIds.length ? `: ${[...new Set(duplicateIds)].join(", ")}` : ""}`);

ok(!/console\.(log|debug|info)\(/.test(js+i18n), "no debug console calls");
ok(!/eval\s*\(/.test(js+i18n), "no eval()");
ok(/prefers-reduced-motion/.test(html+js) || fs.readFileSync(path.join(root,"styles.css"),"utf8").includes("prefers-reduced-motion"), "reduced-motion support");

try {
  const m=JSON.parse(manifest);
  ok(m.name && m.start_url && m.display && Array.isArray(m.icons) && m.icons.length>0, "valid PWA manifest contract");
} catch (e) {
  fail.push(`FAIL manifest JSON parse: ${e.message}`);
}

ok(/^User-agent:/mi.test(robots) && /Sitemap:/i.test(robots), "robots contract");
ok(/<urlset[^>]+xmlns=/i.test(sitemap) && /<loc>https:\/\/gracianb\.github\.io\/professional-deck\//i.test(sitemap), "sitemap contract");

console.log(`Production Audit · ${pass.length} checks passed · ${fail.length} failed`);
for (const line of pass) console.log(line);
for (const line of fail) console.error(line);

if (fail.length) process.exit(1);
