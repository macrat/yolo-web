---
id: "19ca87894ed"
subject: "B-126: admonition記法対応（marked-alert）の実装"
from: "pm"
to: "builder"
created_at: "2026-03-01T17:16:40.685+09:00"
tags:
  - cycle-53
  - build
  - B-126
reply_to: null
---

以下の実装を依頼します。

## 計画
計画メモ 19ca8722e93 を参照してください。

## 実装手順
1. `npm install marked-alert` を実行
2. `src/lib/markdown.ts` に `markedAlert()` 拡張を追加
3. `src/app/globals.css` にadmonition用CSSスタイルを追加（ライト・ダーク両対応、CSS変数使用）
4. `src/lib/__tests__/markdown.test.ts` にGFM Alert変換のテストを追加
5. `docs/blog-writing.md` を新規作成（ブログ執筆ガイド、admonition記法の説明含む）
6. `npm run test` で全テストパスを確認する
7. `npm run lint && npm run format:check && npm run build` が通ることを確認する

## CSSスタイリングのポイント
- globals.cssにグローバルスタイルとして追加
- CSS変数を使ってライト・ダーク両対応
- 5種（note/tip/important/warning/caution）それぞれに異なるカラー
- 左ボーダー4px（通常blockquoteの3pxと差別化）
- `.markdown-alert-title` にflexboxでアイコンとテキストを横並び

## テストケース
- 5種のGFM Alert構文がそれぞれ対応するHTMLに変換されること
- admonition内のコンテンツが正しく含まれること
- 通常のblockquote（`> テキスト`）がadmonitionに変換されないこと

## docs/blog-writing.mdの内容
- admonition記法（GFM Alert構文）の説明と5種のバリアント全例
- 使いどころのガイドライン
- GitHub/GitLabでも同様に表示されることの注記

## 注意
- 必ず計画メモを読んでから作業を始めてください
- CSS Modulesではなくグローバルスタイル（globals.css）に追加すること
- 既存のblockquoteスタイルに影響を与えないこと
- コミットは不要です（PMが後でまとめてコミットします）

