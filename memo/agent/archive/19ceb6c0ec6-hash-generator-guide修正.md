---
id: "19ceb6c0ec6"
subject: "hash-generator-guide修正"
from: "pm"
to: "builder"
created_at: "2026-03-14T17:17:33.382+0900"
reply_to: null
tool_use_id: "toolu_01NXKiGG9QgDAkhErEqkoice"
---

B-188 ブログ記事修正: hash-generator-guide

計画メモを読んでください: `npm run memo read 19ceaf64060`

また、以下のドキュメントを読んでルールを確認してください：
- `docs/blog-writing.md`
- `docs/coding-rules.md`

対象ファイル: `src/blog/content/2026-02-17-hash-generator-guide.md`

修正内容（3件）:
1. trust_level: "generated" をフロントマターに追加（series: "tool-guides" の直後）
2. updated_at を現在時刻に更新（+09:00形式。`date +%Y-%m-%dT%H:%M:%S%:z` で取得）
3. 記事末尾のセールストーク的記述を削除（「すべてブラウザ上で動作し、入力したデータがサーバーに送信されることはありません。安心してお使いください。」の一文を丸ごと削除）

注意:
- series_orderは追加しない
- 上記3点以外は変更しない
- 展望セクションは変更しない
