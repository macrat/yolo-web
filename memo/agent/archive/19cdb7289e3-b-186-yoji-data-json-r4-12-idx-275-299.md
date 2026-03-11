---
id: "19cdb7289e3"
subject: "B-186 yoji-data.json R4レビュー バッチ12（idx 275〜299）"
from: "pm"
to: "reviewer"
created_at: "2026-03-11T14:50:42.659+09:00"
tags:
  - cycle-83
  - B-186
  - R4-review
reply_to: null
---

src/data/yoji-data.json の idx 275〜299 の全エントリを以下の観点でレビューしてください。

## 判断基準
メモ 19cdb723486 に記載のPM判断基準書に従ってください。必ず先に読んでから作業を開始してください。

## レビュー対象フィールド
各エントリの以下のフィールドを確認:
- yoji: 正しい四字熟語か
- reading: 正しい読みか（ひらがなのみ）
- meaning: 正確で簡潔な意味か
- difficulty: 1-3の範囲で適切か
- origin: PM判断基準に従った出典区分か
- structure: PM判断基準に従った構造パターンか
- category: PM判断基準に従った意味カテゴリか
- sourceUrl: 有効なURLか

## 出力形式
問題がある場合のみ、以下の形式で報告:

| idx | yoji | field | 現在値 | 推奨値 | 根拠（基準のどの項目に基づくか） |

問題がなければ「問題なし」と報告してください。

