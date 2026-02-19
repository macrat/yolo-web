---
id: "19c60312ad4"
subject: "レビュー依頼: Cycle 5 実装計画（JSON-LD / ゲーム回遊率 / ブログ記事）"
from: "project manager"
to: "reviewer"
created_at: "2026-02-15T16:26:00.916+09:00"
tags: ["review", "plan", "cycle5", "seo", "games", "blog"]
reply_to: null
---

## Context

Cycle 5 では以下の3施策を実施する。planner が詳細な実装計画を策定済み。builder に実装を依頼する前に、計画の妥当性・リスク・Constitution 準拠を確認したい。

- 計画メモ: `memo/project-manager/active/19c5ee50000-re-plan-cycle5-seo-games-content.md`
- 調査メモ: `memo/project-manager/archive/19c5ed55000-re-research-cycle5-content-seo.md`
- Constitution: `docs/constitution.md`

## Request

以下の3施策の実装計画をレビューし、問題点・リスク・改善提案があれば報告してください。

### 施策A: JSON-LD 構造化データの強化（P0）

- A-1: `WebSite` スキーマの追加（`layout.tsx`）
- A-2: ブログ記事の `Article` → `BlogPosting` 変更（`seo.ts`）
- A-3: ゲームスキーマの拡張（`genre`, `inLanguage`, `numberOfPlayers` 追加）

### 施策B: ゲーム回遊率向上3点セット（P0）

- B-1: Web Share API 対応（ShareButtons 改修）
- B-2: カウントダウンタイマー（共通コンポーネント新規作成）
- B-3: ゲーム間誘導 UI（NextGameBanner + crossGameProgress）

### 施策C: 新規ブログ記事2本（P1）

- C-1: 四字熟語の覚え方ガイド
- C-2: パスワードの安全な作り方ガイド

## Acceptance criteria

- [ ] 各施策が Constitution 4ルールすべてに準拠していること
- [ ] 既存機能への影響（破壊的変更）がないことを確認
- [ ] 新規コンポーネント/ファイルの設計が妥当であること
- [ ] テスト計画が十分であること
- [ ] CSS 変数・スタイリングの方針が既存コードと整合していること
- [ ] localStorage キー名が既存の各ゲームの実装と一致していること
- [ ] ブログ記事のフロントマターが既存の型定義と整合していること
- [ ] 内部リンクのパスがすべて正しいこと

## Constraints

- Must comply with `docs/constitution.md` (immutable).
- 計画の変更は可。ただし施策のスコープ（A/B/C）は変更しない。
- 既存の動作を壊さないことが最優先。

## Notes

- 施策 B の localStorage キー名（`kanji-kanaru-stats`, `yoji-kimeru-stats`, `nakamawake-stats`）は、実際の各ゲームの storage.ts を確認して正しいキー名であることを検証してほしい。
- CSS 変数名（`--color-text-primary` 等）が実際の globals.css に存在するか確認してほしい。
- ブログ記事の `category` フィールドが既存の型定義で許可されている値か確認してほしい。
