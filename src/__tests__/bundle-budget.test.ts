/**
 * Bundle Budget Regression Tests
 *
 * Validates that the production build's JavaScript bundle sizes stay within
 * defined budgets. This prevents accidental bundle size regressions by
 * checking baseline JS, per-route-category page-specific JS, and large
 * chunk counts.
 *
 * Prerequisites:
 * - `npm run build` must be run before these tests (`.next/` must exist).
 * - If `.next/build-manifest.json` is missing, the entire suite is skipped.
 *
 * Data sources:
 * - `.next/build-manifest.json` for baseline (rootMainFiles + polyfillFiles)
 * - `.next/server/app/.../page_client-reference-manifest.js` for per-route JS
 * - `.next/static/chunks/*.js` for large chunk detection
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, test } from "vitest";

// ---------------------------------------------------------------------------
// Project root and build output paths
// ---------------------------------------------------------------------------
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const NEXT_DIR = path.join(PROJECT_ROOT, ".next");
const BUILD_MANIFEST_PATH = path.join(NEXT_DIR, "build-manifest.json");
const SERVER_APP_DIR = path.join(NEXT_DIR, "server", "app");
const STATIC_CHUNKS_DIR = path.join(NEXT_DIR, "static", "chunks");

// ---------------------------------------------------------------------------
// Budget configuration
// ---------------------------------------------------------------------------

/** Threshold in bytes above which a chunk is considered "large". */
const LARGE_CHUNK_THRESHOLD = 300 * 1024;

/**
 * Budget values for bundle size regression testing.
 * Update these when intentional size changes occur (document the reason in
 * the commit message).
 */
const BUDGETS = {
  /** Maximum total size for baseline JS (rootMainFiles + polyfillFiles). */
  baseline: 560 * 1024, // 560 KB

  /** Maximum number of chunks exceeding LARGE_CHUNK_THRESHOLD. */
  maxLargeChunks: 3,

  /**
   * Per-category budget for the largest page-specific JS within the category.
   * A "page-specific JS" is the set of JS files loaded for a page MINUS the
   * layout JS and the baseline JS.
   */
  categories: {
    "/tools": 60 * 1024, // 60 KB
    "/cheatsheets": 15 * 1024, // 15 KB
    "/games": 90 * 1024, // 90 KB
    "/dictionary": 50 * 1024, // 50 KB
    "/blog": 20 * 1024, // 20 KB
    "/quiz": 20 * 1024, // 20 KB
    "/memos": 15 * 1024, // 15 KB
    "/fortune": 30 * 1024, // 30 KB
  } as Record<string, number>,

  /**
   * Fallback budget for routes that do not belong to any known category.
   * If an uncategorised route exceeds this, the test fails.
   */
  uncategorisedMax: 50 * 1024, // 50 KB
} as const;

/**
 * Routes that are intentionally uncategorised. These are recorded but do not
 * cause a test failure for being uncategorised. They must still stay within
 * the uncategorisedMax budget.
 */
const UNCATEGORISED_WHITELIST: ReadonlySet<string> = new Set([
  "/",
  "/about",
  "/privacy",
  "/achievements",
]);

// ---------------------------------------------------------------------------
// Helper: format bytes as a human-readable string
// ---------------------------------------------------------------------------

function formatKB(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)}KB`;
}

// ---------------------------------------------------------------------------
// Helper: parse the build manifest
// ---------------------------------------------------------------------------

interface BuildManifest {
  rootMainFiles: string[];
  polyfillFiles: string[];
}

function readBuildManifest(): BuildManifest {
  return JSON.parse(fs.readFileSync(BUILD_MANIFEST_PATH, "utf8"));
}

// ---------------------------------------------------------------------------
// Helper: get baseline file set and total size
// ---------------------------------------------------------------------------

interface BaselineInfo {
  totalSize: number;
  files: { relativePath: string; size: number }[];
}

function getBaselineSize(): BaselineInfo {
  const manifest = readBuildManifest();
  const allRelPaths = [...manifest.rootMainFiles, ...manifest.polyfillFiles];

  const files = allRelPaths.map((relPath) => {
    const absPath = path.join(NEXT_DIR, relPath);
    const size = fs.statSync(absPath).size;
    return { relativePath: relPath, size };
  });

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  return { totalSize, files };
}

// ---------------------------------------------------------------------------
// Helper: parse a page_client-reference-manifest.js
// ---------------------------------------------------------------------------

interface PageManifest {
  entryJSFiles: Record<string, string[]>;
}

/**
 * Parse a page_client-reference-manifest.js file.
 *
 * These files are NOT pure JSON. They look like:
 *   globalThis.__RSC_MANIFEST = globalThis.__RSC_MANIFEST || {};
 *   globalThis.__RSC_MANIFEST["/tools/yaml-formatter/page"] = { ... }
 *
 * The route key may contain brackets (e.g. `[slug]`), so we locate the JSON
 * by finding `= {` on the second line and parsing from there.
 */
function parsePageManifest(manifestPath: string): PageManifest | null {
  const content = fs.readFileSync(manifestPath, "utf8");
  const lines = content.split("\n");
  if (lines.length < 2) return null;

  const line2 = lines[1];
  const eqIdx = line2.indexOf("= {");
  if (eqIdx < 0) return null;

  try {
    const json = line2.slice(eqIdx + 2).trim();
    return JSON.parse(json) as PageManifest;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Helper: recursively find manifest files
// ---------------------------------------------------------------------------

function findManifestFiles(dir: string, results: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findManifestFiles(fullPath, results);
    } else if (entry.name === "page_client-reference-manifest.js") {
      results.push(fullPath);
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Helper: collect all route page-specific JS sizes
// ---------------------------------------------------------------------------

interface RouteSize {
  route: string;
  size: number;
  files: { relativePath: string; size: number }[];
}

function getRoutePageSpecificSizes(): RouteSize[] {
  const manifest = readBuildManifest();
  const baselineFileSet = new Set([
    ...manifest.rootMainFiles,
    ...manifest.polyfillFiles,
  ]);

  const manifestFiles = findManifestFiles(SERVER_APP_DIR);
  const results: RouteSize[] = [];

  for (const manifestPath of manifestFiles) {
    // Derive the route from the filesystem path.
    // e.g. .next/server/app/tools/yaml-formatter/page_client-reference-manifest.js
    //   -> /tools/yaml-formatter
    const relative = path.relative(SERVER_APP_DIR, manifestPath);
    const routeDir = path.dirname(relative);
    const route = routeDir === "." ? "/" : `/${routeDir}`;

    // Skip internal Next.js routes (e.g. /_global-error, /_not-found)
    if (route.startsWith("/_")) continue;

    const parsed = parsePageManifest(manifestPath);
    if (!parsed || !parsed.entryJSFiles) {
      results.push({ route, size: 0, files: [] });
      continue;
    }

    // Identify layout JS files to exclude
    const layoutKey = Object.keys(parsed.entryJSFiles).find((k) =>
      k.endsWith("/layout"),
    );
    const layoutFiles = new Set<string>(
      layoutKey ? parsed.entryJSFiles[layoutKey] : [],
    );

    // Identify the page entry
    const pageKey = Object.keys(parsed.entryJSFiles).find((k) =>
      k.endsWith("/page"),
    );
    if (!pageKey) {
      results.push({ route, size: 0, files: [] });
      continue;
    }

    const pageFiles = parsed.entryJSFiles[pageKey] ?? [];
    const pageSpecific = pageFiles.filter(
      (f) => !baselineFileSet.has(f) && !layoutFiles.has(f),
    );

    let totalSize = 0;
    const fileDetails: { relativePath: string; size: number }[] = [];
    for (const relPath of pageSpecific) {
      try {
        const absPath = path.join(NEXT_DIR, relPath);
        const size = fs.statSync(absPath).size;
        totalSize += size;
        fileDetails.push({ relativePath: relPath, size });
      } catch {
        // File may not exist; skip silently.
      }
    }

    results.push({ route, size: totalSize, files: fileDetails });
  }

  return results;
}

// ---------------------------------------------------------------------------
// Helper: get large chunks
// ---------------------------------------------------------------------------

interface ChunkInfo {
  name: string;
  size: number;
}

function getLargeChunks(threshold: number): ChunkInfo[] {
  const entries = fs.readdirSync(STATIC_CHUNKS_DIR, { withFileTypes: true });
  const large: ChunkInfo[] = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".js")) continue;
    const absPath = path.join(STATIC_CHUNKS_DIR, entry.name);
    const size = fs.statSync(absPath).size;
    if (size > threshold) {
      large.push({ name: entry.name, size });
    }
  }

  return large.sort((a, b) => b.size - a.size);
}

// ---------------------------------------------------------------------------
// Helper: categorise a route
// ---------------------------------------------------------------------------

function categoriseRoute(route: string): string | null {
  const parts = route.split("/").filter(Boolean);
  if (parts.length === 0) return null; // root "/"
  const topLevel = `/${parts[0]}`;
  return topLevel in BUDGETS.categories ? topLevel : null;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

const buildExists = fs.existsSync(BUILD_MANIFEST_PATH);

describe.skipIf(!buildExists)("Bundle budget", () => {
  // ---- Test 1: Baseline JS budget ----
  test("baseline JS (rootMainFiles + polyfillFiles) is within budget", () => {
    const baseline = getBaselineSize();
    const budget = BUDGETS.baseline;

    const breakdown = baseline.files
      .map((f) => `  ${f.relativePath}: ${formatKB(f.size)}`)
      .join("\n");

    expect(
      baseline.totalSize,
      `Baseline JS budget exceeded: ${formatKB(baseline.totalSize)} > ${formatKB(budget)} budget\n` +
        `Breakdown:\n${breakdown}`,
    ).toBeLessThanOrEqual(budget);
  });

  // ---- Test 2: Route category page-specific JS budgets ----
  describe("route category page-specific JS budgets", () => {
    const allRoutes = buildExists ? getRoutePageSpecificSizes() : [];

    // Group routes by category
    const categoryRoutes = new Map<string, RouteSize[]>();
    for (const category of Object.keys(BUDGETS.categories)) {
      categoryRoutes.set(category, []);
    }
    for (const rs of allRoutes) {
      const cat = categoriseRoute(rs.route);
      if (cat !== null) {
        categoryRoutes.get(cat)!.push(rs);
      }
    }

    for (const [category, budget] of Object.entries(BUDGETS.categories)) {
      test(`${category} routes are within ${formatKB(budget)} budget`, () => {
        const routes = categoryRoutes.get(category) ?? [];
        expect(
          routes.length,
          `No routes found for category ${category}. ` +
            `Check that build output contains routes under ${category}.`,
        ).toBeGreaterThan(0);

        // Find the route with the maximum page-specific JS
        const sorted = [...routes].sort((a, b) => b.size - a.size);
        const worst = sorted[0];

        const listing = sorted
          .map(
            (r) =>
              `  ${r.route}: ${formatKB(r.size)}${r.size > budget ? "  <-- OVER BUDGET" : ""}`,
          )
          .join("\n");

        expect(
          worst.size,
          `Category ${category} budget exceeded: ${worst.route} has ${formatKB(worst.size)} page-specific JS (budget: ${formatKB(budget)})\n` +
            `All routes in ${category}:\n${listing}`,
        ).toBeLessThanOrEqual(budget);
      });
    }
  });

  // ---- Test 3: Large chunk count ----
  test(`number of chunks exceeding ${formatKB(LARGE_CHUNK_THRESHOLD)} is within budget`, () => {
    const largeChunks = getLargeChunks(LARGE_CHUNK_THRESHOLD);
    const maxAllowed = BUDGETS.maxLargeChunks;

    const listing = largeChunks
      .map((c) => `  ${c.name}: ${formatKB(c.size)}`)
      .join("\n");

    expect(
      largeChunks.length,
      `Too many large chunks (>${formatKB(LARGE_CHUNK_THRESHOLD)}): found ${largeChunks.length}, max ${maxAllowed}\n` +
        `Large chunks:\n${listing}`,
    ).toBeLessThanOrEqual(maxAllowed);
  });

  // ---- Test 4: Uncategorised route guard ----
  test("uncategorised routes are whitelisted or within fallback budget", () => {
    const allRoutes = getRoutePageSpecificSizes();
    const uncategorised: RouteSize[] = [];

    for (const rs of allRoutes) {
      const cat = categoriseRoute(rs.route);
      if (cat === null) {
        uncategorised.push(rs);
      }
    }

    // Separate into known (whitelisted) and unknown uncategorised routes
    const knownUncategorised: RouteSize[] = [];
    const unknownUncategorised: RouteSize[] = [];

    for (const rs of uncategorised) {
      if (UNCATEGORISED_WHITELIST.has(rs.route)) {
        knownUncategorised.push(rs);
      } else {
        unknownUncategorised.push(rs);
      }
    }

    if (knownUncategorised.length > 0) {
      console.log(
        `[bundle-budget] Whitelisted uncategorised routes:\n` +
          knownUncategorised
            .map((r) => `  ${r.route}: ${formatKB(r.size)}`)
            .join("\n"),
      );
    }

    // Unknown uncategorised routes must not exist -- any new route section
    // should be added to BUDGETS.categories or UNCATEGORISED_WHITELIST.
    const unknownListing = unknownUncategorised
      .map((r) => `  ${r.route}: ${formatKB(r.size)}`)
      .join("\n");

    expect(
      unknownUncategorised.length,
      `Found uncategorised routes not in the whitelist. ` +
        `Add them to BUDGETS.categories or UNCATEGORISED_WHITELIST:\n${unknownListing}`,
    ).toBe(0);

    // Even whitelisted routes must not exceed the fallback budget
    for (const rs of knownUncategorised) {
      expect(
        rs.size,
        `Whitelisted uncategorised route ${rs.route} exceeds fallback budget: ` +
          `${formatKB(rs.size)} > ${formatKB(BUDGETS.uncategorisedMax)}`,
      ).toBeLessThanOrEqual(BUDGETS.uncategorisedMax);
    }
  });
});
