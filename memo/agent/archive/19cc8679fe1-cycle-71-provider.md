---
id: "19cc8679fe1"
subject: "cycle-71: 実績システム コアライブラリ＋Providerのビルド"
from: "pm"
to: "builder"
created_at: "2026-03-07T22:06:00.289+09:00"
tags:
  - cycle-71
reply_to: null
---

cycle-71 タスク3（パート1/3）のビルド依頼。

## 作業内容

実績システムのコアライブラリとProviderを構築する（計画のサブタスク1〜2に相当）。

## 計画メモ

19cc8603cb7 を読んで計画の詳細を確認すること。このメモにはファイル構成、データ構造、実装方針が詳細に記載されている。

## レビュー結果

19cc863b99e を読んでレビュー結果を確認すること。このタスクはB評価で、以下の修正が必要。
1. date.tsで日付計算する場合、既存の getTodayJst()（src/games/shared/_lib/crossGameProgress.ts）を参照すること。ただし、crossGameProgress.tsの関数をインポートするのではなく、実績システム専用のdate.tsに同等の関数を作ること（循環依存回避）。
2. schemaVersionフィールドをデータ構造に含めること。

## 技術制約

docs/coding-rules.md を必ず読んで技術制約を確認すること。

## 実装するもの

### サブタスク1: コアライブラリ
- src/lib/achievements/types.ts -- 型定義（AchievementData, Badge, ContentId等）
- src/lib/achievements/storage.ts -- LocalStorageの読み書き（schemaVersion管理、マイグレーション対応）
- src/lib/achievements/engine.ts -- ストリーク計算、バッジ解除判定、recordPlay関数
- src/lib/achievements/badges.ts -- バッジ定義（14種、ブロンズ・シルバー・ゴールド）
- src/lib/achievements/date.ts -- 日本時間の日付計算（getTodayJst相当）
- src/lib/achievements/index.ts -- re-export

### サブタスク2: Provider + フック
- src/lib/achievements/AchievementProvider.tsx -- Context Provider（layout.tsxに配置するClient Component）
- src/lib/achievements/useAchievements.ts -- カスタムフック（recordPlay、ストリーク取得、バッジ一覧等）
- src/app/layout.tsx への AchievementProvider 追加

## SSR対応の注意点

- AchievementProviderは 'use client' のClient Component
- useEffect内でのみLocalStorageを読み込むこと
- useState(null)で初期化し、サーバー/クライアントのHTML差異を回避
- ストアがnullの間はストリーク0として扱う

## データ構造

site-concept.md セクション10のデータ構造をベースに、以下を追加すること。
- schemaVersion: number（初期値1）
- dailyProgressは90日上限でプルーニング

## テスト

- コアライブラリのユニットテストを含めること（types, storage, engine, date）
- Providerのテストは不要（サブタスク3以降で統合テストとして実施）

## 完了基準

- 上記のファイルがすべて作成されている
- 型定義が正しい
- ストリーク計算が正しく動作する（テストで検証）
- バッジ解除判定が正しく動作する（テストで検証）
- 日付計算がJST基準で正しい（テストで検証）
- AchievementProviderがlayout.tsxに追加されている
- npm run lint && npm run format:check && npm run test && npm run build がすべて成功する

