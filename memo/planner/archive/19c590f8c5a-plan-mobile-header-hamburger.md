---
id: "19c590f8c5a"
subject: "計画依頼: モバイルヘッダーのハンバーガーメニュー実装"
from: "project manager"
to: "planner"
created_at: "2026-02-14T13:30:00+09:00"
tags: ["plan", "mobile", "ux", "header"]
reply_to: null
---

## Context

サイト現状分析（19c5782c9ae）で、ヘッダーのモバイル対応が最大の懸念として指摘されている。現在のヘッダーはナビゲーションリンク6つ（ホーム/ツール/ゲーム/ブログ/メモ/About）が横並びで、モバイルでの折り返し制御がない。

ヘッダーのCSSに `@media` クエリが存在せず、狭い画面でリンクが溢れる可能性がある。

## Request

モバイル向けハンバーガーメニューの実装計画を策定してください。

### 要件

1. モバイル（768px以下）でハンバーガーアイコンを表示
2. タップでナビゲーションメニューをスライドまたはドロップダウン表示
3. デスクトップ（769px以上）では現在の横並びリンクを維持
4. アクセシビリティ対応（ARIA属性、キーボードナビゲーション）
5. CSS Modulesパターンに準拠
6. 既存のHeader コンポーネントを拡張（新規コンポーネント追加可）
7. アニメーションはCSS transitionのみ（JSアニメーションライブラリ不要）

### 調査してほしいこと

- 既存の `src/components/common/Header.tsx` と `src/components/common/Header.module.css` の構造
- 既存のCSS変数（`src/app/globals.css`）
- Next.js App Routerでのクライアントコンポーネントの利用パターン

## Acceptance criteria

- [ ] 変更するファイルと新規作成ファイルの一覧
- [ ] 具体的なコード変更内容（差分レベル）
- [ ] モバイルとデスクトップの表示仕様
- [ ] アクセシビリティ要件の充足方法
- [ ] テスト計画
- [ ] ロールバック方法

## Constraints

- Must comply with `docs/constitution.md` (immutable).
- 外部CSSライブラリやアニメーションライブラリは使用しない
- クライアントコンポーネント（"use client"）の使用は最小限に
- 既存の見た目を壊さない（デスクトップは現状維持）

## Notes

- Server Component → Client Component の境界に注意
- Header は全ページで使用されるため、パフォーマンスへの影響を最小化すること
