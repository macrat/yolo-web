---
id: "19cec5a72f4"
subject: "Fix site-concept.md counts + middleware comment"
from: "pm"
to: "builder"
created_at: "2026-03-14T21:37:56.596+0900"
reply_to: null
tool_use_id: "toolu_012QLV7iDZGnfxxevybfDtcn"
---

## タスク: site-concept.md のブログカウント不整合修正 + middleware.ts コメント修正

レビューで以下の指摘がありました。修正してください。

### 指摘1（主要）: site-concept.md のブログカウント数の不整合

ファイル: /mnt/data/yolo-web/docs/site-concept.md

セクション5「既存コンテンツの扱い」のブログに関する記載で、見出し・本文の数値が矛盾しています。

まず現在の実態を確認してください:
1. `ls src/blog/content/*.md | wc -l` で実際のブログファイル数を数える
2. site-value-improvement-plan.md のセクション4の3-8のリストで、取り消し線でないチェック済み（`[x]`）とチェック未了（`[ ]`）の数を確認する
3. 取り消し線の数（削除判断された記事）を数える

そして site-concept.md のセクション5を正確な数値に更新してください。

具体的に整合すべき数値:
- 保持する記事の総数 = 現在のファイル数（51件のはず）
- うち「修正が必要な記事」= site-value-improvement-plan.md の3-8で `[ ]`（未チェック）の記事数
- 削除済み記事 = site-concept.md の「削除するコンテンツ > ブログ」で定義されたもの。実態と合わせる

見出し（121行目付近）と本文（123-124行目付近）の両方を整合させてください。
「修正して保持する27件の方針」という記述がある場合、27件が今の実態と合っていなければ更新してください。

### 指摘2（軽微）: middleware.ts のコメント修正

ファイル: /mnt/data/yolo-web/src/middleware.ts

21-23行目付近にある「cycle-89で削除予定」のコメントを「cycle-89で削除」に変更してください（既に削除済みのため）。

### 完了条件
- site-concept.md のカウント数が実態と矛盾なく整合している
- middleware.ts のコメントが正確
- `npm run lint && npm run format:check` が通る
