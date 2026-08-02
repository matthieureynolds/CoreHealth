#!/usr/bin/env node
/**
 * Dead-code guard for the travel domain.
 *
 * ESLint's no-unused-vars treats an `export` as a use, so an exported symbol
 * that nothing imports is invisible to it — which is how 18 dead service
 * functions accumulated unnoticed. knip resolves the whole import graph and
 * catches exactly that class.
 *
 * knip has to analyse the entire project to build the graph, but only the
 * travel domain is held to zero: the rest of the app still carries unused
 * files and exports, and failing on those would make the hook unusable.
 * Widen TRAVEL as other areas are cleaned.
 */
const { execFileSync } = require("child_process");

const TRAVEL = [
  "src/features/travel",
  "src/shared/services/travel",
];

const inTravel = (f) => TRAVEL.some((p) => f.startsWith(p));

let raw;
try {
  raw = execFileSync("npx", ["knip", "--no-progress", "--reporter", "json"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
    cwd: __dirname + "/..",
  });
} catch (e) {
  // knip exits non-zero whenever it finds anything, app-wide. The report on
  // stdout is still what we want, so only a genuinely empty result is fatal.
  raw = e.stdout;
  if (!raw) {
    console.error("knip produced no report");
    process.exit(1);
  }
}

const report = JSON.parse(raw);
const findings = [];

for (const file of report.files || []) {
  if (inTravel(file)) findings.push(`unused file    ${file}`);
}

for (const issue of report.issues || []) {
  const file = issue.file || "";
  if (!inTravel(file)) continue;
  for (const kind of ["exports", "types", "duplicates", "enumMembers"]) {
    for (const entry of issue[kind] || []) {
      findings.push(`unused ${kind.padEnd(8)} ${entry.name}  (${file})`);
    }
  }
}

if (findings.length) {
  console.error(`\n✗ knip: ${findings.length} dead-code finding(s) in travel\n`);
  for (const f of findings) console.error(`    ${f}`);
  console.error(
    "\n  Delete it, or drop the `export` if it is only used in its own file.\n",
  );
  process.exit(1);
}

console.log("✓ knip: travel domain clean");
