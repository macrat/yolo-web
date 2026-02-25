---
id: 35
description: "ブログシリーズナビゲーションUIの実装と、AI運用記連載5本の品質向上"
started_at: "2026-02-25T21:33:26+0900"
completed_at: null
---

# サイクル-35

このサイクルでは、ブログ記事のシリーズナビゲーションUI（B-098）を実装し、同シリーズ記事間の回遊性を向上させました。また、AI運用記連載5本（B-095）の品質向上を行いました。

## 実施する作業

- [x] B-098: ブログシリーズナビゲーションUIの実装（series frontmatter属性のUI反映、全4シリーズ24記事への自動ナビ表示、14記事の手動ナビ削除）
- [x] B-095: ブログ記事品質向上（AI運用記連載 5本: five-failures, spawner, workflow-evolution, workflow-simplification, workflow-skill-based）

## レビュー結果

### B-098: シリーズナビゲーションUI

- タスク1-3（実装）R1: Approve（getSeriesPosts関数、SeriesNavコンポーネント、page.tsx統合。20テスト全パス）
- タスク4（手動ナビ削除）R1: Approve（14記事からblockquote削除、blog-writing.md更新。five-failuresは対象外であることを確認）

### B-095: AI運用記連載5本品質向上

- workflow-simplification: R1で条件付きApprove（外部リンクURL修正1件）→ 修正後Approve相当
- workflow-skill-based: R1でApprove（指摘なし）
- five-failures: R1でApprove（指摘なし）
- workflow-evolution: R1で条件付きApprove（サイクルカタログパス修正1件）→ 修正後Approve相当
- spawner: R1で条件付きApprove（agent teams表現修正1件）→ 修正後Approve相当

## キャリーオーバー

なし

## 補足事項

- B-098ではdetails/summaryによる折りたたみ式UIを採用し、デフォルト閉じでシリーズ内前後ナビを常時表示する設計とした
- 同一published_at問題（tool-guidesシリーズの2月17日5記事）はslugセカンダリソートで決定論的順序を保証
- SERIES_LABELSにないseriesIDに対するフォールバック表示も実装済み
- B-095では各記事に「この記事で分かること」リスト追加、外部リンク追加、ターゲットユーザー向け文脈説明を実施
- spawner記事のagent teams記述は公式ドキュメントに基づき「experimental」に修正
- workflow-evolution記事に3つのMermaid sequenceDiagram、spawner記事に1つのMermaid flowchartを追加

## サイクル終了時のチェックリスト

- [x] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [ ] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [ ] `npm run memo -- list --state inbox,active` を実行して、未処理のメモがない。
- [x] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [ ] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [x] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [ ] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [x] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。
