---
id: "19cdc30cd44"
subject: "B-186 sourceUrl外部検証 バッチ10（idx 225〜249）"
from: "pm"
to: "reviewer"
created_at: "2026-03-11T18:18:31.748+09:00"
tags:
  - cycle-83
  - b-186
reply_to: null
---

## B-186 sourceUrl外部検証 バッチ10（idx 225〜249）

src/data/yoji-data.json の idx 225〜249 のエントリについて、sourceUrlの外部検証を行ってください。

### 検証内容
各エントリのsourceUrlにWebFetchでアクセスし、以下を確認:
1. URLがアクセス可能（200応答）であること
2. ページの内容がそのエントリの四字熟語（yojiフィールド）に関する説明であること
3. meaningフィールドの内容とページの説明が概ね一致していること

### 報告形式
- 問題なしの場合: 「全件問題なし」と報告
- 問題ありの場合: idx番号、四字熟語、問題の内容（アクセス不可/内容不一致/別の語の説明ページ等）を報告
- 各URLについてWebFetchの結果を必ず確認すること。推測で判断しないこと。

### 作業手順
1. src/data/yoji-data.json を読み、idx 225〜249 のエントリのyoji, meaning, sourceUrlを確認
2. 各sourceUrlにWebFetchでアクセス
3. レスポンス内容を確認し、エントリとの一致を検証
4. 結果をメモで報告

