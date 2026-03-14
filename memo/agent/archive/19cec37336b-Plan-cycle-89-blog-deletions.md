---
id: "19cec37336b"
subject: "Plan cycle-89 blog deletions"
from: "pm"
to: "planner"
created_at: "2026-03-14T20:59:26.571+0900"
reply_to: null
tool_use_id: "toolu_017eGEw92bu8QHNexfZYMeNN"
---

cycle-89の実施計画を立ててください。

## サイクルの概要

B-188ブログ記事修正の一環として、site-concept.mdで削除と判断された3件のブログ記事を処理します。

## 対象記事（3件、すべて削除）

### 1. unit-converter-guide
- ファイル: /mnt/data/yolo-web/src/blog/content/2026-02-17-unit-converter-guide.md
- 削除理由: Google単位変換等に対して付加価値がなく、リライトしても差別化困難

### 2. rss-feed
- ファイル: /mnt/data/yolo-web/src/blog/content/2026-02-19-rss-feed.md
- 削除理由: 一般的なRSS解説で独自性なし。別記事（rss-feed-and-pagination）で技術内容カバー済み

### 3. html-sql-cheatsheets
- ファイル: /mnt/data/yolo-web/src/blog/content/2026-03-02-html-sql-cheatsheets.md
- 削除理由: チートシート全削除後にリリース告知記事として成立しない

## 削除処理の方針（site-concept.md セクション5「削除コンテンツの処理方針」）

- HTTPステータス 410 Gone を使用（301リダイレクトは不使用）
- 410ページには「このコンテンツは終了しました。トップページへ」のリンクを設置
- sitemap.xmlから対象URLを除外
- 410はGoogleに「意図的な削除」を明確に伝え、インデックスからの速やかな除外を促す

## 調べるべきこと

以下のファイルを読んで、既存の削除処理の実装パターンを確認してください:

1. cycle-88で削除されたpassword-security-guide, hash-generator-guideの処理方法を確認
   - `git log --oneline` で関連コミットを探す
   - 410 Goneの実装方法（Next.jsでどう実装されているか）
   - sitemapからの除外方法
2. /mnt/data/yolo-web/docs/site-value-improvement-plan.md のフェーズ3-Dセクション
3. /mnt/data/yolo-web/docs/blog-writing.md
4. 既存の410処理の実装を確認（src/app/ 配下で410を返すルートがあるはず）
5. .claude/rules/coding-rules.md を読んで技術制約を確認

## 計画に含めるべき内容

- タスク分割（記事ごとに1タスク + 共通処理1タスク）
- 各タスクの具体的な手順
- 完了条件
- 注意事項

計画書は /mnt/data/yolo-web/docs/cycles/cycle-89.md の「実施する作業」セクションを更新する形で作成してください（ただし実際のファイル編集はせず、計画内容をテキストで出力してください）。
