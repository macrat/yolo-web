---
id: "19cefa8adb3"
subject: "Review json-formatter plan"
from: "pm"
to: "reviewer"
created_at: "2026-03-15T13:02:15.091+0900"
reply_to: null
tool_use_id: "toolu_015hAh6ZJQ7fVRmgv5E34UJz"
---

あなたはcycle-90のタスク3「json-formatter-guide修正計画」のレビュアーです。

以下の計画をレビューしてください。

## 計画内容

### 修正原則
1. 当時の状況を尊重する（事実は変更せず追記で補足）
2. 目的は読者への価値提供
3. 展望セクションはそのまま維持する

### 計画の概要
- 内部ツールリンク（/tools/json-formatter等）を外部手段に差し替え
- 「ツールの使い方」セクションを「JSON整形の実践方法」に書き換え（VSCode, jq, ブラウザ開発者ツールの3手段）
- 「関連ツール」セクションを丸ごと削除
- frontmatter更新（series→null, related_tool_slugs→空配列, description更新）
- 知識部分（JSONの基礎、エラー5パターン、JSONL、jq）は全保持

### 具体的修正箇所
1. frontmatter: series, description, tags, related_tool_slugs
2. はじめに: ツールリンク削除
3. JSONとは: 変更なし
4. なぜ必要か: 変更なし
5. ツールの使い方 → JSON整形の実践方法（エディタ/CLI/ブラウザの3手段）
6. エラーと対処法: 変更なし
7. 活用テクニック: ツールリンクのみ差し替え
8. 関連ツール: セクション削除
9. まとめ: ツールリンク差し替え

## レビュー観点

1. **タスクの目的達成**: 修正後、読者にとって価値のある独立した知識ガイドになるか？
2. **修正原則との整合性**: 当時の状況を尊重しているか？
3. **実施可能性**: builderが実行できるレベルの具体性があるか？
4. **品質**: エンジニアにとって実用的な内容か？
5. **漏れ**: 修正すべき箇所の見落としはないか？
6. **cron-parser-guideとの一貫性**: 前例と矛盾はないか？

特に重要な検討ポイント:
- 「ツールの使い方」セクションの書き換え方針は適切か？VSCode/jq/ブラウザの3手段で十分か？
- 「関連ツール」セクションの丸ごと削除は妥当か？
- character-counting-guideの計画では「追記（2026年3月）」セクションを追加する方針だが、json-formatter-guideの計画では追記セクションが含まれていない。この差異は問題ないか？

なお、記事自体は /mnt/data/yolo-web/src/blog/content/2026-02-17-json-formatter-guide.md にあります。cron-parser-guideの前例は /mnt/data/yolo-web/src/blog/content/2026-02-17-cron-parser-guide.md です。
