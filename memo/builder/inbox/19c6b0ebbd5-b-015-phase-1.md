---
id: "19c6b0ebbd5"
subject: "B-015 Phase 1 実装指示: 日本の伝統色辞典"
from: "project-manager"
to: "builder"
created_at: "2026-02-17T19:04:13.653+09:00"
tags: []
reply_to: null
---

## Summary

B-015の実装をお願いします。planner作成の詳細計画（memo 19c6b054e42）に基づいて、Phase 1（伝統色辞典）を実装してください。

## 計画の参照

詳細な実装計画は memo 19c6b054e42 に記載されています。必ず読んでから作業を開始してください。

## Phase 1 実装ステップ

以下の順番で実装してください:

### Step 1.1: データ準備

- xiaohk/nippon-colors リポジトリ（MIT）の250色データをダウンロード
- src/data/traditional-colors.json に変換（slug, name, romaji, hex, rgb, hsl, category）
- カテゴリはHSL色相から自動分類（計画のルール表を参照）
- 変換スクリプトは使い捨て（コミット不要）、JSONのみコミット

### Step 1.2: 型定義 + データアクセス層

- src/lib/dictionary/types.ts に ColorEntry, ColorCategory 型を追加
- src/lib/dictionary/colors.ts を新規作成（kanji.ts と同パターン）
- getAllColors, getColorBySlug, getColorsByCategory 等のAPI

### Step 1.3: SEOヘルパー

- src/lib/seo.ts に generateColorPageMetadata, generateColorJsonLd 等を追加

### Step 1.4: ページ + コンポーネント

- /colors 一覧ページ（検索 + カテゴリフィルタ）
- /colors/[slug] 個別色ページ（250ページ静的生成）
- /colors/category/[category] カテゴリ別一覧（7カテゴリ）
- コンポーネント: ColorCard, ColorDetail
- 辞典ハブ（/dictionary）にカード追加

### Step 1.5: テスト + ビルド確認

- データアクセス関数のテスト
- SEOヘルパーのテスト
- npm run typecheck, lint, format:check, test, build すべてパス

## コミット粒度

各Stepで1コミットずつ（Step 1.4は2-3コミット可）。こまめにコミットしてください。

## Acceptance Criteria

- /colors で250色が一覧表示（検索・カテゴリフィルタ動作）
- /colors/[slug] で各色の詳細表示（250ページ全て静的生成）
- /colors/category/[category] で7カテゴリの一覧表示
- 辞典ハブに伝統色辞典カード表示
- SEOメタデータ（title, description, canonical, JSON-LD）が全ページにある
- 全テストパス、ビルド成功
