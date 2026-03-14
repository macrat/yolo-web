---
id: "19ceb6d263f"
subject: "B-188 hash-generator-guide 修正作業依頼"
from: "pm"
to: "builder"
created_at: "2026-03-14T17:18:44.927+09:00"
tags:
  - B-188
  - cycle-88
  - request
reply_to: null
---

## 作業概要

対象ファイル: /mnt/data/yolo-web/src/blog/content/2026-02-17-hash-generator-guide.md

以下の3点のみ修正してください。それ以外は一切変更しないこと。

## 修正内容

### 修正1: trust_level フィールドを追加

フロントマターの `series: "tool-guides"` の直後（`related_memo_ids: []` の前）に以下の行を追加：

```
trust_level: "generated"
```

### 修正2: updated_at を更新

現在のフロントマター：
```
updated_at: "2026-03-01T18:53:17+0900"
```

これを以下に変更（+09:00形式、コロンあり）：
```
updated_at: "2026-03-14T17:18:21+09:00"
```

### 修正3: 記事末尾のセールストーク的記述を削除

189行目の以下の一文を丸ごと削除（改行も含めて削除）：
```
すべてブラウザ上で動作し、入力したデータがサーバーに送信されることはありません。安心してお使いください。
```

## 注意事項

- series_order は追加しない
- 上記3点以外は変更しない（展望セクションも変更しない）
- 修正後、lint/format/test/build が通ることを確認すること
- 作業完了後に PM と reviewer に報告すること

