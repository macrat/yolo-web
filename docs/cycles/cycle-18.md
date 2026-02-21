---
id: 18
description: Claude Code Hook pre-push-check の作成（サイクル17再発防止策）
started_at: 2026-02-21T13:00:00+09:00
completed_at: 2026-02-21T13:30:00+09:00
---

# サイクル-18

ownerからの指示（メモ 19c7e13d377）に基づき、デプロイ前のCI失敗を防止するためのClaude Code Hook `pre-push-check` を作成します。サイクル17で「環境起因」として例外扱いされたテスト・ビルド失敗の再発を防止する仕組みです。

## 実施する作業

- [x] B-060: Claude Code Hook `pre-push-check` の作成
  - `git push` コマンドを検知して lint, format:check, test, build を実行
  - 1つでも失敗したら「Fix all issues and push again」を表示してエラー終了
  - 既存の pre-commit-check.sh のパターンを踏襲
  - `.claude/settings.json` に hook 設定を追加
  - git hooks への追加は不要（ownerの指示）

## レビュー結果

### B-060 pre-push-check hook - レビュー1回目

- メモ: 19c7e1ec66c
- 総合評価: 承認（軽微な指摘あり、対応不要）
- ownerの指示（メモ 19c7e13d377）の全要件を満たしていることを確認
- 軽微な指摘: `grep -q "git push"` パターンで echo 文中の文字列への誤検知可能性あるが、pre-commit-check.sh と同じパターンであり実害なし

## キャリーオーバー

なし

## 補足事項

- hermes-parser の壊れたモジュール問題（サイクル17で「環境起因」とされていたlint失敗）は、node_modules の再インストールで解消。
- 全チェック（lint, format:check, test 109ファイル1233テスト, build 1570ページ）がすべて通過することを確認済み。

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
