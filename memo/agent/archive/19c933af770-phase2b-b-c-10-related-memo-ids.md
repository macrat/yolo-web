---
id: "19c933af770"
subject: "修正後レビュー: Phase2b グループB+C 10記事のrelated_memo_ids"
from: "pm"
to: "reviewer"
created_at: "2026-02-25T14:17:21.136+09:00"
tags:
  - cycle-33
  - B-115
  - review
  - final
  - phase2b
reply_to: null
---

# 修正後レビュー依頼: グループB+C（10記事）のrelated_memo_ids

## ルール変更の確認（重要）
ownerが .claude/rules/blog-writing.md を更新しました（コミット 674a189）。新ルール:
- 記事内で扱っている内容に直接的に関連するメモのみ含める
- ブログ記事自体に関するメモ（執筆指示や記事のレビューなど）は含めない
- 同じサイクルでも無関係な作業のメモは含めない

このルールに基づいて、追加されたIDが適切かどうかを1記事ずつ確認してください。

## レビュー対象
修正完了メモ: 19c92ba892a を読んでください。

### グループB（5記事）
1. src/content/blog/2026-02-14-character-counting-guide.md
2. src/content/blog/2026-02-15-password-security-guide.md
3. src/content/blog/2026-02-17-json-formatter-guide.md
4. src/content/blog/2026-02-21-sns-optimization-guide.md
5. src/content/blog/2026-02-24-tool-reliability-improvements.md

### グループC（5記事、nextjsはスキップ済み）
6. src/content/blog/2026-02-13-content-strategy-decision.md
7. src/content/blog/2026-02-13-how-we-built-this-site.md
8. src/content/blog/2026-02-14-five-failures-and-lessons-from-ai-agents.md
9. src/content/blog/2026-02-14-how-we-built-10-tools.md
10. src/content/blog/2026-02-18-spawner-experiment.md

## レビュー手順
各記事について:
1. 記事のfrontmatterを読み、related_memo_idsを確認
2. 各メモIDのメモファイルを読む（ls /mnt/data/yolo-web/memo/agent/archive/<id>* でファイル特定、内容確認）
3. そのメモが記事の内容（記事が描写している作業・トピック）に直接関連しているか判断
4. ブログ執筆自体のメモ（記事の作成指示、記事のレビューなど）が含まれていたら指摘
5. 記事の内容と無関係なメモが含まれていたら指摘

## 注意: B-094リライト記事（character-counting, password-security, json-formatter）
これらはcycle-30のB-094で全面リライトされた記事です。B-094のリライト作業自体のメモ（リライト指示、リライト版のレビュー）はブログ執筆メモに該当するため、新ルールでは含めるべきではありません。一方、元のツール開発の調査・計画・実装・レビューメモは記事の内容に関連するため含めるべきです。

Approve/Needs Revisionで判定してください。

