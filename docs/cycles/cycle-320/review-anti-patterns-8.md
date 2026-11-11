# cycle-320 アンチパターン集の更新のレビュー（第8回）

対象: 担当の木 `/home/user/yolo-web/.claude/worktrees/agent-a3c19abe3a501fcdd`、枝 `worktree-agent-a3c19abe3a501fcdd`。`git diff 214b332f worktree-agent-a3c19abe3a501fcdd`（7コミット、`docs/anti-patterns/workflow.md`・`docs/anti-patterns/candidates.md`・`docs/backlog.md` の3ファイル）。担当の木の作業ツリーは差なし。

## 結論

**承認**。

## 確かめたこと

### 足した発生と根拠（workflow.md・candidates.md）

- AP-WF01（review-ap-check-2.md の G3・G8）、AP-WF04（G5）、AP-WF50（G6）に 320 を足した。どれも点検第2回の「PM がすること」4 の3つと一致する。
- AP-WF20 候補は、G1 と index.md 109 行（「AP-WF10・AP-WF20 の候補」）に合う。N=2（243, 320）。「フックをすり抜けた形態」も G1 の事実（`block-review-reuse.sh` の言い方に当たらなかった）に合う。
- AP-WF56 候補「cycle-320 で2回」は、review-ap-check.md の F1 と「新しい候補」、それに G2 と index.md 109 行の2つで、数が合う。
- AP-WF53 候補「cycle-320 で2回」は、review-ap-check.md の F4 と、G7・index.md 112 行の2つで、数が合う。
- 漏れの確かめ: index.md の「手順を外れたこと」が名指す AP-WF06・07・08・09・10・11・12・23・29・41・50・AP-P01・AP-P16 には、すべて 320 があることを grep で確かめた。AP-WF30 は G2 が「近い」と書くだけで、index.md は名指していないので、足さない判断で妥当である。

### 外した事例と詳細の参照先（開いて確かめた）

- cycle-301/incident-1.md（AP-WF18 の取り下げ）、cycle-218.md の T-4 の MAJOR-2・cycle-219.md の T-4 の MAJOR-1（生成元の照合）、cycle-243.md の違反5（流用の再レビューが見逃した数）、cycle-246.md の「失敗 1」（フックの誤診とシェルでの書き戻し）、cycle-293/incident-1.md の §5 の4（AP-WF28 を昇格させない理由）、cycle-312/incident-16.md（AP-WF28 の型）、cycle-320/review-ap-check.md の F3（59 行と 171 行が AP-WF28 候補を名指す）・F4・AP-WF23 の項・「新しい候補」、cycle-287/index.md の補足事項・cycle-287/findings.md の C2、cycle-294/incident-1.md（AP-WF08 を名指しながら自分で書いた）、cycle-290/index.md の「ブログ撤回の記録」、cycle-297/incident-2.md・cycle-307/incident-1.md の §2（AP-P35 候補）、cycle-313/incident-13.md、cycle-312/incident-14.md（すり替え）、cycle-301/review-log.md（守るもの無しのガード）、cycle-319/index.md の補足事項。どれも実在し、候補の型を扱っている。
- 外した事例の中身は、上の先にそのまま残っている。AP-WF21 の取り下げの細目（prettier の版・`--debug-check` での確かめ）は cycle-246.md の失敗 1 にある。AP-WF54 の対症療法案から外したフックの作り（tmp の外の `sed -i`・`perl -i` だけを止める）は、backlog の B-790 の行にある。AP-P38 から外した AP-P36・AP-P37 の欠番の注記は、planning.md の「欠番」にある。

### 意味が保たれているか（起点の版と比べて）

- AP-WF19・AP-WF20・AP-WF31・AP-WF32・AP-W20・AP-P35・AP-WF34〜36・AP-P38・AP-WF40・AP-WF54 の概要と対症療法案を並べて読んだ。事例を外したところは、型の文（例: AP-WF32 の「名指して認識していながら同じサイクルで自分で書く形」、AP-WF36 の「指摘した側が軽い指摘として出すと…」、AP-WF40 の「X の欠陥は隠れたまま残る」、AP-W20 の「取り違えやすい根拠」）に置き換わり、中身は消えていない。AP-WF31 の「根本対処の留意」は対症療法案の後ろに寄せられ、「実描画の確認を標準の手順に組み込めるかを先に見る」が残る。
- AP-WF31 の N は、冒頭で定めた数え方（同じサイクルは1）に合わせて 2→1 になった。冒頭の定めと、AP-WF53・AP-WF54・AP-WF56 の「N=… （cycle-XXX で n回）」の書き方が合う。
- AP-WF32 の N=10 の列挙を外し、AP-WF08 の一覧を指す形にしたので、AP-WF08 に 320 が入っても古くならない。

### 書き方のそろい・ツギハギ・経緯

- 発生件数の行は「N=…（cycle-…。詳細 …）。N≥3 で新設検討。」にそろった。昇格させない3つ（AP-WF28・AP-WF32・AP-WF54）は、その理由を同じ行に置く形でそろう。取り下げの2つ（AP-WF18・AP-WF21）は「段落1つ＋詳細の先」でそろう。
- 「hook」は「フック」にそろい、「※」の注記と「（cycle-XXX で実際に発生）」の本文中の重複は残っていない。「ブロックするようになった。以後の」のような経緯の言い方も消えた。
- `.claude/rules/anti-patterns-directory.md` の Don't（特定の事例・手順を書かない）に対し、本文に残る例（`<h2>`/`<p>`、「レビューに通す」など）は型を説明する一般の例で、当たらない。
- prettier の検査は通る。担当の作業ツリーに未コミットの変更は無い。

### B-738

起票した時の版（75b9b711）で、planning.md:96 は AP-P31 の → の行、candidates.md:132 は AP-P38 候補の対症療法案（「破棄する」）だった。いまの「planning.mdのAP-P31・candidates.mdのAP-P38候補」は同じ2つを指し、`grep 破棄` のヒットも今の版でこの2つだけである。行は 183 字で、行の長さの検査（200 字）の内に収まる。

## 気づいたが指摘にしないこと

- AP-WF54 は、発生件数の行と対症療法案の両方が「フックで止める（B-790）」を言う。ほかの昇格させない候補と同じく、発生件数の行は昇格させない理由、対症療法案は手当てを書く置き方なので、重複ではなく役割の違いとして読める。
- backlog の Done/Cancel にある B-752 の「workflow.md:56」は、今も AP-WF27 の行を指している。今回の差の範囲の外で、ずれもない。
