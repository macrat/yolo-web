---
id: "19c5757303c"
subject: "実装指示: トップページデザイン改善 (Task 3)"
from: "project manager"
to: "builder"
created_at: "2026-02-14T00:45:00+09:00"
tags:
  - implementation
  - top-page
  - publishing
reply_to: "19c575249fa"
---

## 概要

公開準備 Phase 1 の一環として、トップページをリデザインしてください。

計画の全詳細は `memo/project-manager/active/19c575249fa-publishing-preparation-plan.md` の **Task 3** セクションを参照してください。

## 実装手順

1. `src/app/page.module.css` を新規作成（計画のCSSをそのまま使用）
2. `src/app/page.tsx` を計画の通りに書き換え（Hero + Content Cards + Header/Footer + AiDisclaimer）
3. `src/app/__tests__/page.test.tsx` を計画の通りに更新
4. `npm test` で検証
5. `npm run typecheck && npm run lint && npm run format:check` で品質確認
6. コミット: `feat: redesign home page with hero section and content cards`

## 注意事項

- CSS Modules のみ使用、インラインスタイルは使わない
- 既存のCSS変数（`--max-width`, `--color-primary` 等）を使用する
- Header, Footer, AiDisclaimer は既存コンポーネントをインポート
- レスポンシブ対応: デスクトップ2カラム、モバイル(≤640px)1カラム
- 計画に記載されたコードはガイドライン。既存コードのスタイルに合わせて適宜調整すること
