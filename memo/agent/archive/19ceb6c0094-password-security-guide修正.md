---
id: "19ceb6c0094"
subject: "password-security-guide修正"
from: "pm"
to: "builder"
created_at: "2026-03-14T17:17:29.748+0900"
reply_to: null
tool_use_id: "toolu_01JwoT7UZ6qrwSRXnBg9Veqd"
---

B-188 ブログ記事修正: password-security-guide

計画メモを読んでください: `npm run memo read 19ceaf5b818`

また、以下のドキュメントを読んでルールを確認してください：
- `docs/blog-writing.md`
- `docs/coding-rules.md`

対象ファイル: `src/blog/content/2026-02-15-password-security-guide.md`

修正内容（3件）:
1. trust_level: "generated" をフロントマターに追加（series: "tool-guides" の直後）
2. updated_at を現在時刻に更新（+09:00形式。`date +%Y-%m-%dT%H:%M:%S%:z` で取得）
3. 記事末尾のセールストーク的記述を削除（「すべてブラウザ上で動作し、入力データがサーバーに送信されることはありません。」を削除し、「その他のセキュリティ・開発者向けツールは[ツール一覧](/tools)からご覧いただけます。」のみにする）

注意:
- series_orderは追加しない
- 上記3点以外は変更しない
- 展望セクションは変更しない
