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
  },
});
