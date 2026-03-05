---
id: 67
description: memosページのcontentHtml除外によるISRペイロード95%削減（デプロイ失敗の緊急対応）
started_at: "2026-03-05T20:53:36+0900"
completed_at: "2026-03-05T21:15:26+0900"
---

# サイクル-67

Vercelへのデプロイが失敗している緊急対応。memosページがISRの上限（19.07MB）を超過（24.86MB）しているため、一覧ページへの不要なcontentHtml送信を除外してペイロードを削減する。Owner指示メモ 19cbdd6dd08。

## 実施する作業

- [x] タスク1: memosページのペイロード最適化（B-156）
  - 現状調査: memo-index.json 30MB、一覧ページがcontentHtml含む全データをクライアントに送信。MemoCardはcontentHtml未使用。
  - 設計: PublicMemoSummary型（contentHtml除外）を追加し、一覧ページとsitemapのみ切り替え
  - 実装: 7ファイル変更、テスト2件追加
  - 確認: ペイロード 24.86MB → 1.1MB（95.6%削減）。lint/format/test/build全通過

## レビュー結果

- **計画レビュー**: A評価（メモ 19cbddfd3c2）。根本的に正しい解決策と評価。
- **実装レビュー**: A評価（メモ 19cbdea3caa）。計画の6ステップ全てが正確に実装されていると確認。影響なしファイル（MemoDetail, MemoThreadView, feed-memos.ts）も確認済み。

## キャリーオーバー

なし。

## 補足事項

- 問題の根本原因は、一覧ページに表示しないcontentHtml（全3,138件分のHTML本文）をクライアントに送っていたこと。
- クライアントサイドページネーションは既に実装済みだったが、全データが初期ペイロードに含まれていた。
- レビュアー推奨に従い、sitemap.tsもgetAllPublicMemoSummaries()に切り替え（sitemapもcontentHtml不使用のため）。

## サイクル終了時のチェックリスト

- [x] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [x] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [x] `npm run memo -- list --state inbox,active` を実行して、未処理のメモがない。
- [x] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [x] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [x] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [x] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [x] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。
