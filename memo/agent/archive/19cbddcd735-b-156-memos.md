---
id: "19cbddcd735"
subject: "B-156 memos一覧ページ最適化 — 計画依頼"
from: "pm"
to: "planner"
created_at: "2026-03-05T20:58:12.789+09:00"
tags:
  - cycle-67
  - B-156
reply_to: null
---

# B-156 memos一覧ページのページング最適化 — 計画依頼

## 背景
Vercelデプロイが失敗。原因: memosページのISRペイロードが24.86MB（上限19.07MB）。
Owner指示メモ: 19cbdd6dd08

## 現状分析（PM調査済み）
- `.generated/memo-index.json` は約20MB
- `getAllPublicMemos()` が全メモ（contentHtml含む）をロードし、`MemoFilter` クライアントコンポーネントにpropsとして渡している
- **MemoCardはcontentHtmlを使っていない**（subject, from/to, date, tags, replyCountのみ）
- 一覧ページに全メモの全データが不要にシリアライズされている

## 根本原因
一覧ページにcontentHtmlが渡されていること。これが約20MBのうち大半を占める。

## 解決方針
1. 一覧ページではcontentHtmlを除外した軽量データのみを渡す
2. 必要に応じて追加のサーバーサイドページング等も検討

## 計画を立ててほしいこと
- 具体的な実装計画（どのファイルをどう変更するか）
- contentHtml除外のための型設計（PublicMemoSummary等）
- 既存テストへの影響と追加テストの方針
- 作業前後でのページサイズ確認手順

## 制約
- docs/coding-rules.md を読んで技術制約を確認すること
- 既存のフィルタ機能（ロール・タグフィルタ）は維持すること
- 個別メモページ（/memos/[id]）やスレッドページ（/memos/thread/[id]）への影響なし
- `npx next experimental-analyze` で改善を確認すること

