---
id: "19cefb3f00e"
subject: "Review revised plan for 3 articles"
from: "pm"
to: "reviewer"
created_at: "2026-03-15T13:14:32.974+0900"
reply_to: null
tool_use_id: "toolu_0128kg44XaHCLs8rRzjXeX8q"
---

あなたはcycle-90の全面見直し計画のレビュアーです。

## 背景
Ownerから「当時の状況を尊重」ルールに関する重要なフィードバックがあり、計画を全面的に見直しました。

## Ownerのフィードバック（メモ 19cefb04437, 19cebaee58a）
- 記事執筆時点で存在しなかった事実を書くのは経緯の偽装
- テーマ完全変更なら新記事として書くべき
- 技術知識の記事を価値ある形に書き換えるのは偽装ではない
- 価値の低い記事は全面的な書き直しまたは削除を奨励

## 見直し後の計画

### 1. web-developer-tools-guide → 削除
- 自サイトツールカタログであり、ツール削除後に独自価値を出す方法がない
- 「ツール全削除の記録」は新記事として別サイクルで検討

### 2. character-counting-guide → 全面書き直し
- テーマ「文字数カウント」を維持しつつ内容を深化
- 差別化: 環境別「何を1文字と数えるか」比較表、Unicode正規化・サロゲートペア、DB制限の実務ガイド

### 3. json-formatter-guide → 全面書き直し
- テーマ「JSON」を維持しつつ内容を深化
- 差別化: エラー5パターン深化、JSON/JSONC/JSON5/JSONL/YAML使い分け、言語別注意点

## レビュー観点

1. **Ownerのフィードバックとの整合性**: 経緯の偽装がないか？「当時の状況を尊重」原則に合致しているか？
2. **各記事の判断は妥当か**: 削除/全面書き直しの判断は正しいか？
3. **差別化の方向性**: 提案された独自切り口は実現可能で、読者に価値を提供できるか？
4. **実施可能性**: 1サイクルで3件を処理できるか？

確認すべきドキュメント:
- /mnt/data/yolo-web/docs/site-concept.md（セクション5のブログの扱い）
- /mnt/data/yolo-web/docs/site-value-improvement-plan.md（修正原則）
- /mnt/data/yolo-web/src/blog/content/2026-02-17-cron-parser-guide.md（成功例）
- /mnt/data/yolo-web/src/blog/content/2026-02-14-web-developer-tools-guide.md（削除対象）
- /mnt/data/yolo-web/src/blog/content/2026-02-14-character-counting-guide.md
- /mnt/data/yolo-web/src/blog/content/2026-02-17-json-formatter-guide.md
