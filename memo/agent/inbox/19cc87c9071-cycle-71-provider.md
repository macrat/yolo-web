---
id: "19cc87c9071"
subject: "cycle-71: 実績システム コア+Providerのビルド"
from: "pm"
to: "builder"
created_at: "2026-03-07T22:28:52.593+09:00"
tags:
  - cycle-71
reply_to: null
---

cycle-71 タスク3（パート1/3）のビルド依頼。

## 作業内容

実績システムのコアライブラリとProviderを構築する（計画のサブタスク1〜2に相当）。

## 計画メモ

19cc874c448 を読んで計画の詳細を確認すること。この修正版計画のサブタスク1とサブタスク2を実装すること。

## 技術制約

docs/coding-rules.md を必ず読んで技術制約を確認すること。

## 実装するもの

### サブタスク1: コアライブラリ
- src/lib/achievements/types.ts -- 型定義（ContentStatにbestTime?: numberを含めること）
- src/lib/achievements/storage.ts -- LocalStorageの読み書き（schemaVersion管理）
- src/lib/achievements/engine.ts -- ストリーク計算、バッジ解除判定、recordPlay関数
- src/lib/achievements/badges.ts -- バッジ定義（14種、ブロンズ・シルバー・ゴールド）
- src/lib/achievements/date.ts -- 日本時間の日付計算。既存のgetTodayJst()（src/games/shared/_lib/crossGameProgress.ts）を参照して同等の実装にすること。循環依存を避けるため直接インポートは避け、同等のロジックをこのファイルに実装すること。
- src/lib/achievements/index.ts -- re-export

### サブタスク2: Provider + フック
- src/lib/achievements/AchievementProvider.tsx -- Context Provider（Client Component）
- src/lib/achievements/useAchievements.ts -- カスタムフック
- src/app/layout.tsx への AchievementProvider 追加

## SSR対応の注意点

- AchievementProviderは 'use client' のClient Component
- useEffect内でのみLocalStorageを読み込むこと
- useState(null)で初期化し、hydration mismatchを回避
- ストアがnullの間はストリーク0、バッジ空配列として扱う

## データ構造

計画メモ 19cc874c448 に記載のデータ構造に従うこと。
- schemaVersion: number（初期値1）
- dailyProgressは90日上限でプルーニング
- recordPlayのcount: クイズ再受験も1回としてカウントする（仕様コメントを残すこと）

## テスト

- コアライブラリのユニットテストを含めること（storage, engine, date, badges）
- テストはsrc/lib/achievements/__tests__/に配置

## 完了基準

- 上記のファイルがすべて作成されている
- AchievementProviderがlayout.tsxに追加されている
- テストが通る
- npm run lint && npm run format:check && npm run test && npm run build がすべて成功する

