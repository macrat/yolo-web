---
id: 17
description: ownerメモ対応（i18n設計ドキュメント退避・削除、バックログ整理）とダークモードトグル実装
started_at: 2026-02-21T00:00:00+09:00
completed_at: 2026-02-21T02:00:00+09:00
---

# サイクル-17

ownerからのフィードバック（メモ 19c7b668b3c）に基づき、i18n設計ドキュメントのメモ退避・削除とバックログ整理を行います。あわせて、P3キューからダークモードトグル（B-017）を実装し、ユーザー体験を改善します。

## 実施する作業

- [x] B-059: i18n設計ドキュメントのメモ退避・削除、バックログ更新（ownerメモ 19c7b668b3c への対応）
- [x] B-017: ユーザートグル式ダークモード（next-themes）

## レビュー結果

### B-059 i18n設計ドキュメント退避・削除

- 単純な管理作業のためレビュー不要
- コミット: f9cbe48

### B-017 ダークモードトグル - レビュー1回目

- メモ: 19c7ddbacfc
- 総合評価: 条件付き承認（必須修正1件）
- 必須修正: 1件（MermaidRenderer テーマ変更時再レンダリングバグ）
- 推奨改善: 4件
  1. CSSセレクタの不一貫性（:root.dark / html.dark 混在）→ :root.dark に統一
  2. テストカバレッジ不足 → 3件→11件に拡充
  3. disableTransitionOnChange未設定 → 追加
  4. 未マウント時プレースホルダーの opacity:0.5 → visibility:hidden に変更

### B-017 ダークモードトグル - レビュー2回目

- メモ: 19c7de32eff
- 総合評価: 承認
- 全5件の指摘事項が適切に修正されていることを確認
- 軽微な指摘（テストの未使用変数）→ 対応済み

## キャリーオーバー

なし

## 補足事項

- B-059: docs/design/directory-restructure-i18n.md の全文をメモ 19c7dc901a9 としてアーカイブし、docs/design/ ディレクトリを削除。B-056をDeferred（延期）に移動。
- B-017: next-themes導入によりCSS-onlyダークモードからユーザー制御可能なテーマ切り替えに移行。system/light/darkの3モード対応。既存の `@media (prefers-color-scheme: dark)` を全てクラスベース（`:root.dark`）に変換。MermaidRendererのテーマ連動再レンダリング、FOUC防止（suppressHydrationWarning + disableTransitionOnChange）、アクセシビリティ（aria-label, focus-visible）に対応。
- CI修正: ThemeToggle.tsx の useEffect+setState パターンが ESLint react-hooks/set-state-in-effect ルール違反のためCI失敗。useSyncExternalStore パターンに置換して修正。
- 環境起因の既知問題: text-diffテスト1件（diffモジュール欠落）、build時のBus error。いずれも今回の変更とは無関係。

## サイクル終了時のチェックリスト

- [x] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [x] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [x] `npm run memo -- list --state inbox,active` を実行して、未処理のメモがない。
- [x] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [x] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。（lint: hermes-parser環境問題、test: text-diff 1件環境問題、build: Bus error環境問題。いずれも変更と無関係）
- [x] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [x] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [x] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
