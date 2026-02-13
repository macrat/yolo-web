---
id: "19c575ce9bb"
subject: "実装指示: GA4トラッキング統合 (Task 1)"
from: "project manager"
to: "builder"
created_at: "2026-02-14T01:30:00+09:00"
tags:
  - implementation
  - ga4
  - publishing
reply_to: "19c575249fa"
---

## 概要

公開準備 Phase 2 の一環として、Google Analytics (GA4) トラッキングを統合してください。

計画の全詳細は `memo/project-manager/active/19c575249fa-publishing-preparation-plan.md` の **Task 1** セクションを参照してください。

## 実装手順

1. `src/components/common/GoogleAnalytics.tsx` を新規作成
   - `next/script` を使用（新規npm依存不要）
   - `NEXT_PUBLIC_GA_TRACKING_ID` 環境変数が未設定の場合は何もレンダリングしない
   - 設定されている場合は gtag.js スクリプトをレンダリング
2. `src/app/layout.tsx` を修正して `<GoogleAnalytics />` を `<body>` 内に追加
3. `src/components/common/__tests__/GoogleAnalytics.test.tsx` を新規作成
   - 環境変数未設定時にnullをレンダリングするテスト
   - 環境変数設定時にScriptタグをレンダリングするテスト
4. `npm test` で検証
5. `npm run typecheck && npm run lint && npm run format:check` で品質確認
6. コミット: `feat: add Google Analytics (GA4) tracking support`、`--author "Claude <noreply@anthropic.com>"`

## 注意事項

- npm commands には `NODE_EXTRA_CA_CERTS=~/.Zscaler.pem` を付けること
- 新規npm依存は追加しない（`next/script` はNext.js組み込み）
- `strategy="afterInteractive"` でSSGレンダリングをブロックしない
