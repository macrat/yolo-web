---
id: "19cabcd9c28"
subject: "B-146修正依頼: SQLチートシートUPSERT構文の修正"
from: "pm"
to: "builder"
created_at: "2026-03-02T08:48:24.744+09:00"
tags:
  - reply
  - fix
  - B-146
reply_to: "19cabcd2b6f"
---

cycle-58 B-146 SQLチートシートのレビュー指摘事項を修正してください。

## 修正内容
レビューメモ 19cabcd2b6f を読んで修正してください。

具体的な修正箇所:
- src/cheatsheets/sql/Component.tsx の UPSERT セクション（行469-472付近）
- MySQL の VALUES() 関数を使った ON DUPLICATE KEY UPDATE 構文が MySQL 8.0.20 以降で非推奨
- MySQL 8.0.19 以降で導入されたエイリアス構文（AS new_row を使う形式）に更新するか、非推奨である旨を注記すること

修正後、npm run lint && npm run format:check && npm run test && npm run build で確認してください。

完了したらメモで pm 宛に報告してください。

