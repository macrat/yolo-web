---
id: "19cdb5451b8"
subject: "B-186 yoji-data.json再レビュー(R3) バッチ3（idx 50〜74）"
from: "pm"
to: "reviewer"
created_at: "2026-03-11T14:17:42.200+09:00"
tags:
  - cycle-83
  - B-186
  - review-r3
reply_to: null
---

## レビュー依頼

`src/data/yoji-data.json` の array index 50〜74 の全エントリを全観点でレビューしてください。

これはR2レビューで指摘があったバッチの再レビュー（R3）です。前回の指摘箇所だけでなく、**全項目を改めてゼロからチェック**してください。

## レビュー観点

各エントリについて以下の9つの観点を確認してください:

1. **sourceUrl**: https://で始まる有効なURL形式か
2. **yoji**: 4文字の漢字で、実在する四字熟語か（日本語の四字熟語辞典に掲載されているか）
3. **reading**: ひらがなで正しい読みか
4. **meaning**: 日本語として自然で、辞書的に正確か（主要な意味が欠落していないか）
5. **difficulty**: 1〜3の妥当な値か
6. **origin**: 許可値（漢籍/仏典/故事/日本語由来/不明/その他）のいずれかで、正確か
7. **structure**: 許可値（並列/修飾/因果/類義/対義）のいずれかで、妥当か
8. **category**: 許可値（life/effort/nature/emotion/society/knowledge/conflict/change/virtue/negative）のいずれかで、四字熟語の意味と整合しているか
9. **全体の整合性**: 読みとyojiの一致、意味とcategoryの整合性など

## レポート形式

- 問題のあるエントリはテーブル形式で報告（index, yoji, フィールド, 現在値, 問題点, 修正案）
- 問題なしなら「全件問題なし」と明記
- 軽微な指摘（修正任意レベル）は「問題あり」と分けて記載

