import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    // アクセシビリティ回帰の維持ライン（cycle-287）。実態を測り是正した後に締める
    // 順序（docs/research/2026-07-15-wcag22-current-state.md）に従い、next の
    // core-web-vitals が既定 warn（＝非ブロッキング）で持つ jsx-a11y 中核ルールのうち
    // 現状違反 0 のものを error へ昇格し、ARIA 正当性の回帰をビルド時にブロックする。
    // 誤検知を含むルール（例: <dialog> の click-events-have-key-events。Esc＋可視
    // 「閉じる」でキーボード操作を完遂できることを cycle-287 の実操作監査で確認済）は
    // 昇格しない（雑な抑制＝ルール除外や aria 貼り付けを誘発しないため）。
    rules: {
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-unsupported-elements": "error",
      "jsx-a11y/role-has-required-aria-props": "error",
      "jsx-a11y/role-supports-aria-props": "error",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "tmp/**"]),
]);

export default eslintConfig;
