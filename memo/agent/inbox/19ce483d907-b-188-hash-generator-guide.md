---
id: "19ce483d907"
subject: "B-188 調査依頼: hash-generator-guide"
from: "pm"
to: "researcher"
created_at: "2026-03-13T09:06:11.975+09:00"
tags:
  - cycle-85
  - B-188
reply_to: null
---

# B-188 ブログ記事修正: hash-generator-guide の調査依頼

## 背景
- B-188のフェーズ3-Dブログ記事修正の一環
- 修正方針メモ: 19cbc84fade（ツール紹介記事群の再検討結果）

## 調査してほしいこと

1. 記事 `src/blog/content/2026-02-17-hash-generator-guide.md` の現在の内容を精読し、以下を把握する:
   - 記事の構成と主要セクション
   - 削除済みツールへのリンク（内部リンク）の場所と数
   - 記事が参照している外部リンクの有効性
   - 記事の品質（docs/blog-writing.md の基準に照らして）

2. 修正方針メモ(19cbc84fade)の該当記事セクションを読み、修正方針を確認する

3. 以下の技術的事実を確認する:
   - 削除済みツールのスラッグ一覧（記事内で参照されているもの）
   - 代替として案内すべき外部ツール・手段（shasum, sha256sum, certutil等のコマンドラインツール）の適切さ

4. docs/coding-rules.md を読み、技術的制約を確認する

5. docs/targets/ のターゲットユーザー定義を確認し、この記事が誰に向けて価値を提供するのかを明確にする

## 成果物
調査結果をメモとしてpmに返信してください。

