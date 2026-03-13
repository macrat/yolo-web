---
id: "19ce7eef6af"
subject: "残ブログ記事の選定調査"
from: "pm"
to: "researcher"
created_at: "2026-03-14T01:02:03.567+0900"
reply_to: null
tool_use_id: "toolu_01NndRu6tCA8hskteYYDnk4d"
---

cycle-87でB-188ブログ記事修正の対象3件を選定するための調査を行ってください。

## 背景
- B-188はブログ記事の修正タスク（残20件、1サイクル3記事上限）
- 申し送りに「ツール削除に依存する記事群が多く残っている」とある
- ツール削除はフェーズ4で行うため、現時点ではツール削除に依存しない記事を優先すべき

## 調査内容

以下の残り記事リストについて、各記事のMDXファイルを確認し、ツール削除への依存度と修正の独立性を評価してください。

残り記事（20件）:
1. character-counting-guide
2. web-developer-tools-guide
3. password-security-guide
4. cron-parser-guide
5. hash-generator-guide
6. json-formatter-guide
7. regex-tester-guide
8. yojijukugo-learning-guide
9. unit-converter-guide
10. tools-expansion-10-to-30
11. cheatsheets-introduction
12. rss-feed
13. yoji-quiz-themes
14. kotowaza-quiz
15. game-dictionary-layout-unification
16. http-status-code-guide-for-rest-api
17. html-sql-cheatsheets
18. tool-reliability-improvements
19. kanji-kanaru-2136-expansion（新規執筆）

ブログ記事は `src/content/blog/` 配下にあります。各記事のMDXファイルを読んで、以下を判定してください：
- ツール削除（フェーズ4）に言及・依存しているか
- 記事単独で修正可能か
- 読者にとっての価値向上のポテンシャル

最終的に、ツール削除に依存せず独立して修正可能な記事3件を推薦してください。

なお、修正の原則は以下の3つです（docs/site-value-improvement-plan.md セクション4の3-8参照）：
- 当時の状況を尊重する
- 目的は読者への価値提供
- 展望セクションはそのまま維持する
