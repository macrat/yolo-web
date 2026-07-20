/**
 * Prebuild script: Generate the release identifier constant.
 *
 * This script resolves a deterministic "release" identifier (short git SHA +
 * date) and writes it to:
 *   `src/lib/generated/release-id.ts` — `export const RELEASE_ID = "..."`
 *
 * The release id is attached to every GA event via `gtag('config', …, { release })`
 * (see src/components/common/GoogleAnalytics.tsx) so BigQuery can slice metrics
 * by deployment ("which release changed the numbers?").
 *
 * WHY env-var-first resolution (this script is NOT the same shape as the other
 * prebuild codegen):
 * - The other codegen (generate-toolbox-registry) does NOT touch git at all —
 *   it walks meta.ts. So "the other codegen proves git works at build time" is
 *   NOT a valid argument here.
 * - yolos.net deploys on Vercel, whose build container may be a shallow clone
 *   or may not ship `git`. Therefore release resolution must NOT depend on
 *   `git rev-parse` alone.
 *
 * RESOLUTION PRIORITY (fallback chain — first that succeeds wins):
 *   1. process.env.VERCEL_GIT_COMMIT_SHA (Vercel injects this on every deploy),
 *      short-7. Date derived from VERCEL_GIT_COMMIT_DATE (commit date).
 *   2. `git rev-parse --short=7 HEAD` (local `npm run build`/`dev` where .git exists).
 *      Date derived from the commit date (`git show -s --format=%cI`).
 *   3. `unknown-<build-time ISO date>` (final fallback; guarantees release is
 *      never empty).
 *
 * DETERMINISM: For a given commit (paths 1 and 2), the value is deterministic —
 * same commit → same release id. Only path 3 (no SHA available at all) uses the
 * build-time date, which is acceptable per the design (docs/visitor-value-measurement.md
 * 論点4) because there is no commit to key off.
 *
 * OUTPUT file is committed to git (lint/typecheck works without running prebuild);
 * it is regenerated on every prebuild/predev/pretest to stay in sync.
 * If manually edited, run `npm run generate:release-id` to revert.
 *
 * 申し送り（波2 builder 向け）: `src/lib/analytics.ts` の track 関数で `release`
 * を再度 event params に積まないこと。GoogleAnalytics.tsx の `gtag('config', …,
 * { release })` で全 GA イベントに自動付与されており、二重付与は冗長になるだけ。
 * analytics.ts 側は `ab_variant` / `experiment_id` の付与に専念する。
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd());
const OUTPUT_FILE = path.join(ROOT, "src/lib/generated/release-id.ts");

const SHORT_SHA_LENGTH = 7;

/** Short-7 a full SHA. Returns "" for empty/falsy input. */
function shortSha(sha: string | undefined): string {
  if (!sha) return "";
  return sha.trim().slice(0, SHORT_SHA_LENGTH);
}

/**
 * Format a Date as a compact `YYYYMMDD` string in UTC.
 * UTC is used so the value is deterministic regardless of the build machine's
 * timezone (same commit → same date suffix everywhere).
 */
function formatDateYYYYMMDD(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

/** Parse a date string into YYYYMMDD, or return "" if unparseable. */
function dateSuffixFrom(raw: string | undefined): string {
  if (!raw) return "";
  const parsed = new Date(raw.trim());
  if (Number.isNaN(parsed.getTime())) return "";
  return formatDateYYYYMMDD(parsed);
}

/**
 * Run a git command, returning trimmed stdout or undefined on any failure.
 * `pathEnv` is threaded through so callers (and tests) can disable git by
 * passing an empty PATH; on a real build it is the process PATH.
 */
function tryGit(
  args: string[],
  pathEnv: string | undefined,
): string | undefined {
  try {
    return execFileSync("git", args, {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "ignore"],
      encoding: "utf-8",
      env: { ...process.env, PATH: pathEnv },
    }).trim();
  } catch {
    return undefined;
  }
}

/**
 * The subset of environment variables this resolver reads.
 *
 * An index signature is included so the real `process.env` (which has a
 * `[key: string]: string | undefined` index plus a required `NODE_ENV`) is
 * structurally assignable as the default argument.
 */
export interface ReleaseEnv {
  VERCEL_GIT_COMMIT_SHA?: string;
  VERCEL_GIT_COMMIT_DATE?: string;
  /** Present only so tests can disable git by emptying PATH. */
  PATH?: string;
  [key: string]: string | undefined;
}

/**
 * Resolve the release id via the fallback chain documented above.
 * Exported as a pure-ish function (env + git side effects only) so the priority
 * order can be unit-tested by setting env and stubbing git availability.
 */
export function resolveReleaseId(env: ReleaseEnv = process.env): string {
  // --- Priority 1: Vercel system env vars ---
  const vercelSha = shortSha(env.VERCEL_GIT_COMMIT_SHA);
  if (vercelSha) {
    const date =
      dateSuffixFrom(env.VERCEL_GIT_COMMIT_DATE) ||
      formatDateYYYYMMDD(new Date());
    return `${vercelSha}-${date}`;
  }

  // --- Priority 2: local git ---
  const gitSha = shortSha(
    tryGit(["rev-parse", `--short=${SHORT_SHA_LENGTH}`, "HEAD"], env.PATH),
  );
  if (gitSha) {
    // Commit date (committer date, ISO 8601) → deterministic per commit.
    const date =
      dateSuffixFrom(
        tryGit(["show", "-s", "--format=%cI", "HEAD"], env.PATH),
      ) || formatDateYYYYMMDD(new Date());
    return `${gitSha}-${date}`;
  }

  // --- Priority 3: final fallback (no SHA available) ---
  return `unknown-${formatDateYYYYMMDD(new Date())}`;
}

/** Build the TypeScript source for the generated file. */
export function buildReleaseIdContent(releaseId: string): string {
  return [
    "/**",
    " * AUTO-GENERATED FILE — DO NOT EDIT MANUALLY.",
    " *",
    " * Generated by: scripts/generate-release-id.ts",
    " * Regenerate with: npm run generate:release-id",
    " *",
    " * Release identifier (short git SHA + date) attached to every GA event.",
    " * Contains no PII — only the git commit SHA and its date (憲法ルール2 /",
    " * coding-rules #2).",
    " */",
    "",
    `export const RELEASE_ID = ${JSON.stringify(releaseId)};`,
    "",
  ].join("\n");
}

function main(): void {
  const startTime = Date.now();

  const releaseId = resolveReleaseId();
  const content = buildReleaseIdContent(releaseId);

  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(OUTPUT_FILE, content, "utf-8");

  const elapsed = Date.now() - startTime;
  console.log(
    `[generate-release-id] release=${releaseId} → ${OUTPUT_FILE} (${elapsed}ms)`,
  );
}

// Only run when invoked directly (not when imported by tests).
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(__filename)
) {
  main();
}
