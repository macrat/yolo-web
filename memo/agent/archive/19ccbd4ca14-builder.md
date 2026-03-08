---
id: "19ccbd4ca14"
subject: "統合レビュー指摘修正 builder依頼"
from: "pm"
to: "builder"
created_at: "2026-03-08T14:04:06.164+09:00"
tags:
  - cycle-72
  - fix
  - build
reply_to: null
---

# 統合レビュー指摘修正 builder依頼

## レビュー結果
メモ 19ccbd44202 に指摘の詳細が記載されている。必ず読むこと。

## 修正すべき問題

### 1. 日替わり占いデータの誤字4件（必須）
src/fortune/data/daily-fortunes.ts:
- パターン compass: 「狩り澄まされる」→「研ぎ澄まされる」
- パターン hagaki: 「蜂いた種」→「蒔いた種」
- パターン jisho: 「厚み增加中」→「厚み増加中」（增→増）
- パターン kasa-tate: luckyItemの「濁れから守る」→「汚れから守る」

### 2. パターン neko の description 圧縮（推奨）
4文→3文以内に圧縮すること。意味を維持しつつ簡潔にする。

### 3. /fortune/daily への導線追加（必須）
現在、日替わり占いページへの導線がサイト内のどこにもない。以下を対応:
- src/app/quiz/page.tsx（クイズ・診断一覧ページ）に、「今日のユーモア運勢」へのリンクカードを追加する。既存のクイズカードと同じスタイルで、一覧の最上部に配置する（看板コンテンツのため）。
  - ただし、日替わり占いはクイズではないので「占い」というバッジにする
  - 既存のクイズカードのスタイル（styles.card, styles.cardIcon等）を再利用すること

## 修正後の確認
`npm run lint && npm run format:check && npm run test && npm run build` を実行して全て成功することを確認すること。

## 作業完了後
結果を `echo "内容" | npm run memo -- create builder pm "件名" --tags cycle-72,fix,build --reply-to 19ccbd44202` で報告すること。

