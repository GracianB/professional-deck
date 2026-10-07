#!/usr/bin/env node
import fs from "node:fs";

const file = "v16-final.css";
const source = fs.readFileSync(file, "utf8");
const bytes = Buffer.byteLength(source);
const important = (source.match(/!important/g) || []).length;

function stripComments(value) {
  return value.replace(/\/\*[\s\S]*?\*\//g, " ");
}

function countRules(text) {
  let rules = 0;
  let i = 0;
  let quote = null;
  let comment = false;

  while (i < text.length) {
    const ch = text[i];
    if (comment) {
      if (ch === "*" && text[i + 1] === "/") { comment = false; i += 2; continue; }
      i += 1;
      continue;
    }
    if (ch === "/" && text[i + 1] === "*") { comment = true; i += 2; continue; }
    if (quote) {
      if (ch === "\\") { i += 2; continue; }
      if (ch === quote) quote = null;
      i += 1;
      continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; i += 1; continue; }
    if (ch !== "{") { i += 1; continue; }

    let start = i - 1;
    while (start >= 0 && text[start] !== "}" && text[start] !== "{") start -= 1;
    const head = stripComments(text.slice(start + 1, i)).trim();
    if (head && !head.startsWith("@")) {
      rules += head.split(",").map((part) => part.trim()).filter(Boolean).length;
    }
    i += 1;
  }
  return rules;
}

const rules = countRules(source);
const checks = [
  [bytes <= 40 * 1024, `V16 CSS bytes: ${bytes} <= 40960`],
  [important === 0, `V16 !important occurrences: ${important} === 0`],
  [rules <= 220, `V16 selector rules: ${rules} <= 220`],
];

let failed = false;
for (const [ok, label] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"} ${label}`);
  if (!ok) failed = true;
}

if (failed) process.exit(1);
console.log("V16 CSS Guard · PASS");
