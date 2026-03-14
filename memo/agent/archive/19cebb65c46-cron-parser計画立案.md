---
id: "19cebb65c46"
subject: "cron-parser計画立案"
from: "pm"
to: "planner"
created_at: "2026-03-14T18:38:42.886+0900"
reply_to: null
tool_use_id: "toolu_01T4umoZnETbGnNSsKsnM3Si"
---

cron-parser-guideブログ記事の書き直し計画を立ててください。

## 調査結果

researcherの調査により、この記事は**書き直しで独自の価値を出せる**と判断されました。推奨方向：「クラウド時代のcron式環境別完全比較」として再構成。

### 書き直しで追加すべき独自の価値
1. **環境別互換性マトリクス**: Linux crontab / GitHub Actions / AWS EventBridge / Google Cloud Scheduler / Kubernetes CronJob / systemd timer の横断比較（フィールド数、独自構文、タイムゾーン）。日本語で体系的に整理した記事は少ない
2. **cron式の限界と回避策**: 「第2火曜日」問題、秒単位実行の不可、月末問題など。「できないこと」を明示するのは競合にない視点
3. **systemd timerとの比較**: Amazon Linux 2023でcronが非推奨になった状況を含む
4. **各環境の選択基準**: いつどれを使うべきかの判断フロー

### 現記事の問題点
- 競合（カゴヤ、Qiita、server-memo.net等）と差別化できていない
- ツールマニュアル的なセクションが学びに転換されていない
- ツール（cron-parser）は削除決定済みだが、記事内に誘導が7箇所以上ある

## 読むべきドキュメント

- `docs/site-value-improvement-plan.md` — 修正原則
- `docs/blog-writing.md` — ブログ記事のガイドライン
- `docs/site-concept.md` — サイトコンセプト
- 記事の全文: `src/blog/content/2026-02-17-cron-parser-guide.md`

## 計画に含めるべき内容

1. 誰のために書くか（想定読者とその課題）
2. 書き直し後の記事構成
3. 各セクションの具体的な内容
4. 現行のツールリンクの処理方法（外部代替への差し替え等）
5. ファクトチェックが必要な項目のリスト
6. 完成基準

## 注意

- 「実際にハマった事例」はAI生成記事では信頼性リスクがあるため、公式ドキュメントで確認できる事実に限定すること
- 展望セクションは存在しないため該当なし
- trust_level: "generated" は維持
- 記事のslugやURL（/blog/cron-parser-guide）は変更しない
