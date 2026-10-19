#!/usr/bin/env node
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const html=readFileSync("index.html","utf8");
const expected="https://gracianb.github.io/GracianB/apply.html?lang=es&amp;track=professional";
assert.ok(html.includes('href="'+expected+'"'),"Professional Deck has no B6 application CTA");
for(const doc of ["cv-es","cv-en","letter-es","letter-en"]){
  assert.ok(html.includes('data-doc="'+doc+'"'),"Missing explicit bilingual document action "+doc);
}
for(const doc of ["Gracian_Baena_CV_2026_ES.pdf","Gracian_Baena_CV_2026_EN.pdf","Gracian_Baena_Carta_Presentacion_ES.pdf","Gracian_Baena_Cover_Letter_EN.pdf"]){
  assert.ok(html.includes("https://gracianb.github.io/GracianB/"+doc),"P41 canonical GracianB document missing: "+doc);
}
assert.ok(html.includes("data-cv-link"),"Existing direct CV action must be preserved");
assert.ok(html.includes("data-open-recruiter"),"Existing 60-second recruiter experience must remain present");
assert.ok(!html.includes("github.com/GracianB/aigoritmo"),"Private Aigoritmo source must not be exposed");
console.log("B6 PROFESSIONAL DECK HANDOFF PASS · existing CV and recruiter experience preserved.");
