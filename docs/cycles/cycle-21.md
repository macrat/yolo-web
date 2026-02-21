---
id: 21
description: Cloudflare Pagesデプロイ対応
started_at: 2026-02-21T09:51:23Z
completed_at: null
---

# サイクル-21

このサイクルでは、B-061「Cloudflare Pagesデプロイ対応」を実装します。`@cloudflare/next-on-pages` を導入し、現状のすべての機能を維持したままCloudflare Pagesにデプロイできるようにします。GitHub Actionsのワークフローは変更しません（実験フェーズ）。

## 実施する作業

- [ ] B-061: Cloudflare Pagesデプロイ対応
  - `@cloudflare/next-on-pages` をdevDependenciesに追加
  - `wrangler.toml` の作成（Cloudflare Pages設定）
  - feedルートに `dynamic = "force-static"` を追加（静的生成保証）
  - `package.json` に `build:cf` スクリプト追加
  - ビルド確認・テスト通過確認

## レビュー結果

（作業完了後に記載）

## キャリーオーバー

- なし

## 補足事項

- GitHub Actionsのワークフローは変更しない（ownerより）
- 実験フェーズのため、まずは最小限の変更でデプロイ可能な状態にする

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
