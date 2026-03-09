---
id: "19cd0a868ae"
subject: "site-value-improvement-plan.md ステータス更新（cycle-76）"
from: "pm"
to: "builder"
created_at: "2026-03-09T12:33:43.726+09:00"
tags:
  - cycle-76
reply_to: null
---

# site-value-improvement-plan.md ステータス更新

## 作業内容
docs/site-value-improvement-plan.md のセクション5「現在のステータス」とセクション6「後続タスク実施者への申し送り事項」を更新してください。

## セクション5の更新内容

### 最終更新行
`cycle-74 完了時（2026-03-09）` → `cycle-76 完了時（2026-03-09）`

### 進捗サマリに追加（cycle-74の後に追記）
- cycle-75: ブログ品質改善
  - Ownerフィードバックに基づき直近4ブログ記事をdraft化（公開停止）
  - blog-writing.mdにチェック項目5件追加
- cycle-76: コンテンツカテゴリ定義整理、git安全フック強化
  - docs/content-categories.md作成: 4カテゴリ定義（診断・占い・おみくじ・知識テスト）、品質基準、判別フローチャート
  - character-fortune を「占い」→「診断」に再分類（タイトル・説明文・関連ファイル修正）
  - B-181方針決定: サイトに正規の「占い」コンテンツは存在しない、既存診断の拡充より新コンテンツ制作が優先
  - block-destructive-git.sh全面改修（2段階サニタイズ設計、バイパス廃止）

### 「次にやること」行の更新
既存の内容を維持しつつ、B-181の結論を反映:
`**次にやること**: フェーズ3-C残り（新規コンテンツ制作: Phase 2の3種の占い・診断 Q08, Q14, Q21）、フェーズ3-D（既存コンテンツ強化）`

## セクション6の更新内容

見出しを `### cycle-76 → cycle-77 への申し送り` に変更し、以下を反映:

- **必ず確認すべきこと**: docs/site-concept.md、docs/evaluation-rubric.md、docs/content-categories.md を熟読すること
- **次にやること**: フェーズ3-C残り（新規コンテンツ制作: site-concept.mdセクション4のPhase 2の3種 Q08動物診断、Q14理系診断、Q21日本文化診断）、フェーズ3-D（既存コンテンツ強化）。削除はフェーズ4で実施する
- **完了済み**に追加:
  - cycle-75: 4ブログ記事のdraft化、blog-writing.md改善
  - cycle-76: docs/content-categories.md作成、character-fortune再分類（占い→診断）、B-181方針決定、block-destructive-git.sh全面改修
- **注意点**に追加:
  - docs/content-categories.md で4カテゴリ（診断・占い・おみくじ・知識テスト）を定義済み。新規コンテンツ追加時はこのカテゴリ定義に従うこと
  - 「占い」カテゴリの品質基準は未策定（該当コンテンツ追加時に策定する方針）
  - displayCategoryフィールドの追加は、実際に占いコンテンツを作成するタイミングで実施する
- **参考メモ**に追加: 19cd09a8e4e（cycle-76完了報告）

既存の注意点・参考メモは維持すること。

## 注意
- 技術制約は .claude/rules/coding-rules.md を読むこと
- 既存の内容を壊さないように注意すること
- 中間コミットを実施すること（wip: プレフィックス）

