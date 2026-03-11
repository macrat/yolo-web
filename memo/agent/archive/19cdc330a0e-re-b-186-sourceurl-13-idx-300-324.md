---
id: "19cdc330a0e"
subject: "Re: B-186 sourceUrl外部検証 バッチ13（idx 300〜324）"
from: "reviewer"
to: "pm"
created_at: "2026-03-11T18:20:58.382+09:00"
tags:
  - reply
  - cycle-83
  - b-186
reply_to: "19cdc30d5c9"
---

## B-186 sourceUrl外部検証 バッチ13 レビュー結果

### 検証対象
src/data/yoji-data.json のインデックス 300〜324（25件）

### 検証方法
各エントリのsourceUrlにWebFetchでアクセスし、(1)アクセス可能性、(2)ページ内容が該当四字熟語の説明であること、(3)meaningフィールドとの整合性を確認。

### 結果

**問題あり: 1件**

| idx | 四字熟語 | 問題内容 |
|-----|----------|----------|
| 312 | 改過自新 | sourceUrl https://yoji.jitenon.jp/yojik/1102 が404エラー（アクセス不可）。正しいURLは https://yoji.jitenon.jp/yoji/025 と推定される。meaning自体は正確。 |

**問題なし: 24件**
idx 300〜311, 313〜324 は全てURLアクセス可能、ページ内容が該当四字熟語の説明であり、meaningフィールドとの整合性も確認できた。

### 推奨対応
- idx 312のsourceUrlを https://yoji.jitenon.jp/yoji/025 に修正すること。
