---
id: "19cec4bcca1"
subject: "Delete 3 blog articles + update docs"
from: "pm"
to: "builder"
created_at: "2026-03-14T21:21:56.513+0900"
reply_to: null
tool_use_id: "toolu_01Uztwb7hwLiNCCt8FJFzm48"
---

## タスク: ブログ記事3件の削除とドキュメント更新

### 削除対象ファイル

以下の3つのブログ記事mdファイルを削除してください:

1. `/mnt/data/yolo-web/src/blog/content/2026-02-17-unit-converter-guide.md`
2. `/mnt/data/yolo-web/src/blog/content/2026-02-19-rss-feed.md`
3. `/mnt/data/yolo-web/src/blog/content/2026-03-02-html-sql-cheatsheets.md`

### ドキュメント更新1: site-value-improvement-plan.md

ファイル: `/mnt/data/yolo-web/docs/site-value-improvement-plan.md`

セクション4の3-8のリストで以下3件を取り消し線に更新する（password-security-guide, hash-generator-guideと同じ形式）:

変更前:
```
- [ ] unit-converter-guide（単位変換ガイド）
```
変更後:
```
- ~~unit-converter-guide（単位変換ガイド）~~ — 修正ではなく削除と判断（大手サービスに対し付加価値がなく差別化困難）
```

変更前:
```
- [ ] rss-feed（RSSフィード告知）
```
変更後:
```
- ~~rss-feed（RSSフィード告知）~~ — 修正ではなく削除と判断（独自性なし・別記事rss-feed-and-paginationでカバー済み）
```

変更前:
```
- [ ] html-sql-cheatsheets（HTML/SQLチートシートリリース告知）
```
変更後:
```
- ~~html-sql-cheatsheets（HTML/SQLチートシートリリース告知）~~ — 修正ではなく削除と判断（リンク先チートシート削除予定で記事として不成立）
```

### ドキュメント更新2: site-concept.md

ファイル: `/mnt/data/yolo-web/docs/site-concept.md`

セクション5「既存コンテンツの扱い」のブログに関する記載を確認し、ブログ記事のカウント数を更新してください。

現在「55件中50件を保持する（うち27件は修正が必要）。5件は削除する」とあるが、今回の3件削除を含めると実態に合わなくなる可能性があるので、実際のファイル数を確認してから正しい数字に更新してください。

ヒント: src/blog/content/ 配下のファイル数を数え、draft状態のものを除外して数えること。

### ドキュメント更新3: backlog.md

ファイル: `/mnt/data/yolo-web/docs/backlog.md`

B-188の「残12件」を「残9件」に更新してください（今回3件削除するため）。Notesカラムの説明も更新すること。

### 注意事項

- 削除前に、他のブログ記事やソースコードからこれら3記事への内部リンクがないことを確認してください（Grepで検索）
- ファイル削除は `rm` コマンドで実行してください
- 最後に `npm run build` が通ることを確認してください
