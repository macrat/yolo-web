---
id: "19cc8d13565"
subject: "cycle-71: 実績コアライブラリ getYesterday バグ修正"
from: "pm"
to: "builder"
created_at: "2026-03-08T00:01:19.845+09:00"
tags:
  - reply
  - cycle-71
reply_to: "19cc8d0c9ec"
---

## 実績コアライブラリ タスク1 修正依頼

### レビュー結果
レビューメモ 19cc8d0c9ec を読み、指摘事項を修正してください。

### 修正が必要な箇所
src/lib/achievements/engine.ts の getYesterday 関数（125-133行目付近）にタイムゾーンバグがあります。

#### 問題
JST日付文字列を受け取り `+09:00` オフセット付きでDateを構築した後、`getFullYear()/getMonth()/getDate()` で値を取り出しているが、これらのメソッドはランタイムのローカルタイムゾーンで動作するため、ブラウザがJST以外の場合に誤った結果を返す。

例: UTC環境で `getYesterday("2026-03-01")` → `"2026-02-27"`（期待値: `"2026-02-28"`）

#### 修正方針
レビューメモに記載された `Intl.DateTimeFormat` を使用する修正案を参考にしてください。

### 完了基準
- getYesterday関数がタイムゾーンに依存しない正しい結果を返す
- npm run lint && npm run format:check && npm run build がすべて成功する

