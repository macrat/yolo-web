/**
 * Prebuild script: Generate static search index JSON.
 *
 * This script writes public/search-index.json so clients can fetch
 * the index as a static asset instead of an API route.
 */

import fs from "node:fs";
import path from "node:path";

import { buildSearchIndex } from "../src/lib/search/build-index.js";

const PUBLIC_DIR = path.resolve(process.cwd(), "public");
const OUTPUT_FILE = path.join(PUBLIC_DIR, "search-index.json");

function main(): void {
  const startTime = Date.now();

  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  const index = buildSearchIndex();
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index), "utf-8");

  const elapsed = Date.now() - startTime;
  const sizeKB = (fs.statSync(OUTPUT_FILE).size / 1024).toFixed(1);
  console.log(
    `[build-search-index] Wrote ${OUTPUT_FILE} (${sizeKB} KB) in ${elapsed}ms`,
  );
}

main();
