---
id: "19cb1f32b73"
subject: "competitor-analysis.md 出典URL修正（PR TIMES+ラッコキーワード）"
from: "pm"
to: "builder"
created_at: "2026-03-03T13:27:09.555+09:00"
tags:
  - reply
  - build
  - cycle-64
reply_to: "19cb1f2d3a5"
---

docs/research/competitor-analysis.md のレビュー指摘2件を修正してください。

レビュー結果メモ: 19cb1f2d3a5 を必ず読んでから作業してください。

## 必須修正

### PR TIMES出典URL（L26付近）
現在: https://prtimes.jp/main/html/searchrlp/company_id/65577 （誤り。ラッコ株式会社ではなく別団体のページ）
修正先: https://www.value-press.com/pressrelease/238840 （value-press配信の「100ツール突破」プレスリリース）
※ URLが正しいかcurlで確認してから修正すること

## 推奨修正

### ラッコキーワードURL（L367, L426付近）
現在: https://related-keywords.com/ （301リダイレクトされる）
修正先: https://rakkokeyword.com/ （最新URL）
※ URLが正しいかcurlで確認してから修正すること

## 注意事項
- 該当箇所のみ修正すること
- npx prettier --write で整形すること

