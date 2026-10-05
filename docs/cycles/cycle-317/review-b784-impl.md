# B-784 の実装のレビュー（第1回）

対象: 担当の枝 `worktree-agent-ad39c19273fb5d788`（f044286 からの3コミット）。判定: 要修正（major 2・minor 4）。reviewer の報告を PM が写した。

設計の第4節は入っていた。hook は 52,000 B で exit 2 と案内、45,000 B で exit 0、`git commit` 以外と変更なしで exit 0、新しいディレクトリの中も `-uall` で拾った。主の木の `git status --porcelain -uall` に `.claude/worktrees/` は出ない。decisions.md の分割は295行が欠けも重複も無く9本に入り、最大 33,961 B。carryover.md の索引の書き出しはどれも挙げたファイルの行頭にちょうど1回ある。

## 指摘

1. major: 40,000 B を超えたときの注意を stderr に出して exit 0 で終わると、PreToolUse の hook の stderr は debug log にしか行かず、Claude に届かない（https://code.claude.com/docs/en/hooks: "Stderr from a hook that exits 0 goes to the debug log only, never the transcript, and Claude never sees it."）。設計の第3節の誤りが実装に入った。stdout に `{"hookSpecificOutput":{"hookEventName":"PreToolUse","additionalContext":"…"}}` を jq で組んで出し（`permissionDecision` は付けない）、Claude の文脈に届くことを確かめる。
2. major: `docs/anti-patterns/workflow.md` 87 行（AP-WF52）と `candidates.md` 49 行（AP-WF32 候補）が実在しない `cycle-316/decisions-process.md` を指す。「点検の15巡目」の行は `decisions-process-4.md`。
3. minor: 分けたファイルに、別のファイルへ移った行を「上の」「下の」で指す言い方が約30か所残る。別のファイルを指すものだけ「decisions-xxx.md の X」に置き換え、同じファイルの中を指すものは残す。
4. minor: cycle-316/index.md 182 行の「decisions.md の各行」（実際は decisions-process-1〜4.md）と 169 行の「decisions.md に記録した」（decisions-process-1.md と decisions-t4.md）を、移した先に付け替える。
5. minor: decisions.md の索引の T1-T3・T4・T6-T12 の行に、設計の例のようなタスクの範囲が無い。足すか、違う形にしたことを記録する。
6. minor: carryover.md は 49,776 B で上限まで 224 B。次に書き足す者が止まることを残る危険として記録する。

## 第2回

判定: 要修正（major 2）。1〜5は解消（注意の JSON は一時リポジトリで確かめた。「上の」「下の」の振り分けは抜き取りで取り違えなし）。

1. major: 指摘6（carryover.md の余裕 224 B）がどこにも記録されていない。
2. major: 新しい規則と hook の注意の線（40,000 B 以下に保つ）を、後続が毎回読む cycle-316 の carryover.md（49,776 B）と index.md（44,632 B）自身が超えている。記録では解けない。設計 4-3 と同じやり方でタスクごとの別ファイルに分けて 40,000 B 以下にする（規則に例外を書き足すことはしない）。

PM の判断: 2 のとおり cycle-316 の carryover.md と index.md も分ける。分ければ 1 の危険も消える。

## 第3回

判定: 要修正（minor 3）。第2回の2件は解消（index.md 26,646 B・completion-criteria.md 18,467 B・carryover.md 12,607 B・carryover-tasks.md 37,587 B。元の行は付け替えを除いて欠けも重複も無い。index.md は TEMPLATE.md の構成を保つ）。いまの index.md に無い T5〜T10 の行への参照の付け替えは抜き取りで正しい。

1. minor: t6-design.md 37 行の「index.md の favicon の完了の条件」は completion-criteria.md にだけある。付け替える。
2. minor: いまの index.md に無い「PM の決定」「補足の決定」を index.md として指す参照が残る（t5-8b-design.md 307、t5-design.md 852、t5-20f-design.md 481・501・526・528・529・553・554・656・658、t3-completion.md 106・117・216・221・222・223・281、t3-design.md 592）。行の書き出しで検索して移った先の decisions-*.md に付け替える。
3. minor: t2-inventory.md 298 行の「index.md の T2 以外の行」は、T5〜T12 の原文がいま carryover-tasks.md にあるので「index.md と carryover-tasks.md の、T2 以外の行」にする。

## builder が判断を求めた点への PM の判断

- carryover.md の索引を、書き出しごとにファイル名を括弧で添える形（設計 4-3）でなく、タスクの行の中でファイルごとにまとめる形にしたこと: 認める。添えると 50,979 B で上限を超えるため。reviewer も賛成し、すべての書き出しが挙げたファイルで見つかることを確かめた。
- 分けたファイルの「上の」「下の」: 指摘3のとおり直す。設計は行を中身を変えずに移すとしたが、指す先に着けないのは索引にする目的を損なう。指す先の言い方を直すのは中身を変えることに当たらない。
- 設計の第3節（注意を stderr に出す）は誤りで、正しくは指摘1の形。b784-design.md の第3節は、実装に合わせて直す。
