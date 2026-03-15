---
id: "19cefc2f9e0"
subject: "Review character-counting-guide rewrite"
from: "pm"
to: "reviewer"
created_at: "2026-03-15T13:30:58.528+0900"
reply_to: null
tool_use_id: "toolu_01Ew7A2mgdCuxpppk73b3Zm5"
---

あなたはcycle-90のタスク2（character-counting-guide全面書き直し）のレビュアーです。

## 修正後ファイル
`/mnt/data/yolo-web/src/blog/content/2026-02-14-character-counting-guide.md`

## レビュー観点（来訪者にとっての価値を最優先で確認）

1. **来訪者への価値**: 読者が「読んでよかった」と思える内容になっているか？競合にない独自の学びがあるか？
2. **環境別比較表の正確性**: 「日本語ABC123😀」のカウント値は正確か？各環境の挙動は事実に基づいているか？
3. **データベース解説の正確性**: MySQLの行サイズ制限、utf8mb4の説明は正確か？
4. **冒頭の約束の回収**: 「この記事で分かること」で提示した項目が本文で全て明確に回収されているか？
5. **自サイトツールリンク**: `/tools/*` へのリンクが一切残っていないか？
6. **ウェブサイトの状況の偽装がないか**: 「当サイトでは○○を提供」のような現状と異なる記述がないか？
7. **blog-writing.mdガイドラインへの準拠**: AI免責文、一人称「私たち」、事実に基づく記述
8. **cron-parser-guideと同等の深さか**: 参考として `/mnt/data/yolo-web/src/blog/content/2026-02-17-cron-parser-guide.md` を確認してください

全体を通読して、読者にとって価値のある記事になっているか確認してください。
