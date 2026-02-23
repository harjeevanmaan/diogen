/**
 * Targeted test: verifies the fetch call to Anthropic API
 * includes the required headers. No real API call is made.
 *
 * Extracts the fetch call pattern from DioGen_v3.jsx and
 * asserts the headers are correctly formed.
 */

import { readFileSync } from "fs";

const src = readFileSync("DioGen_v3.jsx", "utf8");

// ── Test 1: No duplicate imports ──
const importLines = [...src.matchAll(/^import \{[^}]+\} from "react";$/gm)];
console.log(`\n[Test 1] Duplicate import check`);
if (importLines.length === 1) {
  console.log("  ✅ PASS — single React import found");
} else {
  console.log(`  ❌ FAIL — found ${importLines.length} React imports (expected 1)`);
  importLines.forEach((m, i) => console.log(`    ${i + 1}: line ~${src.slice(0, m.index).split("\n").length}`));
}

// ── Test 2: Required API headers present in fetch call ──
console.log(`\n[Test 2] API headers in fetch call`);
const fetchBlock = src.match(/fetch\("https:\/\/api\.anthropic\.com\/v1\/messages"[\s\S]*?\)\s*;/);
if (!fetchBlock) {
  console.log("  ❌ FAIL — could not find fetch call to api.anthropic.com");
  process.exit(1);
}

const fb = fetchBlock[0];
const requiredHeaders = [
  "x-api-key",
  "anthropic-version",
  "anthropic-dangerous-direct-browser-access",
  "Content-Type",
];

let allPass = true;
for (const h of requiredHeaders) {
  if (fb.includes(`"${h}"`)) {
    console.log(`  ✅ "${h}" — present`);
  } else {
    console.log(`  ❌ "${h}" — MISSING`);
    allPass = false;
  }
}

// ── Test 3: anthropic-version value ──
console.log(`\n[Test 3] anthropic-version value`);
const verMatch = fb.match(/"anthropic-version":\s*"([^"]+)"/);
if (verMatch && /^\d{4}-\d{2}-\d{2}$/.test(verMatch[1])) {
  console.log(`  ✅ PASS — version "${verMatch[1]}" is valid date format`);
} else {
  console.log(`  ❌ FAIL — missing or malformed version`);
  allPass = false;
}

// ── Test 4: API key references a variable (not hardcoded empty string) ──
console.log(`\n[Test 4] API key is variable-based (not hardcoded)`);
const keyMatch = fb.match(/"x-api-key":\s*([^,\n]+)/);
if (keyMatch) {
  const val = keyMatch[1].trim();
  if (val.startsWith('"sk-')) {
    console.log(`  ❌ FAIL — API key is hardcoded (security risk)`);
    allPass = false;
  } else if (val === '""' || val === "''") {
    console.log(`  ❌ FAIL — API key is empty string`);
    allPass = false;
  } else {
    console.log(`  ✅ PASS — key references: ${val}`);
  }
}

// ── Test 5: ANTHROPIC_API_KEY reads from env ──
console.log(`\n[Test 5] API key config reads from environment`);
const envRead = src.includes("import.meta.env") && src.includes("VITE_ANTHROPIC_API_KEY");
if (envRead) {
  console.log(`  ✅ PASS — reads VITE_ANTHROPIC_API_KEY from import.meta.env`);
} else {
  console.log(`  ❌ FAIL — no env-based API key config found`);
  allPass = false;
}

// ── Test 6: Build succeeds (already verified, but check export) ──
console.log(`\n[Test 6] Default export exists`);
if (src.includes("export default function DioGen")) {
  console.log(`  ✅ PASS — DioGen component exported`);
} else {
  console.log(`  ❌ FAIL — missing default export`);
  allPass = false;
}

// ── Summary ──
console.log(`\n${"═".repeat(40)}`);
if (allPass) {
  console.log("All tests passed ✅");
} else {
  console.log("Some tests FAILED ❌");
  process.exit(1);
}
console.log();
