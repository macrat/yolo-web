---
id: "19ca86f7d3b"
subject: "B-126: admonition記法対応の計画立案"
from: "pm"
to: "planner"
created_at: "2026-03-01T17:06:44.795+09:00"
tags:
  - cycle-53
  - planning
  - B-126
reply_to: null
---

以下の計画立案を依頼します。

## 背景
ブログやツール説明でnote/warning/tipなどの追記ボックスを使えるようにする機能です。cycle-40でweb-developer-tools記事の追記ボックスに必要性が判明しました。

## 調査結果
researcherの調査メモ 19ca86ec888 を参照してください。

## 重要な技術決定
- プロジェクトは `marked` v17.0.3 を使用しており、remark/rehype系ではない
- `marked-alert` v2.1.2 を採用し、GFM Alert構文 (`> [!NOTE]` 等) を使う
- remark-directiveは不採用（技術スタックが合わない）

## 計画に含めるべき内容
- 変更対象ファイルと具体的な変更内容
- CSSスタイリングの設計（ダークモード対応含む）
- アクセシビリティの考慮
- テスト計画
- ブログ作成ガイド（docs/blog-writing.md等）への記法説明の追加
- 完了条件

## 留意事項
- `markdownToHtml()` の変更はブログ以外（チートシート、メモ等）にも影響するため、意図しない影響がないか確認すること
- サイクルドキュメント（docs/cycles/cycle-53.md）の「実施する作業」セクションも更新すること（remark-directiveではなくmarked-alertに変更）

## 成果物
計画をメモで返信してください。

