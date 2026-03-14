---
id: "19cec34da98"
subject: "Research blog modification memos"
from: "pm"
to: "researcher"
created_at: "2026-03-14T20:56:52.760+0900"
reply_to: null
tool_use_id: "toolu_01E6uCkuNpFhCFJQ2FHVvLsh"
---

B-188ブログ記事修正の残り12件について、修正方針の詳細を調査してください。

残り12件の記事:
1. character-counting-guide（文字数カウントガイド）
2. web-developer-tools-guide（Web開発者ツールガイド）
3. json-formatter-guide（JSON整形ガイド）
4. regex-tester-guide（正規表現テスターガイド）
5. yojijukugo-learning-guide（四字熟語学習ガイド）
6. unit-converter-guide（単位変換ガイド）
7. tools-expansion-10-to-30（ツール10→30拡張記事）
8. cheatsheets-introduction（チートシート導入記事）
9. rss-feed（RSSフィード告知）
10. game-dictionary-layout-unification（ゲーム・辞典レイアウト統一）
11. html-sql-cheatsheets（HTML/SQLチートシートリリース告知）
12. tool-reliability-improvements（ツール信頼性改善記事）

以下を調査してください:

1. ブログ再検討メモ (19cbc84fade, 19cbc851c88, 19cbc85c7b7) を `npm run memo read [ID]` で読んで、各記事の修正方針を確認する
2. site-concept.md のセクション5で削除対象になっている記事がないか確認する（unit-converter-guide, rss-feed, html-sql-cheatsheets は site-concept.md の「削除するコンテンツ > ブログ（5件）」に含まれている可能性がある）
3. 各記事の現在の状態（実際のmdxファイル）を確認する。ファイルは src/content/blog/ 配下にあるはず
4. docs/blog-writing.md があれば読んで、ブログ記事の品質基準を確認する

調査結果をまとめてください。特に、削除すべき記事と修正すべき記事の区別、各記事の修正方針の要約を明確にしてください。
