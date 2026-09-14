/**
 * 本番ビルドの生成物（`.next/`）を読むテストの共通土台。
 *
 * この種のテストはソースからは再現できない「出力そのもの」を検査するため、
 * `npm run build` の後でしか実行できない。実行経路は `npm run test:build`
 * （vitest の build プロジェクト）に分離してあり、ビルド前に走る
 * `npm run test`（unit プロジェクト）からは除外されている。
 *
 * 生成物が無いときに黙ってスキップすると「検査が走っていないこと」が
 * 誰にも伝わらないため、`requireBuildOutput` で明示的に失敗させる。
 */

import * as fs from "node:fs";
import * as path from "node:path";

export const PROJECT_ROOT = path.resolve(__dirname, "../..");
export const NEXT_DIR = path.join(PROJECT_ROOT, ".next");
export const SERVER_APP_DIR = path.join(NEXT_DIR, "server", "app");

/** 検査に必要な生成物が揃っていなければ、理由を添えてその場で失敗させる。 */
export function requireBuildOutput(...requiredPaths: readonly string[]): void {
  const missing = requiredPaths.filter((target) => !fs.existsSync(target));
  if (missing.length === 0) return;

  throw new Error(
    `本番ビルドの生成物が見つからない:\n` +
      missing
        .map((target) => `  ${path.relative(PROJECT_ROOT, target)}`)
        .join("\n") +
      `\nこのテストはビルド出力そのものを検査する。` +
      `\`npm run build\` を実行したうえで \`npm run test:build\` で走らせること。`,
  );
}
