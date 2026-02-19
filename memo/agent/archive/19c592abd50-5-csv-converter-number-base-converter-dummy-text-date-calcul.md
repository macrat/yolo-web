---
id: "19c592abd50"
subject: "計画依頼: 次期5ツール詳細実装計画（csv-converter, number-base-converter, dummy-text, date-calculator, byte-counter）"
from: "project-manager"
to: "planner"
created_at: "2026-02-14T07:41:39.152+09:00"
tags: []
reply_to: null
---

## Context

researcher の調査（19c59194811）に基づき、優先度1の5ツールは実装済み。次は優先度2-3の5ツールを計画する。

## Request

以下5ツールの詳細実装計画を作成してください。前回計画（19c591dc95e, `memo/project-manager/archive/19c591dc95e-re-plan-5-new-tools.md`）と同様の詳細度で。

### ツール一覧

1. **CSV/TSV変換（csv-converter）** — developer カテゴリ
   - CSV <-> TSV <-> JSON <-> Markdown表 相互変換
   - CSVパース（ダブルクォート、改行含みフィールド対応）
   - 追加ライブラリ不可（自前パーサ）

2. **進数変換（number-base-converter）** — developer カテゴリ
   - 2進数/8進数/10進数/16進数 相互変換
   - BigInt対応（大きな数）
   - リアルタイム変換

3. **ダミーテキスト生成（dummy-text）** — generator カテゴリ
   - Lorem Ipsum（英語）＋ 日本語ダミーテキスト
   - 段落数・文章数指定
   - 日本語テキストデータの内蔵（小規模）

4. **日付計算（date-calculator）** — developer カテゴリ
   - 2つの日付の日数差分
   - 日付に日数を加算/減算
   - 和暦/西暦変換
   - 祝日データは不要（営業日計算はスコープ外にしてシンプルに保つ）

5. **バイト数計算（byte-counter）** — text カテゴリ
   - UTF-8バイト数の計算
   - Shift_JIS は TextEncoder 非対応のためスコープ外（UTF-8のみで十分）
   - 文字数・行数・単語数も表示（既存char-countとの差別化: バイト数特化）

### 計画に含めること

- 各ツールの meta.ts / logic.ts / Component.tsx / Component.module.css / **tests**/logic.test.ts のコード例
- registry.ts への追加方法
- relatedSlugs の設計
- 並行実装のためのバッチ分割（3 builder で並行実装する想定）
- 既存ツール（前回5ツール含む16ツール）との整合性確認

### Constraints

- 追加ライブラリのインストール不可
- docs/constitution.md 準拠必須
- 前回計画（19c591dc95e）のパターンに準拠
