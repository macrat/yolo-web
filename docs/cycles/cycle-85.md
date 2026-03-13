---
id: 85
description: ブログ記事修正3件（B-188継続）— irodori-and-kanji-expansion, dark-mode-toggle, site-search-feature
started_at: "2026-03-13T08:59:41+0900"
completed_at: null
---

# サイクル-85

このサイクルでは、フェーズ3-D B-188のブログ記事修正を継続する（1サイクル3記事上限）。

当初はツールガイド記事3件（character-counting-guide, cron-parser-guide, hash-generator-guide）を選定したが、調査の結果ツールがまだ削除されておらず主要な修正が実施不可であることが判明。ツール削除に依存しない以下の3記事に変更した（経緯メモ: 19ce488d79b）。

## 実施する作業

### 記事1: irodori-and-kanji-expansion

- [ ] フロントマター修正（trust_level追加、updated_at更新）
- [ ] 漢字データ拡充セクション末尾にAdmonitionで「その後常用漢字2,136字まで拡充済み」と追記
- [ ] 「今後の展望」の漢字拡充項目にAdmonitionで実現済みである旨を追記
- [ ] 計画メモ: 19ce48f4f02、レビューメモ: 19ce4914920

### 記事2: dark-mode-toggle

- [ ] フロントマター修正（trust_level追加、updated_atフォーマット修正）
- [ ] CSSメディアクエリ移行セクションの記述を時点の明示で明確化（1ファイルのみの乖離のためA案で対応）
- [ ] 計画メモ: 19ce48f0a4f、レビューメモ: 19ce490fa92

### 記事3: site-search-feature

- [ ] Route Handler / force-static、「500件」等の記述は公開日時点の状況として正確（git log確認済み: 19ce49662ae）。当時の状況は変更せず、必要に応じて追記で現在の状況を補足
- [ ] 「今後の改善」から実装済みのテキストハイライトを削除
- [ ] ファジー検索セクションの追記（冒頭の約束の回収）
- [ ] updated_at更新
- [ ] 計画メモ: 19ce48f34a5、レビューメモ: 19ce490df78、追加調査メモ: 19ce49662ae

### その他

- [ ] backlog B-134のステータスを実装済みに更新（queued→Done）

## レビュー結果

（作業完了後に記載）

## キャリーオーバー

（サイクル完了時に記載）

## 補足事項

- ツールガイド記事7件（character-counting, web-developer-tools, password-security, cron-parser, hash-generator, json-formatter, regex-tester）の本格修正はPhase 4でのツール削除後に実施する
- Owner指示: 記事の記述は公開日時点のサイト状況を尊重し、追記で補足する。修正の目的は読者への価値提供向上

## サイクル終了時のチェックリスト

- [ ] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [ ] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [ ] `npm run memo -- list --state inbox,active` を実行して、未処理のメモがない。
- [ ] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [ ] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [ ] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [ ] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [ ] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。
