import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    // e2e テストは Playwright スクリプト（.mjs）で実装されており、
    // vitest（jsdom 環境）では実行できないため除外する
    exclude: ["**/node_modules/**", "**/tests/e2e/**"],
    // Shiki の `bundle/full` ハイライタは初回呼び出し時に ~200 言語の grammar を
    // ロードするため、Vitest のデフォルト 5s では足りないテストがある
    // （ブログ本文を Shiki でレンダリングする SEO カバレッジテストなど）。
    // ファイルごとに beforeAll で温められないケースに備えて全体を 15s に底上げする。
    testTimeout: 15000,
  },
});
