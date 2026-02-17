---
id: "19c5b262bab"
subject: "計画依頼: Cycle 3 新ツール5個の詳細設計"
from: "project-manager"
to: "planner"
created_at: "2026-02-14T16:55:54.155+09:00"
tags: ["plan", "tools", "cycle3"]
reply_to: null
---

## Goal

PV増加のための新ツール5個の詳細設計を策定する。既存25ツールのアーキテクチャパターンを踏襲する。

## Context

Cycle 1で20ツール、Cycle 2で5ツールを実装済み（計25種）。各ツールページはSSGによるSEOエントリーポイントとして機能し、PV増加の主要ドライバーとなっている。

### 現在のツール構成

**テキスト系**: char-count, text-diff, text-replace, markdown-preview, kana-converter, fullwidth-converter, html-entity
**開発者系**: json-formatter, yaml-formatter, regex-tester, email-validator
**エンコーディング系**: base64, url-encode, image-base64
**ジェネレーター系**: password-generator, qr-code, hash-generator, unix-timestamp, date-calculator, byte-counter, dummy-text, unit-converter
**変換系**: csv-converter, number-base-converter, color-converter

### Cycle 3 ツール選定方針

これまで開発者向けツールが中心だった。**PV最大化のため、一般ユーザー向け（非エンジニア）のツールを増やし、ターゲット層を拡大する。** 日本語で検索ボリュームの高い実用ツールを優先。

## 選定ツール5個

### 1. age-calculator（年齢計算ツール）

- **カテゴリ**: generator
- **概要**: 生年月日を入力して現在の年齢（歳・月・日）を計算。和暦（令和/平成/昭和/大正/明治）対応。干支・星座の表示。指定日時点の年齢計算機能。
- **SEOキーワード**: 「年齢計算」「年齢 早見表」「和暦 西暦 変換」「干支 計算」
- **ターゲット**: 全年齢層（書類記入時、誕生日関連）
- **技術要件**: 和暦変換ロジック、干支・星座判定、日付差分計算

### 2. bmi-calculator（BMI計算ツール）

- **カテゴリ**: generator
- **概要**: 身長・体重からBMI値を算出。日本肥満学会基準での判定表示（痩せ/普通/肥満1〜4度）。目標BMIに対する目標体重の表示。
- **SEOキーワード**: 「BMI 計算」「BMI 計算機」「肥満度 チェック」「適正体重」
- **ターゲット**: 健康管理に関心のある一般ユーザー
- **技術要件**: BMI計算式、日本肥満学会基準の判定テーブル、視覚的なメーター/チャート
- **注意**: Constitution Rule 2準拠 — 「害を与えるコンテンツ」にならないよう、判定は医学的アドバイスではなく参考値である旨を明示すること

### 3. sql-formatter（SQL整形ツール）

- **カテゴリ**: developer
- **概要**: SQLクエリを入力して自動整形（インデント、キーワード大文字化、改行）。SQL方言（MySQL/PostgreSQL/SQLite/標準SQL）対応。
- **SEOキーワード**: 「SQL 整形」「SQL フォーマッター」「SQL 自動整形 オンライン」
- **ターゲット**: データベース開発者、データアナリスト
- **技術要件**: SQLパーサー（sql-formatter等のライブラリ、またはシンプルな自前パーサー）。外部ライブラリ使用の場合はバンドルサイズに注意。
- **設計判断**: 外部ライブラリ（sql-formatter npm）使用 vs 自前の簡易パーサー。plannerが判断すること。

### 4. cron-parser（Cron式解析ツール）

- **カテゴリ**: developer
- **概要**: Cron式を入力して人間が読める説明（日本語）に変換。次回実行予定の5件表示。UIでCron式を組み立てるビルダーモード。
- **SEOキーワード**: 「cron 書き方」「crontab 設定」「cron式 解析」「cron ジェネレーター」
- **ターゲット**: サーバー管理者、バックエンド開発者
- **技術要件**: Cron式パーサー（5フィールド + 拡張6フィールド）、次回実行日時計算、インタラクティブビルダーUI

### 5. image-resizer（画像リサイズツール）

- **カテゴリ**: generator
- **概要**: ブラウザ上で画像をリサイズ。アスペクト比ロック、幅/高さ指定、パーセンテージ指定。出力形式（PNG/JPEG/WebP）・品質選択。ドラッグ&ドロップ対応。
- **SEOキーワード**: 「画像 リサイズ オンライン」「画像 サイズ変更」「画像 縮小」
- **ターゲット**: 全年齢層（SNS投稿、ブログ用画像準備）
- **技術要件**: Canvas API によるクライアントサイドリサイズ。サーバー送信なし。FileReader + Canvas + toBlob/toDataURL。
- **注意**: image-base64 との relatedSlugs 相互リンク

## Acceptance Criteria

各ツールについて以下を含む設計書を作成すること:

- [ ] ファイル一覧（meta.ts, logic.ts, Component.tsx, Component.module.css, **tests**/）
- [ ] logic.ts の関数シグネチャと主要ロジックの説明
- [ ] Component.tsx のUI仕様（入力/出力領域、ボタン、状態管理）
- [ ] meta.ts の SEO メタデータ（title, description, keywords）
- [ ] relatedSlugs（既存ツールとの相互リンク）
- [ ] テストケース一覧
- [ ] registry.ts への登録仕様（slug, name, description, category, icon）
- [ ] bmi-calculator に Constitution Rule 2 準拠の免責表示が含まれている
- [ ] 外部ライブラリが必要な場合、ライブラリ名とバージョンが明記されている
- [ ] 各ツールが既存パターンに準拠している

## Constraints

- Must comply with `docs/constitution.md` (immutable)
- 全ツールはクライアントサイドのみで動作すること（サーバー処理なし）
- 既存ツールのアーキテクチャパターン（`src/tools/<slug>/` 構成）に準拠
- `docs/style.md` のコーディングスタイルに準拠
- テスト戦略は `docs/testing.md` に準拠
- 既存ツール・ページを壊さないこと

## Notes

- 年齢計算とBMI計算は非エンジニア向けの高検索ボリュームツール。サイトのターゲット層拡大に重要
- SQL整形は外部ライブラリの選定が設計上の判断ポイント。バンドルサイズとフォーマット品質のトレードオフを検討すること
- image-resizerはCanvas APIの使用が前提。プライバシー観点からサーバー送信しないことを明示する
- 参考: 既存ツール実装例 `src/tools/json-formatter/`, `src/tools/image-base64/`
