import { execFileSync } from "node:child_process";

const LIMITS = {
  totalRules: 2725,
  important: 3075,
  duplicateSelectorPropertyGroups: 350,
  conflictingSelectorPropertyGroups: 1000,
};

function fail(message) {
  console.error("FAIL " + message);
  process.exitCode = 1;
}

let raw;
try {
  raw = execFileSync(process.execPath, ["tools/css-cascade-map.mjs"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
} catch (error) {
  fail("CSS cascade mapper could not run");
  console.error(error.stderr || error.message);
  process.exit(1);
}

let report;
try {
  report = JSON.parse(raw);
} catch (error) {
  fail("CSS cascade mapper returned invalid JSON");
  console.error(raw);
  process.exit(1);
}

const important = Object.values(report.files || {}).reduce(
  (sum, file) => sum + Number(file.important || 0),
  0
);

const checks = [
  ["total CSS rules", Number(report.totalRules || 0), LIMITS.totalRules],
  ["!important occurrences", important, LIMITS.important],
  ["duplicate selector/property groups", Number(report.duplicateSelectorPropertyGroups || 0), LIMITS.duplicateSelectorPropertyGroups],
  ["conflicting selector/property groups", Number(report.conflictingSelectorPropertyGroups || 0), LIMITS.conflictingSelectorPropertyGroups],
];

for (const [label, actual, limit] of checks) {
  if (actual <= limit) {
    console.log(`PASS ${label}: ${actual} <= ${limit}`);
  } else {
    fail(`${label}: ${actual} > ${limit}`);
  }
}

if (process.exitCode) {
  console.error("\nCSS Cascade Guard · FAILED");
  process.exit(1);
}

console.log("\nCSS Cascade Guard · PASS");
