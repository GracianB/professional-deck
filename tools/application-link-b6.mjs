#!/usr/bin/env node
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const html=readFileSync("index.html","utf8");
const expected="https://gracianb.github.io/GracianB/apply.html?lang=es&amp;track=professional";
assert.ok(html.includes('href="'+expected+'"'),"Professional Deck has no B6 application CTA");
assert.ok(html.includes('CV + CARTAS · ES/EN'),"Recruiter cannot distinguish the bilingual CV/letters route");
assert.ok(html.includes("data-cv-link"),"Existing direct CV action must be preserved");
assert.ok(html.includes("data-open-recruiter"),"Existing 60-second recruiter experience must remain present");
assert.ok(!html.includes("github.com/GracianB/aigoritmo"),"Private Aigoritmo source must not be exposed");
console.log("B6 PROFESSIONAL DECK HANDOFF PASS · existing CV and recruiter experience preserved.");
