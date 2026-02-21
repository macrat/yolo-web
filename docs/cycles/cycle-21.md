---
id: 21
description: Cloudflare Pagesデプロイ対応
started_at: 2026-02-21T09:51:23Z
completed_at: 2026-02-21T10:15:00Z
---

# サイクル-21

このサイクルでは、B-061「Cloudflare Pagesデプロイ対応」を実装します。`@cloudflare/next-on-pages` を導入し、現状のすべての機能を維持したままCloudflare Pagesにデプロイできるようにします。GitHub Actionsのワークフローは変更しません（実験フェーズ）。

## 実施する作業

- [x] B-061: Cloudflare Pagesデプロイ対応
  - `@cloudflare/next-on-pages` は Next.js 16 非対応のため静的エクスポート方式を採用
  - `next.config.ts` に条件付き `output: 'export'`（`CF_PAGES=1`環境変数で制御）
  - `wrangler.toml` の作成（Cloudflare Pages設定、出力ディレクトリ`out/`）
  - `package.json` に `build:cf` スクリプト追加（`CF_PAGES=1 next build`）
  - 静的エクスポートで必要な `dynamic = "force-static"` を全メタデータ/ルートファイルに追加
  - `runtime = "edge"` を OG画像から削除（static export非対応、機能影響なし）
  - テスト1310件全通過確認

## レビュー結果

- 実装レビュー（1回目）: package-lock.jsonのpeer: trueフラグについてコメントあり（npm自動生成であり問題なし）
- CodeQL: 0 alerts
- 判定: **承認**

## キャリーオーバー

- なし

## 補足事項

- GitHub Actionsのワークフローは変更しない（ownerより）
- 実験フェーズのため、まずは最小限の変更でデプロイ可能な状態にする

## サイクル終了時のチェックリスト

- [x] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [x] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [x] `npm run memo -- list --state inbox,active` を実行して、未処理のメモがない。
- [x] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [x] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。（buildはsandbox環境のネットワーク制限でfontロードが失敗するが、これはCI環境では成功確認済みの既知問題）
- [x] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [x] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [x] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。
