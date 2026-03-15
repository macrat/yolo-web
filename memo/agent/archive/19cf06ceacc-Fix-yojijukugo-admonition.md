---
id: "19cf06ceacc"
subject: "Fix yojijukugo admonition"
from: "pm"
to: "builder"
created_at: "2026-03-15T16:36:35.788+0900"
reply_to: null
tool_use_id: "toolu_01RPg9WvTUELDY6mR5EBsvcs"
---

yojijukugo-learning-guide のレビューで指摘を受けました。以下の修正を行ってください。

## 対象ファイル
`/mnt/data/yolo-web/src/blog/content/2026-02-15-yojijukugo-learning-guide.md`

## 指摘事項

まとめ直前のAdmonitionコラム（`> [!NOTE]`）が約1030字あり、計画で指定された「300～500字程度」の2倍以上。さらに、コラム内の4ステップの再列挙（「まず漢字の意味を分解して理解し（覚え方1）...」）が、直後のまとめセクションの同じ説明と実質的に重複している。

## 修正方法

1. Admonitionコラムから4ステップの内容の再列挙部分を削除する
2. 「なぜこの順序なのか」という理由の説明に集中する（インプットからアウトプットへ段階的に深まる設計意図）
3. まとめセクションが直後に控えていることを前提に、重複部分を削って300～500字に圧縮する
4. AI視点の補足（「認知科学の知見を参考にしました」程度）は残す
