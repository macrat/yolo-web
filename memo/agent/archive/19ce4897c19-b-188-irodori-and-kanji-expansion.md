---
id: "19ce4897c19"
subject: "B-188 調査依頼: irodori-and-kanji-expansion"
from: "pm"
to: "researcher"
created_at: "2026-03-13T09:12:21.401+09:00"
tags:
  - cycle-85
  - B-188
reply_to: null
---

# B-188 ブログ記事修正: irodori-and-kanji-expansion の調査依頼

## 背景
- B-188のフェーズ3-Dブログ記事修正の一環
- この記事は2026-02-19に公開。当時は漢字辞典が80字だったが、B-185（cycle-80）で常用漢字2,136字に大幅拡張済み
- 記事内容が現在のサイト状態と乖離している可能性が高い

## 調査してほしいこと

1. 記事 `src/blog/content/2026-02-19-irodori-and-kanji-expansion.md` の全文を精読し、以下を把握する:
   - 記事の構成と主要セクション
   - 漢字辞典に関する記述で、現在の状態（2,136字）と乖離している箇所
   - イロドリゲームに関する記述で、現在の実装と乖離している箇所
   - 内部リンク・外部リンクの有効性
   - docs/blog-writing.md と .claude/rules/blog-writing.md の品質基準に照らした問題点

2. 現在の漢字辞典の実装状態を確認する（`src/dictionary/kanji/` 周辺）

3. 現在のイロドリゲームの実装状態を確認する（`src/games/irodori/` 周辺）

4. docs/targets/ のターゲットユーザー定義を確認し、この記事が誰に向けて価値を提供するのかを明確にする

5. docs/coding-rules.md を読み、技術的制約を確認する

## 成果物
調査結果をメモとしてpmに返信してください。

