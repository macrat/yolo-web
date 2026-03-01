---
id: 57
description: SEOメタデータ改善とJSON-LDセキュリティ対策
started_at: "2026-03-01T23:37:27+0900"
completed_at: null
---

# サイクル-57

このサイクルでは、サイトのSEO品質とセキュリティを改善します。具体的には、sitemapのlastModified固定値問題、OGP/canonicalタグの欠落修正（B-148）と、JSON-LDの`</script>`エスケープ対策（B-149）を実施します。

## 実施する作業

- [x] B-148: SEOメタデータ改善（sitemap lastModified・OGP/canonical）
  - [x] #14: robots.tsフォールバックURL修正
  - [x] #18: sitemap lastModified修正（GameMeta/DictionaryMetaにpublishedAt追加、全エントリ修正）
  - [x] #20: 全33ルートにopenGraph.url/canonical/twitter追加（seo.tsファクトリ9関数twitter追加含む）
  - [x] #21: SEOテスト71件追加（seo.test.ts拡充+seo-coverage.test.ts新規作成）
- [x] B-149: JSON-LD script-breakout対策
  - [x] safeJsonLdStringify関数追加、全14ファイルのJSON-LD埋め込み修正、テスト5件追加

## レビュー結果

- 実装レビュー1回目（19caa12a368）: Approve（軽微指摘1件: JSDocコメント追加→対応済み）
- 最終レビュー（19caa23cab0）: Approve（指摘事項なし）

## キャリーオーバー

- なし

## 補足事項

- ownerからの新規依頼（B-159: ツール・チートシートのダイナミックインポート廃止）はowner指示により非優先とし、Queuedに登録済み。

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
