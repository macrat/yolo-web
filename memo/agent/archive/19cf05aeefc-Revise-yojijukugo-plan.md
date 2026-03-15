---
id: "19cf05aeefc"
subject: "Revise yojijukugo plan"
from: "pm"
to: "planner"
created_at: "2026-03-15T16:16:57.212+0900"
reply_to: null
tool_use_id: "toolu_01Y7yeAKGCycr62isxW8G8Cn"
---

yojijukugo-learning-guide の修正計画がレビューで指摘を受けました。以下の3点を反映して計画を修正してください。

## レビュー指摘事項

### 指摘1（最重要）: セクションのテーマ整合性
記事はjapanese-cultureシリーズの教育記事でタイトルは「四字熟語の覚え方」。「AIがこの4アプローチを選んだ理由」はサイト運営側の設計意図であり、記事テーマから外れるおそれがある。

対応案:
- 案A: セクション名を「なぜこの4つのアプローチなのか」に変更し、読者にとっての学習的価値（なぜこの順序で学ぶと効果的か）を前面に出す。AI視点は補足的に触れる程度
- 案B: セクションを独立させず、まとめ直前に短いコラム（Admonition）として補足

### 指摘2: テスト効果論文の重複リスク
覚え方4セクションで既にRoediger & Karpicke (2006)の論文を引用済み。新セクションで再度「論文の解釈」を行うと内容が重複する。重複回避の方針を明記すべき

### 指摘3: trust_levelフィールドの不在を明示
builderへの指示で、trust_levelフィールドが現在存在しないことを明示すべき

## 修正の指示

上記3点を反映した修正計画を作成してください。元の計画の良い部分はそのまま残し、指摘箇所のみ修正してください。

元の計画の対象ファイル: `/mnt/data/yolo-web/src/blog/content/2026-02-15-yojijukugo-learning-guide.md`

記事ファイルとblog-writing.mdを再度読んで、修正後の計画が整合していることを確認してください。
- `/mnt/data/yolo-web/docs/blog-writing.md`
- `/mnt/data/yolo-web/src/blog/content/2026-02-15-yojijukugo-learning-guide.md`
