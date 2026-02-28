---
id: 47
description: ゲーム・辞典のLayout共通化と品質要素追加（B-100後続）
started_at: "2026-02-28T08:17:43+0900"
completed_at: "2026-02-28T08:50:14+0900"
---

# サイクル-47

このサイクルでは、cycle-46で完成した品質要件定義（B-100）を活用し、ゲームと辞典コンテンツのLayout共通化と品質要素追加を行います。各page.tsxで個別実装されているBreadcrumb・TrustBadge・関連導線を共通Layoutコンポーネントに集約し、valueProposition・FAQ等の品質データを追加します。

## 実施する作業

- [x] B-138: ゲームLayout共通化と品質要素追加
- [x] B-139: 辞典コンテンツのLayout共通化と品質要素追加

## レビュー結果

### 計画レビュー（メモ 19ca1729aaf）

- 判定: Approve（条件付き）
- 指摘12件（必須1件、強く推奨4件、軽微/提案7件）
- 全指摘事項を実装時に対応

### 実装レビュー（メモ 19ca181c009）

- 判定: Approve
- 8つのレビュー観点（コード品質、既存パターン整合性、品質データ正確性、テスト網羅性、削除安全性、アクセシビリティ、Constitution準拠、前回指摘対応）すべてにおいて十分な品質を確認
- レビュー1回で承認

## キャリーオーバー

なし

## 補足事項

- B-138: GameLayoutコンポーネント新規作成（16テスト）、RelatedGames/RelatedBlogPostsコンポーネント追加、4ゲーム分の品質データ（valueProposition、usageExample、FAQ各3問、relatedGameSlugs）追加
- B-139: DictionaryDetailLayoutコンポーネント新規作成（10テスト）、3辞典分の品質データ（valueProposition、FAQ各3問）追加、伝統色ページのbreadcrumbJsonLd重複出力を修正
- B-140（全ツール・全チートシートへの品質データ埋め込み）はbacklogのQueuedに残存

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
