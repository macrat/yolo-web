# B-784 の設計のレビュー（第3回）

対象: [b784-design.md](./b784-design.md) 第3稿。判定: 要修正（minor 3）。reviewer の報告を PM が写した。第2回の4件は解消。Read の実測4本と 50KB/40KB の線の意味、B-786 との順序、ツギハギ禁止の扱いは問題なし。

## 指摘

1. minor: T5 の分け先は 4-3 の表で decisions-t5-1.md・decisions-t5-2.md… なのに、carryover.md の付け替えの例と第3節の案内の例が decisions-t5.md（存在しない名前）。例を揃えるか、案内の例を T5 と関係のない名前にする。
2. minor: 「いま当たるのは」の列挙に `docs/anti-patterns/candidates.md` 55 行（AP-WF08 の候補が decisions.md の点検の15巡目の行を指す。付け替え先は decisions-process.md）が漏れている。grep で拾う `docs/research/2026-03-29-…` は無関係（URL の語）で、cycle-317 自身の文書も対象外と一言添える。
3. minor: AP-WF17 の行が workflow.md 81・82 行の形（「…ため、チェックリストから削除した。（cycle-203, 242で実際に発生していた）」）と揃っていない。「…が機械検出するため、本体に置かなかった。（cycle-214, 215, 316で実際に発生していた）」のように揃える。
