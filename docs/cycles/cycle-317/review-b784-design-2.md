# B-784 の設計のレビュー（第2回）

対象: [b784-design.md](./b784-design.md) 第2稿。判定: 要修正（minor 4）。reviewer の報告を PM が写した。第1回の6件は解消。数値は実ファイルと一致（index.md 44,304 B・carryover.md 48,948 B。T5 の行だけで 51,492 B あり、T5 をさらに分ける但し書きが要る）。

## 指摘

1. minor: 付け替えの範囲に `cycle-316/t5-inventory.md`（12 行が decisions.md の特定の行を指す。369 行にも言及）が漏れている。範囲を列挙でなく「`grep -rln "decisions" docs .claude` で拾ったもののうち閉じた記録（review-_・incident-_）以外すべて」と書く。
2. minor: Read の実測の切れ目は `head -82 decisions.md | wc -c` で 51,621 B（設計は 52,096 B）。測り方を書いて揃える。上限 50,000 B は切れ目から 3〜4% の余裕しかなく、記号や英数字の多い文書では 50KB 未満で切れうる。2本目の文書でも測るか、40KB の注意が実質の安全線であることを knowledge と残る危険に明示する。
3. minor: pre-commit-check.sh 41 行を `-uall` にするのは、b786 の `.gitignore`（`.claude/worktrees/`）の追加と同じコミットかその後にする（先だと主の木で担当の木の全ファイルが検査の対象に入る）。確かめ方に「主の木の `git status --porcelain -uall` に `.claude/worktrees/` が出ない」を足す。
4. minor: workflow.md の欠番の並び（AP-WF16・22 は「…が機械検出するため、チェックリストから削除した。（cycle-NNN）」）に合わせ、AP-WF17 は「候補（N=3）を本体に置かず、機械検査で担保する（cycle-317）」のように状態と出典まで書き切る。
