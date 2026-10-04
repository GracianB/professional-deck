#!/usr/bin/env node
/**
 * PROFESSIONAL-DECK · context-aware CSS cascade mapper
 * Usage: node tools/css-cascade-map.mjs
 * No dependencies. Reads the six CSS files in index.html load order.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const files = [
  "styles.css",
  "extra-pass.css",
  "final-v3.css",
  "final-v4.css",
  "portada-extreme.css",
  "deck-fix.css"
];

function stripComments(value) {
  return value.replace(/\/\*[\s\S]*?\*\//g, " ");
}

function parseCSS(source, file) {
  const rules = [];

  function walk(text, context) {
    let i = 0;
    let chunkStart = 0;
    let quote = null;
    let comment = false;

    while (i < text.length) {
      const c = text[i];

      if (comment) {
        if (c === "*" && text[i + 1] === "/") {
          comment = false;
          i += 2;
        } else {
          i++;
        }
        continue;
      }

      if (c === "/" && text[i + 1] === "*") {
        comment = true;
        i += 2;
        continue;
      }

      if (quote) {
        if (c === "\\") i += 2;
        else {
          if (c === quote) quote = null;
          i++;
        }
        continue;
      }

      if (c === '"' || c === "'") {
        quote = c;
        i++;
        continue;
      }

      if (c !== "{") {
        i++;
        continue;
      }

      const rawHead = text.slice(chunkStart, i);
      const head = stripComments(rawHead).replace(/\s+/g, " ").trim();

      let j = i + 1;
      let depth = 1;
      let innerQuote = null;
      let innerComment = false;

      while (j < text.length && depth > 0) {
        const x = text[j];

        if (innerComment) {
          if (x === "*" && text[j + 1] === "/") {
            innerComment = false;
            j += 2;
          } else {
            j++;
          }
          continue;
        }

        if (x === "/" && text[j + 1] === "*") {
          innerComment = true;
          j += 2;
          continue;
        }

        if (innerQuote) {
          if (x === "\\") j += 2;
          else {
            if (x === innerQuote) innerQuote = null;
            j++;
          }
          continue;
        }

        if (x === '"' || x === "'") {
          innerQuote = x;
          j++;
          continue;
        }

        if (x === "{") depth++;
        else if (x === "}") depth--;
        j++;
      }

      const body = text.slice(i + 1, j - 1);

      if (head.startsWith("@")) {
        walk(body, context.concat(head));
      } else if (head) {
        for (const selector of head.split(",").map(s => s.trim()).filter(Boolean)) {
          rules.push({
            file,
            context: context.join(" | ") || "GLOBAL",
            selector,
            body: stripComments(body).trim()
          });
        }
      }

      i = j;
      chunkStart = j;
    }
  }

  walk(source, []);
  return rules;
}

function declarations(body) {
  return body
    .split(";")
    .map(part => part.trim())
    .map(part => {
      const match = part.match(/^([-\w]+)\s*:\s*([\s\S]*)$/);
      return match ? [match[1].toLowerCase(), match[2].trim()] : null;
    })
    .filter(Boolean);
}

const rules = files.flatMap(file =>
  parseCSS(fs.readFileSync(path.join(root, file), "utf8"), file)
);

const groups = new Map();

for (const rule of rules) {
  for (const [property, value] of declarations(rule.body)) {
    const key = [
      rule.context,
      rule.selector.replace(/\s+/g, " ").trim(),
      property
    ].join("@@");

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({
      file: rule.file,
      value: value.replace(/\s+/g, " ").trim()
    });
  }
}

const conflicts = [];
const duplicates = [];

for (const [key, defs] of groups) {
  const values = new Set(defs.map(def => def.value));
  if (values.size > 1) conflicts.push({ key, defs });
  else if (defs.length > 1) duplicates.push({ key, defs });
}

const result = {
  loadOrder: files,
  totalRules: rules.length,
  conflictingSelectorPropertyGroups: conflicts.length,
  duplicateSelectorPropertyGroups: duplicates.length,
  files: Object.fromEntries(
    files.map(file => {
      const source = fs.readFileSync(path.join(root, file), "utf8");
      return [
        file,
        {
          bytes: Buffer.byteLength(source),
          important: (source.match(/!important/g) || []).length,
          parsedRules: rules.filter(rule => rule.file === file).length
        }
      ];
    })
  )
};

console.log(JSON.stringify(result, null, 2));
