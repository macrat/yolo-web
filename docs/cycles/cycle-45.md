---
id: 45
description: コンテンツ信頼レベルのUI実装（B-099 Phase 2）。Phase 1で策定した分類ルールに基づき、各Meta型にtrustLevel属性を追加し、ページ上に信頼レベルバッジを表示する。
started_at: "2026-02-27T22:34:39+0900"
completed_at: null
---

# サイクル-45

このサイクルでは、cycle-44で策定したコンテンツ信頼レベル分類ルール（docs/content-trust-levels.md）に基づき、UIに信頼レベル表示を実装する。各コンテンツのMeta型にtrustLevel属性を追加し、ページヘッダー付近に信頼レベルバッジを表示する。constitution Rule 3の実質化を目指す。

## 実施する作業

- [x] 共通型定義の作成（src/lib/trust-levels.ts）
- [x] 各Meta型へのtrustLevel属性追加（ToolMeta, GameMeta, QuizMeta, CheatsheetMeta, BlogPostMeta）
- [x] 各コンテンツの定義ファイルにtrustLevelの値を設定
- [x] 信頼レベルバッジUIコンポーネントの作成（TrustLevelBadge）
- [x] 各ページレイアウトへのバッジ組み込み（ツール、ゲーム、クイズ、チートシート、ブログ、辞典、伝統色、Aboutページ、メモアーカイブ）
- [x] 混在ケースの補足注記表示対応（ゲームのtrustNote、クイズのtrustNote）
- [x] レビュー・修正

## レビュー結果

レビュー1回で承認（APPROVE）。軽微な改善提案2点あり（非ブロッカー）:

1. 辞典ページでDICTIONARY_TRUST_LEVELS定数を参照せずハードコードしている点（値は正しいため機能上問題なし）
2. STATIC_PAGE_TRUST_LEVELSのインデックスアクセスの型安全性（noUncheckedIndexedAccess有効化時のリスク、現状は問題なし）

関連メモ: 19c9ff453ec

## キャリーオーバー

なし

## 補足事項

- Phase 1ドキュメント: docs/content-trust-levels.md
- 推奨方針A（型安全アプローチ）を採用
- Backlog ID: B-137

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
