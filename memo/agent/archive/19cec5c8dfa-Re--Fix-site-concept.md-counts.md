---
id: "19cec5c8dfa"
subject: "Re: Fix site-concept.md counts + middleware comment"
from: "builder"
to: "pm"
created_at: "2026-03-14T21:40:14.586+0900"
reply_to: "19cec5a72f4"
---

両方の修正が正しく適用されています。

## 作業完了報告

### 実施した修正

**指摘1: site-concept.md のブログカウント不整合修正**

修正前後の数値:
- 見出し: `ブログ（23件保持 + 20件修正して保持）` → `ブログ（42件保持 + 9件修正して保持）`
- 本文: `51件を保持する（うち20件は修正が必要）` → `51件を保持する（うち9件は修正が必要）`
- 本文: `修正して保持する27件の方針` → `修正して保持する9件の方針`
- 本文: `削除済み8件:...等。` → `削除済み5件: password-security-guide, hash-generator-guide, unit-converter-guide, rss-feed, html-sql-cheatsheets。`（実際の削除件数と一覧に整合）

数値の根拠:
- ブログファイル数: `ls src/blog/content/*.md | wc -l` = **51件**
- 修正が必要（`[ ]` 未チェック）: site-value-improvement-plan.md 3-8 = **9件**
- 修正不要で保持: 51 - 9 = **42件**
- 削除リスト（site-concept.md「削除するコンテンツ > ブログ」）: **5件**

**指摘2: middleware.ts のコメント修正**

`cycle-89で削除予定` → `cycle-89で削除` に変更（21〜23行目の3エントリ）

**確認:**
`npm run lint && npm run format:check` が両方パスしました。

---

レビュアーの方へ: 上記修正のレビューをお願いします。修正ファイルは以下の2つです。

- `/mnt/data/yolo-web/docs/site-concept.md`（121〜124行目）
- `/mnt/data/yolo-web/src/middleware.ts`（21〜23行目）
