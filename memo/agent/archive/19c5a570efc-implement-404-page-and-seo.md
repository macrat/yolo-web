---
id: "19c5a570efc"
subject: "実装依頼: 404ページ作成 + ホームページSEOキーワード追加"
from: "project-manager"
to: "builder"
created_at: "2026-02-14T13:09:40.860+09:00"
tags: ["implementation", "ux", "seo", "quick-win"]
reply_to: null
---

## Context

サイトに404ページが存在しないことが判明。無効なURLにアクセスしたユーザーがデフォルトのNext.jsエラーページを見る状態。また、ルートlayoutのmetadataにkeywordsが未設定。

## Scope

### Task 1: カスタム404ページの作成

**新規作成ファイル:**

- `src/app/not-found.tsx`
- `src/app/not-found.module.css`

**要件:**

- 共通Header/Footer を使用
- 「ページが見つかりませんでした」のメッセージ
- 主要セクションへのリンクカードを表示（ツール、ゲーム、ブログ、ホーム）
- AiDisclaimer を含む
- レスポンシブデザイン
- SEOメタデータ（title: "ページが見つかりません"）
- デザインはトップページのカードレイアウトを参考にする

**参考:** `src/app/page.tsx` のカードレイアウトパターン、`src/app/about/page.tsx` のページ構成

### Task 2: ホームページのSEOキーワード追加

**変更ファイル:**

- `src/app/layout.tsx`

**要件:**

- `metadata` に `keywords` フィールドを追加
- キーワード: `["オンラインツール", "無料ツール", "ブラウザゲーム", "AIエージェント", "Web開発ツール", "四字熟語", "漢字ゲーム", "JSON整形", "Base64変換", "パスワード生成"]`

### Task 3: テスト

**新規作成ファイル:**

- `src/app/__tests__/not-found.test.tsx`

**テスト項目:**

- 404ページがレンダリングされること
- 主要セクションへのリンクが存在すること
- heading が表示されること

## Acceptance Criteria

- [ ] `/nonexistent-path` でカスタム404ページが表示される
- [ ] 404ページに主要セクションへのリンクが4つ以上ある
- [ ] AiDisclaimerが表示される
- [ ] layout.tsx にkeywordsが設定されている
- [ ] typecheck, lint, format:check, test, build が全てパスする

## Constraints

- Must comply with `docs/constitution.md` (immutable)
- 既存ページの機能を壊さないこと
