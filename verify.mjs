import fs from "node:fs";
import { execFileSync } from "node:child_process";

const html = fs.readFileSync("index.html", "utf8");
const manifestPath = "manifest.webmanifest";

const checks = [
  ["index.html exists", fs.existsSync("index.html")],
  ["manifest exists", fs.existsSync(manifestPath)],
  ["noscript exists", /<noscript\b/i.test(html)],
  ["JSON-LD exists", /<script[^>]+type=["']application\/ld\+json["']/i.test(html)],
  ["language gate exists", /lang-gate/i.test(html)],
  ["data-set-lang exists", /data-set-lang/i.test(html)],
  ["manifest linked", /<link[^>]+rel=["']manifest["']/i.test(html)]
];

let failed = false;
for (const [name, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) failed = true;
}

if (fs.existsSync(manifestPath)) {
  try {
    JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    console.log("PASS  manifest JSON valid");
  } catch {
    console.log("FAIL  manifest JSON valid");
    failed = true;
  }
}

try {
  execFileSync(process.execPath, ["validate.mjs"], { stdio: "inherit" });
} catch {
  failed = true;
}

if (failed) process.exit(1);
console.log("PASS  professional-deck verification");
