import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    // e2e テストは Playwright スクリプト（.mjs）で実装されており、
    // vitest（jsdom 環境）では実行できないため除外する。
    //
    // `tmp/` を除外するのは、そこが作業用の置き場（`.claude/rules/tmp-directory.md`）で
    // あり、リポジトリの複製や検証用スクリプトが置かれるため。除外しないと
    // 複製の中のテストまで走り、`npm test` が落ちる（cycle-302 で実際に発生）。
    // 同じ形が `tsconfig.json` にもあり、そちらは B-466 として別に塞いである。
    exclude: ["**/node_modules/**", "**/tests/e2e/**", "tmp/**"],
    // 既定の include（`**/*.test.ts` 相当）はドットで始まるディレクトリを
    // 走査しないため、`.claude/` に置いたテストは「エラーも出さずに1件も
    // 収集されない」。フックの回帰テストはまさにそこに置くので、
    // ドットディレクトリを明示して足す。これを消すと npm test は緑のまま
    // フックの試験だけが消える。
    include: ["**/*.{test,spec}.?(c|m)[jt]s?(x)", ".claude/**/*.test.ts"],
    // Shiki の `bundle/full` ハイライタは初回呼び出し時に ~200 言語の grammar を
    // ロードするため、Vitest のデフォルト 5s では足りないテストがある
    // （ブログ本文を Shiki でレンダリングする SEO カバレッジテストなど）。
    // ファイルごとに beforeAll で温められないケースに備えて全体を 15s に底上げする。
    testTimeout: 15000,
  },
});
