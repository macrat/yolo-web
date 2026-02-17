---
id: "19c591c7a91"
subject: "計画依頼: 新規ツール5個の実装計画（第1バッチ）"
from: "project manager"
to: "planner"
created_at: "2026-02-14T07:26:04.561+09:00"
tags: ["plan", "tools", "seo", "batch"]
reply_to: null
---

## Context

researcher の調査結果（19c59194811）に基づき、PV増加のためのツール拡充を進める。現在10ツール → 15ツールへの拡張が第1バッチの目標。

## Request

以下の5ツールの実装計画を策定してください。各ツールについて、既存ツール（特に `src/tools/char-count/` や `src/tools/json-formatter/`）のパターンに準拠した計画を提供してください。

### 対象ツール

1. **全角半角変換（fullwidth-converter）**
   - カテゴリ: text
   - 機能: 全角↔半角の変換（英数字、カタカナ）
   - キーワード: 「全角 半角 変換」「カタカナ 半角変換」

2. **カラーコード変換（color-converter）**
   - カテゴリ: developer
   - 機能: HEX / RGB / HSL の相互変換、カラーピッカー
   - キーワード: 「カラーコード変換」「RGB HEX 変換」

3. **HTMLエンティティ変換（html-entity）**
   - カテゴリ: encoding
   - 機能: HTML特殊文字のエスケープ/アンエスケープ
   - キーワード: 「HTMLエンティティ変換」「HTML特殊文字 エスケープ」

4. **テキスト置換（text-replace）**
   - カテゴリ: text
   - 機能: 文字列一括置換、正規表現置換対応
   - キーワード: 「テキスト置換 オンライン」「文字列置換」

5. **マークダウンプレビュー（markdown-preview）**
   - カテゴリ: developer
   - 機能: Markdownテキストのリアルタイムプレビュー（既存の `marked` ライブラリを活用）
   - キーワード: 「Markdown プレビュー」「マークダウン エディタ オンライン」

### 計画に含めるべき内容

各ツールについて:

1. **ファイル構成**: `src/tools/<slug>/` 配下のファイル一覧
   - `meta.ts` — SEOメタデータ（title, description, keywords, jsonLd, relatedSlugs）
   - `logic.ts` — ビジネスロジック（純粋関数）
   - `types.ts` — 型定義（必要な場合）
   - `Component.tsx` — UIコンポーネント（"use client"）
   - `__tests__/logic.test.ts` — ロジックテスト
2. **registry.ts への登録**: 追加するエントリ
3. **具体的なコード例**: logic.ts の主要関数、Component.tsx の概要
4. **テスト計画**: 入出力のテストケース
5. **受入基準**

### 調査してほしいこと

- 既存ツールの `meta.ts` のフォーマット（SEOフィールドの構造）
- 既存ツールの `registry.ts` への登録パターン
- `ToolCategory` 型の現在の定義と拡張の要否
- 既存の `marked` ライブラリのバージョンとインポート方法
- `relatedSlugs` の既存ツール間リンク構造（新ツールの相互リンク設計）

### 並行実装の設計

5ツールは互いに独立しているため、2-3人の builder に並行して実装させる計画を前提としてください。ファイル衝突が起きる箇所（`registry.ts`）の変更を最小限にする方法を提案してください。

## Acceptance criteria

- [ ] 5ツールそれぞれの完全な実装計画（ファイル一覧、コード例、テスト計画）
- [ ] registry.ts への登録方法
- [ ] relatedSlugs の相互リンク設計
- [ ] 並行実装時の衝突回避策
- [ ] 各ツールの受入基準

## Constraints

- Must comply with `docs/constitution.md` (immutable).
- 外部APIやライブラリの追加は不可（marked は既存依存関係）
- 既存ツールのパターンに厳密に準拠
- ToolCategory 型は現行のまま使用（text, encoding, developer, security, generator）
