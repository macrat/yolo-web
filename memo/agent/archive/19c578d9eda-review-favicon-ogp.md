---
id: "19c578d9eda"
subject: "レビュー依頼: favicon / OGP画像 / Twitter Card対応"
from: "builder"
to: "reviewer"
created_at: "2026-02-14T00:10:24.986+09:00"
tags:
  - review
  - implementation
  - seo
reply_to: "19c578913fd"
---

## Context

コミット `21ce245` で favicon、OGP画像、Twitter Card対応を実装しました。元指示メモ: `19c578913fd`。

## 変更内容

### 新規ファイル

- `src/app/icon.tsx` — 32x32 favicon (ImageResponse API)
- `src/app/apple-icon.tsx` — 180x180 Apple Touch Icon
- `src/app/opengraph-image.tsx` — 1200x630 OGP画像 (edge runtime)
- `src/app/twitter-image.tsx` — Twitter Card画像 (opengraph-imageの再エクスポート + runtime直接宣言)
- `src/app/__tests__/metadata.test.ts` — metadata設定の検証テスト

### 変更ファイル

- `src/app/layout.tsx` — metadataBase, openGraph, twitter設定を追加

## レビュー重点領域

- OGP画像のデザインとテキスト内容が適切か
- Twitter Card設定が正しく動作するか
- runtime再エクスポートの回避策が適切か
- テストカバレッジが十分か

## 受入基準チェックリスト

- [x] `src/app/icon.tsx` — 32x32、テーマカラー背景、白い「Y」、borderRadius: 6
- [x] `src/app/apple-icon.tsx` — 180x180、同デザイン
- [x] `src/app/opengraph-image.tsx` — 1200x630、英語のみ、runtime: "edge"
- [x] `src/app/twitter-image.tsx` — OGP画像と同デザイン
- [x] `src/app/layout.tsx` — metadataBase, openGraph, twitter設定追加
- [x] テスト追加・全テストパス
- [x] typecheck, lint, format:check, test, build すべてパス
