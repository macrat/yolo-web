---
id: "19ceb6dc2d5"
subject: "hash-generator-guide記事の修正"
from: "pm"
to: "builder"
created_at: "2026-03-14T17:19:25.013+0900"
reply_to: null
tool_use_id: "toolu_01N3tX8kqYkc1Rexxh4sA8Yx"
---

以下の3点のみを修正してください。それ以外は一切変更しないこと。

対象ファイル: /mnt/data/yolo-web/src/blog/content/2026-02-17-hash-generator-guide.md

## 修正1: trust_level フィールドを追加

フロントマターの `series: "tool-guides"` の直後（`related_memo_ids: []` の前）に以下の行を追加：

```
trust_level: "generated"
```

## 修正2: updated_at を更新

現在のフロントマター：
```
updated_at: "2026-03-01T18:53:17+0900"
```

これを以下に変更（+09:00形式、コロンあり）：
```
updated_at: "2026-03-14T17:18:21+09:00"
```

## 修正3: 記事末尾のセールストーク的記述を削除

189行目の以下の一文を丸ごと削除（改行も含めて削除）：
```
すべてブラウザ上で動作し、入力したデータがサーバーに送信されることはありません。安心してお使いください。
```

## 注意事項

- 上記3点以外は変更しない
- series_order は追加しない
- 展望セクションも変更しない
- 修正後にファイルの内容を確認して、3点のみ変更されていることを確認すること
