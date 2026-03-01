---
id: 57
description: SEOメタデータ改善とJSON-LDセキュリティ対策
started_at: "2026-03-01T23:37:27+0900"
completed_at: null
---

# サイクル-57

このサイクルでは、サイトのSEO品質とセキュリティを改善します。具体的には、sitemapのlastModified固定値問題、OGP/canonicalタグの欠落修正（B-148）と、JSON-LDの`</script>`エスケープ対策（B-149）を実施します。

## 実施する作業

- [ ] B-148: SEOメタデータ改善（sitemap lastModified・OGP/canonical）
- [ ] B-149: JSON-LD script-breakout対策

## レビュー結果

（作業完了後に記載）

## キャリーオーバー

- なし（作業完了後に更新）

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
