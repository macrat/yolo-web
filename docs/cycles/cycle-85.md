---
id: 85
description: ブログ記事修正3件（B-188継続）— irodori-and-kanji-expansion, dark-mode-toggle, site-search-feature
started_at: "2026-03-13T08:59:41+0900"
completed_at: "2026-03-13T10:30:45+0900"
---

# サイクル-85

このサイクルでは、フェーズ3-D B-188のブログ記事修正を継続する（1サイクル3記事上限）。

当初はツールガイド記事3件（character-counting-guide, cron-parser-guide, hash-generator-guide）を選定したが、調査の結果ツールがまだ削除されておらず主要な修正が実施不可であることが判明。ツール削除に依存しない以下の3記事に変更した（経緯メモ: 19ce488d79b）。

## 実施する作業

### 記事1: irodori-and-kanji-expansion

- [x] フロントマター修正（trust_level追加、updated_at更新）
- [x] 漢字データ拡充セクション末尾にAdmonitionで「その後常用漢字2,136字まで拡充済み」と追記
- [x] 計画メモ: 19ce48f4f02、レビューメモ: 19ce4914920、成果物レビュー: 19ce4b6dbff

### 記事2: dark-mode-toggle

- [x] フロントマター修正（trust_level追加、updated_atフォーマット修正）
- [x] CSSメディアクエリ移行セクションの記述を時点の明示で明確化（1ファイルのみの乖離のためA案で対応）
- [x] 計画メモ: 19ce48f0a4f、レビューメモ: 19ce490fa92、成果物レビュー: 19ce4cd5a25（初回19ce4c93a30は無効→19ce4cb0a27で記録）

### 記事3: site-search-feature

- [x] Route Handler / force-static、「500件」等の記述は公開日時点の状況として正確（git log確認済み: 19ce49662ae）。当時の状況は変更せず、必要に応じて追記で現在の状況を補足
- [x] ファジー検索セクションの追記（冒頭の約束の回収）
- [x] updated_at更新
- [x] 計画メモ: 19ce48f34a5、レビューメモ: 19ce490df78、追加調査メモ: 19ce49662ae、成果物レビュー: 19ce4b6e13c

### その他

- [x] backlog B-134のステータスを実装済みに更新（queued→Done）

## レビュー結果

3記事すべてレビュー承認済み。指摘事項なし。

- irodori-and-kanji-expansion: 承認（19ce4b6dbff）
- dark-mode-toggle: 承認（19ce4cd5a25）※初回レビュー（19ce4c93a30）は外部URLアクセス制限により無効化（19ce4cb0a27）、再レビューで承認
- site-search-feature: 承認（19ce4b6e13c）

## キャリーオーバー

なし

## 補足事項

- Owner指示: 記事の記述は公開日時点のサイト状況を尊重し、追記で補足する。修正の目的は読者への価値提供向上

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
