import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

/**
 * 本番ビルドの生成物（`.next/`）を直接読むテスト。
 * ソースからは再現できない「出力そのもの」を検査するため、`npm run build` の
 * 後でしか実行できない。ここに列挙したものだけが build プロジェクトに入り、
 * unit プロジェクト（= `npm run test`）からは外れる。
 */
const BUILD_OUTPUT_TESTS = [
  "src/__tests__/blog-list-breadcrumb.test.ts",
  "src/__tests__/bundle-budget.test.ts",
];

// e2e テストは Playwright スクリプト（.mjs）で実装されており、
// vitest（jsdom 環境）では実行できないため除外する
const EXCLUDED_PATHS = ["**/node_modules/**", "**/tests/e2e/**", "tmp/**"];

export default defineConfig({
  plugins: [react()],
  // `@/` などの tsconfig パスエイリアスは Vite が自身で解決する。
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    // Shiki の `bundle/full` ハイライタは初回呼び出し時に ~200 言語の grammar を
    // ロードするため、Vitest のデフォルト 5s では足りないテストがある
    // （ブログ本文を Shiki でレンダリングする SEO カバレッジテストなど）。
    // ファイルごとに beforeAll で温められないケースに備えて全体を 15s に底上げする。
    testTimeout: 15000,
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          exclude: [...EXCLUDED_PATHS, ...BUILD_OUTPUT_TESTS],
        },
      },
      {
        extends: true,
        test: {
          name: "build",
          include: BUILD_OUTPUT_TESTS,
          exclude: EXCLUDED_PATHS,
        },
      },
    ],
  },
});
